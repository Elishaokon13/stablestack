import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';

// GET /api/payments/history - Get user's payment history
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sellerId = searchParams.get('sellerId');
    const buyerId = searchParams.get('buyerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId && !sellerId && !buyerId) {
      return NextResponse.json(
        { error: 'Either userId, sellerId, or buyerId is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {};
    
    if (userId) {
      query.$or = [
        { sellerId: userId },
        { buyerId: userId }
      ];
    } else if (sellerId) {
      query.sellerId = sellerId;
    } else if (buyerId) {
      query.buyerId = buyerId;
    }

    if (status) {
      query.status = status;
    }

    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('productId', 'name description priceUSD imageUrl category');

    // Get total count for pagination
    const totalCount = await Payment.countDocuments(query);

    // Get summary statistics
    const summary = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmountUSD: { $sum: '$amountUSD' },
          totalAmountUSDC: { $sum: '$amountUSDC' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmountUSD: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amountUSD', 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = summary[0] || {
      totalPayments: 0,
      totalAmountUSD: 0,
      totalAmountUSDC: 0,
      completedPayments: 0,
      completedAmountUSD: 0,
      failedPayments: 0,
      pendingPayments: 0
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
        paymentLink: payment.paymentLink,
        transactionHash: payment.transactionHash,
        blockradarTransactionId: payment.blockradarTransactionId,
        payoutStatus: payment.payoutStatus,
        failureReason: payment.failureReason,
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
          imageUrl: payment.productId.imageUrl,
          category: payment.productId.category,
        } : null,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      summary: {
        totalPayments: stats.totalPayments,
        totalAmountUSD: stats.totalAmountUSD,
        totalAmountUSDC: stats.totalAmountUSDC,
        completedPayments: stats.completedPayments,
        completedAmountUSD: stats.completedAmountUSD,
        failedPayments: stats.failedPayments,
        pendingPayments: stats.pendingPayments,
        successRate: stats.totalPayments > 0 
          ? ((stats.completedPayments / stats.totalPayments) * 100).toFixed(2)
          : 0,
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
