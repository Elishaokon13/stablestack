import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';

// GET /api/analytics/revenue - Get revenue analytics
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y, all
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month
    
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }
    
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
    
    // Build query
    const query: any = { 
      sellerId,
      status: 'completed'
    };
    
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }
    
    // Get revenue metrics
    const revenueMetrics = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenueUSD: { $sum: '$amountUSD' },
          totalRevenueUSDC: { $sum: '$amountUSDC' },
          totalPayments: { $sum: 1 },
          avgPaymentUSD: { $avg: '$amountUSD' },
          avgPaymentUSDC: { $avg: '$amountUSDC' },
          minPaymentUSD: { $min: '$amountUSD' },
          maxPaymentUSD: { $max: '$amountUSD' },
        }
      }
    ]);
    
    // Get revenue by time period
    let groupByFormat: any = {};
    switch (groupBy) {
      case 'day':
        groupByFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        groupByFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupByFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
    }
    
    const revenueByPeriod = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupByFormat,
          revenueUSD: { $sum: '$amountUSD' },
          revenueUSDC: { $sum: '$amountUSDC' },
          paymentCount: { $sum: 1 },
          avgPaymentUSD: { $avg: '$amountUSD' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);
    
    // Get revenue by product
    const revenueByProduct = await Product.aggregate([
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
          totalRevenueUSD: {
            $sum: {
              $map: {
                input: '$payments',
                as: 'payment',
                in: { $cond: [{ $eq: ['$$payment.status', 'completed'] }, '$$payment.amountUSD', 0] }
              }
            }
          },
          totalRevenueUSDC: {
            $sum: {
              $map: {
                input: '$payments',
                as: 'payment',
                in: { $cond: [{ $eq: ['$$payment.status', 'completed'] }, '$$payment.amountUSDC', 0] }
              }
            }
          }
        }
      },
      { $sort: { totalRevenueUSD: -1 } }
    ]);
    
    // Get revenue trends (month-over-month growth)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [currentMonthRevenue, lastMonthRevenue] = await Promise.all([
      Payment.aggregate([
        { 
          $match: { 
            sellerId,
            status: 'completed',
            createdAt: { $gte: currentMonth }
          } 
        },
        {
          $group: {
            _id: null,
            revenueUSD: { $sum: '$amountUSD' },
            paymentCount: { $sum: 1 }
          }
        }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            sellerId,
            status: 'completed',
            createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
          } 
        },
        {
          $group: {
            _id: null,
            revenueUSD: { $sum: '$amountUSD' },
            paymentCount: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const currentRevenue = currentMonthRevenue[0]?.revenueUSD || 0;
    const previousRevenue = lastMonthRevenue[0]?.revenueUSD || 0;
    const growthRate = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2)
      : 0;
    
    const metrics = revenueMetrics[0] || {
      totalRevenueUSD: 0,
      totalRevenueUSDC: 0,
      totalPayments: 0,
      avgPaymentUSD: 0,
      avgPaymentUSDC: 0,
      minPaymentUSD: 0,
      maxPaymentUSD: 0,
    };
    
    return NextResponse.json({
      success: true,
      revenue: {
        period,
        summary: {
          totalRevenueUSD: metrics.totalRevenueUSD,
          totalRevenueUSDC: metrics.totalRevenueUSDC,
          totalPayments: metrics.totalPayments,
          avgPaymentUSD: metrics.avgPaymentUSD,
          avgPaymentUSDC: metrics.avgPaymentUSDC,
          minPaymentUSD: metrics.minPaymentUSD,
          maxPaymentUSD: metrics.maxPaymentUSD,
        },
        trends: {
          currentMonthRevenue,
          lastMonthRevenue,
          growthRate: parseFloat(growthRate.toString()),
          isGrowing: parseFloat(growthRate.toString()) > 0,
        },
        byPeriod: revenueByPeriod.map(period => ({
          period: groupBy === 'day' 
            ? `${period._id.year}-${String(period._id.month).padStart(2, '0')}-${String(period._id.day).padStart(2, '0')}`
            : groupBy === 'week'
            ? `${period._id.year}-W${String(period._id.week).padStart(2, '0')}`
            : `${period._id.year}-${String(period._id.month).padStart(2, '0')}`,
          revenueUSD: period.revenueUSD,
          revenueUSDC: period.revenueUSDC,
          paymentCount: period.paymentCount,
          avgPaymentUSD: period.avgPaymentUSD,
        })),
        byProduct: revenueByProduct.map(product => ({
          id: product._id,
          name: product.name,
          priceUSD: product.priceUSD,
          paymentCount: product.paymentCount,
          totalRevenueUSD: product.totalRevenueUSD,
          totalRevenueUSDC: product.totalRevenueUSDC,
          revenueShare: metrics.totalRevenueUSD > 0 
            ? ((product.totalRevenueUSD / metrics.totalRevenueUSD) * 100).toFixed(2)
            : 0,
        })),
      }
    });
    
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
