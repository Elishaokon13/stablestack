import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import { createRefund } from '@/lib/stripe';

// Validation schema for refund request
const refundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().min(0.01, 'Refund amount must be greater than 0').optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  metadata: z.object({
    reason: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

// POST /api/payments/refund - Process refund for a payment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = refundSchema.parse(body);

    // Get payment details
    const payment = await Payment.findById(validatedData.paymentId);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    if (!payment.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Payment does not have a Stripe payment intent' },
        { status: 400 }
      );
    }

    // Create refund via Stripe
    const refundResult = await createRefund({
      paymentIntentId: payment.stripePaymentIntentId,
      amount: validatedData.amount ? Math.round(validatedData.amount * 100) : undefined, // Convert to cents
      reason: validatedData.reason,
      metadata: validatedData.metadata,
    });

    if (!refundResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: refundResult.error || 'Failed to create refund' 
        },
        { status: 500 }
      );
    }

    // Update payment with refund info
    const updatedPayment = await Payment.findByIdAndUpdate(
      validatedData.paymentId,
      {
        refundStatus: 'initiated',
        refundId: refundResult.refundId,
        refundAmount: validatedData.amount || payment.amountUSD,
        refundReason: validatedData.reason,
        refundMetadata: validatedData.metadata,
        refundedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      refund: {
        paymentId: validatedData.paymentId,
        refundId: refundResult.refundId,
        amount: validatedData.amount || payment.amountUSD,
        reason: validatedData.reason,
        status: 'initiated',
        refundedAt: updatedPayment.refundedAt,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error processing refund:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
