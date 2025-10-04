import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';

// GET /api/analytics/reconciliation - Get payment reconciliation data
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    const query: any = { sellerId };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }
    
    // Get reconciliation data
    const reconciliation = await Payment.aggregate([
      { $match: query },
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
          totalAmountUSD: { $sum: '$amountUSD' },
          totalAmountUSDC: { $sum: '$amountUSDC' },
          completedAmountUSD: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amountUSD', 0] }
          },
          completedAmountUSDC: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amountUSDC', 0] }
          },
          avgPaymentUSD: { $avg: '$amountUSD' },
          avgPaymentUSDC: { $avg: '$amountUSDC' },
        }
      }
    ]);
    
    // Get recent payments for reconciliation
    const recentPayments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('productId', 'name description priceUSD');
    
    // Get products with payment counts
    const productStats = await Product.aggregate([
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
      { $sort: { paymentCount: -1 } }
    ]);
    
    const stats = reconciliation[0] || {
      totalPayments: 0,
      completedPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      totalAmountUSD: 0,
      totalAmountUSDC: 0,
      completedAmountUSD: 0,
      completedAmountUSDC: 0,
      avgPaymentUSD: 0,
      avgPaymentUSDC: 0,
    };
    
    return NextResponse.json({
      success: true,
      reconciliation: {
        summary: {
          totalPayments: stats.totalPayments,
          completedPayments: stats.completedPayments,
          failedPayments: stats.failedPayments,
          pendingPayments: stats.pendingPayments,
          successRate: stats.totalPayments > 0 
            ? ((stats.completedPayments / stats.totalPayments) * 100).toFixed(2)
            : 0,
        },
        amounts: {
          totalUSD: stats.totalAmountUSD,
          totalUSDC: stats.totalAmountUSDC,
          completedUSD: stats.completedAmountUSD,
          completedUSDC: stats.completedAmountUSDC,
          avgPaymentUSD: stats.avgPaymentUSD,
          avgPaymentUSDC: stats.avgPaymentUSDC,
        },
        recentPayments: recentPayments.map(payment => ({
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
        productStats: productStats.map(product => ({
          id: product._id,
          name: product.name,
          priceUSD: product.priceUSD,
          paymentCount: product.paymentCount,
          totalRevenue: product.totalRevenue,
        })),
      }
    });
    
  } catch (error) {
    console.error('Error fetching reconciliation data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
