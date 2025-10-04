import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import { User } from '@/lib/models/User';
import { initiateStablecoinPayout } from '@/lib/blockradar';

// Validation schema for payout initiation
const initiatePayoutSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  sellerId: z.string().min(1, 'Seller ID is required'),
  amountUSDC: z.number().min(0, 'Amount must be positive'),
  currency: z.string().default('USDC'),
});

// POST /api/payouts/initiate - Initiate stablecoin payout to merchant
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = initiatePayoutSchema.parse(body);

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
        { error: 'Payment must be completed before payout' },
        { status: 400 }
      );
    }

    if (payment.payoutStatus === 'initiated' || payment.payoutStatus === 'completed') {
      return NextResponse.json(
        { error: 'Payout already initiated or completed' },
        { status: 400 }
      );
    }

    // Get seller's wallet info
    const seller = await User.findOne({ clerkId: validatedData.sellerId });
    
    if (!seller || !seller.blockradarWalletId || !seller.walletAddress) {
      return NextResponse.json(
        { error: 'Seller does not have a wallet configured' },
        { status: 400 }
      );
    }

    // Initiate stablecoin payout
    const payoutResult = await initiateStablecoinPayout({
      paymentId: validatedData.paymentId,
      sellerId: validatedData.sellerId,
      amountUSDC: validatedData.amountUSDC,
      currency: validatedData.currency,
      sellerWalletId: seller.blockradarWalletId,
      sellerWalletAddress: seller.walletAddress,
    });

    if (!payoutResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: payoutResult.error || 'Failed to initiate payout' 
        },
        { status: 500 }
      );
    }

    // Update payment with payout info
    const updatedPayment = await Payment.findByIdAndUpdate(
      validatedData.paymentId,
      {
        blockradarTransactionId: payoutResult.transactionId,
        payoutStatus: 'initiated',
        payoutInitiatedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      payout: {
        paymentId: validatedData.paymentId,
        transactionId: payoutResult.transactionId,
        status: 'initiated',
        amountUSDC: validatedData.amountUSDC,
        currency: validatedData.currency,
        sellerWalletAddress: seller.walletAddress,
        initiatedAt: updatedPayment.payoutInitiatedAt,
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

    console.error('Error initiating payout:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}