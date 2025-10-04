import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';
import { User } from '@/lib/models/User';

// GET /api/admin/analytics - Admin: System analytics
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y, all
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date | null = null;
    
    if (period !== 'all') {
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = startDate;
    }
    
    // Get system-wide analytics
    const systemStats = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $match: startDate ? { createdAt: dateFilter } : {}
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $ne: ['$isDeleted', true] }, 1, 0] }
            },
            usersWithWallets: {
              $sum: { $cond: [{ $ne: ['$blockradarWalletId', null] }, 1, 0] }
            },
            usersWithOnboarding: {
              $sum: { $cond: [{ $eq: ['$isOnboardingComplete', true] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Payment statistics
      Payment.aggregate([
        {
          $match: startDate ? { createdAt: dateFilter } : {}
        },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            completedPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failedPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            pendingPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            totalRevenueUSD: { $sum: '$amountUSD' },
            totalRevenueUSDC: { $sum: '$amountUSDC' },
            completedRevenueUSD: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amountUSD', 0] }
            },
            completedRevenueUSDC: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amountUSDC', 0] }
            },
            avgPaymentUSD: { $avg: '$amountUSD' },
            avgPaymentUSDC: { $avg: '$amountUSDC' }
          }
        }
      ]),
      
      // Product statistics
      Product.aggregate([
        {
          $match: startDate ? { createdAt: dateFilter } : {}
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            totalProductValueUSD: { $sum: '$priceUSD' }
          }
        }
      ])
    ]);
    
    const [userStats, paymentStats, productStats] = systemStats;
    
    // Get daily metrics for charts
    const dailyMetrics = await Payment.aggregate([
      {
        $match: startDate ? { createdAt: dateFilter } : {}
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          paymentCount: { $sum: 1 },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          revenueUSD: { $sum: '$amountUSD' },
          completedRevenueUSD: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amountUSD', 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get top performing products
    const topProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'productId',
          as: 'payments'
        }
      },
      {
        $project: {
          name: 1,
          priceUSD: 1,
          category: 1,
          paymentCount: { $size: '$payments' },
          totalRevenueUSD: {
            $sum: {
              $map: {
                input: '$payments',
                as: 'payment',
                in: { $cond: [{ $eq: ['$$payment.status', 'completed'] }, '$$payment.amountUSD', 0] }
              }
            }
          }
        }
      },
      { $sort: { totalRevenueUSD: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top sellers
    const topSellers = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$sellerId',
          paymentCount: { $sum: 1 },
          totalRevenueUSD: { $sum: '$amountUSD' },
          totalRevenueUSDC: { $sum: '$amountUSDC' }
        }
      },
      { $sort: { totalRevenueUSD: -1 } },
      { $limit: 10 }
    ]);
    
    // Get seller details for top sellers
    const topSellerDetails = await Promise.all(
      topSellers.map(async (seller) => {
        const sellerDetails = await User.findOne({ clerkId: seller._id });
        return {
          sellerId: seller._id,
          sellerName: sellerDetails ? `${sellerDetails.firstName} ${sellerDetails.lastName}` : 'Unknown',
          sellerEmail: sellerDetails?.email || 'Unknown',
          paymentCount: seller.paymentCount,
          totalRevenueUSD: seller.totalRevenueUSD,
          totalRevenueUSDC: seller.totalRevenueUSDC,
        };
      })
    );
    
    // Get payout statistics
    const payoutStats = await Payment.aggregate([
      {
        $match: { 
          payoutStatus: { $exists: true },
          ...(startDate ? { createdAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$payoutStatus',
          count: { $sum: 1 },
          totalAmountUSD: { $sum: '$amountUSD' },
          totalAmountUSDC: { $sum: '$amountUSDC' }
        }
      }
    ]);
    
    const userMetrics = userStats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      usersWithWallets: 0,
      usersWithOnboarding: 0,
    };
    
    const paymentMetrics = paymentStats[0] || {
      totalPayments: 0,
      completedPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      totalRevenueUSD: 0,
      totalRevenueUSDC: 0,
      completedRevenueUSD: 0,
      completedRevenueUSDC: 0,
      avgPaymentUSD: 0,
      avgPaymentUSDC: 0,
    };
    
    const productMetrics = productStats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      totalProductValueUSD: 0,
    };
    
    return NextResponse.json({
      success: true,
      analytics: {
        period,
        overview: {
          users: {
            total: userMetrics.totalUsers,
            active: userMetrics.activeUsers,
            withWallets: userMetrics.usersWithWallets,
            withOnboarding: userMetrics.usersWithOnboarding,
            walletAdoptionRate: userMetrics.totalUsers > 0 
              ? ((userMetrics.usersWithWallets / userMetrics.totalUsers) * 100).toFixed(2)
              : 0,
            onboardingRate: userMetrics.totalUsers > 0 
              ? ((userMetrics.usersWithOnboarding / userMetrics.totalUsers) * 100).toFixed(2)
              : 0,
          },
          payments: {
            total: paymentMetrics.totalPayments,
            completed: paymentMetrics.completedPayments,
            failed: paymentMetrics.failedPayments,
            pending: paymentMetrics.pendingPayments,
            successRate: paymentMetrics.totalPayments > 0 
              ? ((paymentMetrics.completedPayments / paymentMetrics.totalPayments) * 100).toFixed(2)
              : 0,
          },
          revenue: {
            totalUSD: paymentMetrics.totalRevenueUSD,
            totalUSDC: paymentMetrics.totalRevenueUSDC,
            completedUSD: paymentMetrics.completedRevenueUSD,
            completedUSDC: paymentMetrics.completedRevenueUSDC,
            avgPaymentUSD: paymentMetrics.avgPaymentUSD,
            avgPaymentUSDC: paymentMetrics.avgPaymentUSDC,
          },
          products: {
            total: productMetrics.totalProducts,
            active: productMetrics.activeProducts,
            totalValueUSD: productMetrics.totalProductValueUSD,
          }
        },
        charts: {
          dailyMetrics: dailyMetrics.map(day => ({
            date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
            paymentCount: day.paymentCount,
            completedPayments: day.completedPayments,
            revenueUSD: day.revenueUSD,
            completedRevenueUSD: day.completedRevenueUSD,
          }))
        },
        topPerformers: {
          products: topProducts.map(product => ({
            id: product._id,
            name: product.name,
            priceUSD: product.priceUSD,
            category: product.category,
            paymentCount: product.paymentCount,
            totalRevenueUSD: product.totalRevenueUSD,
          })),
          sellers: topSellerDetails,
        },
        payouts: {
          byStatus: payoutStats.map(stat => ({
            status: stat._id,
            count: stat.count,
            totalAmountUSD: stat.totalAmountUSD,
            totalAmountUSDC: stat.totalAmountUSDC,
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
