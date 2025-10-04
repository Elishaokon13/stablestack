import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';
import { User } from '@/lib/models/User';

// GET /api/analytics/dashboard - Get dashboard summary data
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get dashboard metrics
    const metrics = await Payment.aggregate([
      {
        $match: {
          sellerId,
          createdAt: { $gte: startDate }
        }
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
          avgPaymentUSDC: { $avg: '$amountUSDC' },
        }
      }
    ]);
    
    // Get daily revenue for chart
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          sellerId,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenueUSD: { $sum: '$amountUSD' },
          revenueUSDC: { $sum: '$amountUSDC' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    // Get top products
    const topProducts = await Product.aggregate([
      { $match: { sellerId } },
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
          paymentCount: { $size: '$payments' },
          totalRevenue: {
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
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    
    // Get recent activity
    const recentActivity = await Payment.find({
      sellerId,
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('productId', 'name description priceUSD');
    
    const stats = metrics[0] || {
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
    
    return NextResponse.json({
      success: true,
      dashboard: {
        period,
        summary: {
          totalPayments: stats.totalPayments,
          completedPayments: stats.completedPayments,
          failedPayments: stats.failedPayments,
          pendingPayments: stats.pendingPayments,
          successRate: stats.totalPayments > 0 
            ? ((stats.completedPayments / stats.totalPayments) * 100).toFixed(2)
            : 0,
        },
        revenue: {
          totalUSD: stats.totalRevenueUSD,
          totalUSDC: stats.totalRevenueUSDC,
          completedUSD: stats.completedRevenueUSD,
          completedUSDC: stats.completedRevenueUSDC,
          avgPaymentUSD: stats.avgPaymentUSD,
          avgPaymentUSDC: stats.avgPaymentUSDC,
        },
        charts: {
          dailyRevenue: dailyRevenue.map(day => ({
            date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
            revenueUSD: day.revenueUSD,
            revenueUSDC: day.revenueUSDC,
            paymentCount: day.paymentCount,
          }))
        },
        topProducts: topProducts.map(product => ({
          id: product._id,
          name: product.name,
          priceUSD: product.priceUSD,
          paymentCount: product.paymentCount,
          totalRevenue: product.totalRevenue,
        })),
        recentActivity: recentActivity.map(payment => ({
          id: payment._id,
          amountUSD: payment.amountUSD,
          amountUSDC: payment.amountUSDC,
          status: payment.status,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
          product: payment.productId ? {
            id: payment.productId._id,
            name: payment.productId.name,
            description: payment.productId.description,
            priceUSD: payment.productId.priceUSD,
          } : null,
        })),
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
