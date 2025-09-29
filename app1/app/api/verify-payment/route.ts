import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import { verifyUSDCTransaction, BlockchainVerificationError } from '@/lib/blockchain-verification';

// POST /api/verify-payment - Verify a USDC transaction
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { transactionHash, paymentId } = body;
    
    if (!transactionHash || !paymentId) {
      return NextResponse.json(
        { error: 'Transaction hash and payment ID are required' },
        { status: 400 }
      );
    }
    
    // Get payment details
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment is not pending' },
        { status: 400 }
      );
    }
    
    try {
      // Verify the transaction
      const verification = await verifyUSDCTransaction(
        transactionHash,
        payment.sellerId,
        payment.amountUSDC
      );
      
      if (verification.isValid) {
        // Update payment status
        const updatedPayment = await Payment.updateStatus(
          paymentId,
          'completed',
          transactionHash
        );
        
        return NextResponse.json({
          success: true,
          verified: true,
          payment: {
            id: updatedPayment._id,
            status: updatedPayment.status,
            transactionHash: updatedPayment.transactionHash,
            completedAt: updatedPayment.completedAt,
          },
          verification: {
            actualAmount: verification.actualAmount,
            actualRecipient: verification.actualRecipient,
            confirmations: verification.confirmations,
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          verified: false,
          error: 'Transaction verification failed'
        });
      }
      
    } catch (error) {
      if (error instanceof BlockchainVerificationError) {
        return NextResponse.json({
          success: false,
          verified: false,
          error: error.message,
          code: error.code,
          details: error.details
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
