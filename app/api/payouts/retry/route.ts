import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import { User } from '@/lib/models/User';
import { initiateStablecoinPayout } from '@/lib/blockradar';

// Validation schema for payout retry
const retryPayoutSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  reason: z.string().optional(),
});

// POST /api/payouts/retry - Retry failed payout
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = retryPayoutSchema.parse(body);

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
        { error: 'Payment must be completed before retrying payout' },
        { status: 400 }
      );
    }

    if (payment.payoutStatus === 'completed') {
      return NextResponse.json(
        { error: 'Payout is already completed' },
        { status: 400 }
      );
    }

    // Get seller's wallet info
    const seller = await User.findOne({ clerkId: payment.sellerId });
    
    if (!seller || !seller.blockradarWalletId || !seller.walletAddress) {
      return NextResponse.json(
        { error: 'Seller does not have a wallet configured' },
        { status: 400 }
      );
    }

    // Retry stablecoin payout
    const payoutResult = await initiateStablecoinPayout({
      paymentId: validatedData.paymentId,
      sellerId: payment.sellerId,
      amountUSDC: payment.amountUSDC,
      currency: 'USDC',
      sellerWalletId: seller.blockradarWalletId,
      sellerWalletAddress: seller.walletAddress,
    });

    if (!payoutResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: payoutResult.error || 'Failed to retry payout' 
        },
        { status: 500 }
      );
    }

    // Update payment with new payout info
    const updatedPayment = await Payment.findByIdAndUpdate(
      validatedData.paymentId,
      {
        blockradarTransactionId: payoutResult.transactionId,
        payoutStatus: 'retrying',
        payoutRetryCount: (payment.payoutRetryCount || 0) + 1,
        payoutRetryReason: validatedData.reason,
        payoutRetriedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      payout: {
        paymentId: validatedData.paymentId,
        transactionId: payoutResult.transactionId,
        status: 'retrying',
        amountUSDC: payment.amountUSDC,
        currency: 'USDC',
        sellerWalletAddress: seller.walletAddress,
        retryCount: updatedPayment.payoutRetryCount,
        retryReason: validatedData.reason,
        retriedAt: updatedPayment.payoutRetriedAt,
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

    console.error('Error retrying payout:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
