import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';
import { User } from '@/lib/models/User';

// GET /api/admin/payments - Admin: All payments overview
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const sellerId = searchParams.get('sellerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (sellerId) {
      query.sellerId = sellerId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit)
      .skip(offset)
      .populate('productId', 'name description priceUSD category')
      .populate('sellerId', 'firstName lastName email walletAddress');

    // Get total count for pagination
    const totalCount = await Payment.countDocuments(query);

    // Get payment statistics
    const stats = await Payment.aggregate([
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
    ]);

    // Get payout statistics
    const payoutStats = await Payment.aggregate([
      {
        $match: { payoutStatus: { $exists: true } }
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

    const paymentStats = stats[0] || {
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
      payments: payments.map(payment => ({
        id: payment._id,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        productId: payment.productId,
        sellerId: payment.sellerId,
        buyerId: payment.buyerId,
        amountUSD: payment.amountUSD,
        amountUSDC: payment.amountUSDC,
        status: payment.status,
        payoutStatus: payment.payoutStatus,
        transactionHash: payment.transactionHash,
        blockradarTransactionId: payment.blockradarTransactionId,
        buyerEmail: payment.buyerEmail,
        buyerName: payment.buyerName,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        product: payment.productId ? {
          id: payment.productId._id,
          name: payment.productId.name,
          description: payment.productId.description,
          priceUSD: payment.productId.priceUSD,
          category: payment.productId.category,
        } : null,
        seller: payment.sellerId ? {
          id: payment.sellerId._id,
          name: `${payment.sellerId.firstName} ${payment.sellerId.lastName}`,
          email: payment.sellerId.email,
          walletAddress: payment.sellerId.walletAddress,
        } : null,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      statistics: {
        payments: {
          total: paymentStats.totalPayments,
          completed: paymentStats.completedPayments,
          failed: paymentStats.failedPayments,
          pending: paymentStats.pendingPayments,
          successRate: paymentStats.totalPayments > 0 
            ? ((paymentStats.completedPayments / paymentStats.totalPayments) * 100).toFixed(2)
            : 0,
        },
        revenue: {
          totalUSD: paymentStats.totalRevenueUSD,
          totalUSDC: paymentStats.totalRevenueUSDC,
          completedUSD: paymentStats.completedRevenueUSD,
          completedUSDC: paymentStats.completedRevenueUSDC,
          avgPaymentUSD: paymentStats.avgPaymentUSD,
          avgPaymentUSDC: paymentStats.avgPaymentUSDC,
        },
        payouts: payoutStats.map(stat => ({
          status: stat._id,
          count: stat.count,
          totalAmountUSD: stat.totalAmountUSD,
          totalAmountUSDC: stat.totalAmountUSDC,
        })),
        topSellers: topSellerDetails,
      }
    });

  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
