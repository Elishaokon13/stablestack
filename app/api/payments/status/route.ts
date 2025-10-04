import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';

// GET /api/payments/status - Get payment status by ID or payment intent
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const stripePaymentIntentId = searchParams.get('stripePaymentIntentId');
    const paymentLink = searchParams.get('paymentLink');

    if (!paymentId && !stripePaymentIntentId && !paymentLink) {
      return NextResponse.json(
        { error: 'Either paymentId, stripePaymentIntentId, or paymentLink is required' },
        { status: 400 }
      );
    }

    let payment;
    
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    } else if (stripePaymentIntentId) {
      payment = await Payment.findOne({ stripePaymentIntentId });
    } else if (paymentLink) {
      payment = await Payment.findOne({ paymentLink });
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get product details if available
    let product = null;
    if (payment.productId) {
      product = await Product.findById(payment.productId);
    }

    return NextResponse.json({
      success: true,
      payment: {
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
        product: product ? {
          id: product._id,
          name: product.name,
          description: product.description,
          priceUSD: product.priceUSD,
          imageUrl: product.imageUrl,
          category: product.category,
        } : null,
      }
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
