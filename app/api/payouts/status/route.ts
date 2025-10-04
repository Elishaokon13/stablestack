import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import { getPayoutStatus } from '@/lib/blockradar';

// GET /api/payouts/status - Check payout status
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const transactionId = searchParams.get('transactionId');
    const sellerId = searchParams.get('sellerId');

    if (!paymentId && !transactionId && !sellerId) {
      return NextResponse.json(
        { error: 'Either paymentId, transactionId, or sellerId is required' },
        { status: 400 }
      );
    }

    let payments: any[] = [];
    
    if (paymentId) {
      const payment = await Payment.findById(paymentId);
      if (payment) payments = [payment];
    } else if (transactionId) {
      const payment = await Payment.findOne({ blockradarTransactionId: transactionId });
      if (payment) payments = [payment];
    } else if (sellerId) {
      payments = await Payment.find({ 
        sellerId,
        payoutStatus: { $exists: true }
      }).sort({ payoutInitiatedAt: -1 });
    }

    if (payments.length === 0) {
      return NextResponse.json(
        { error: 'No payouts found' },
        { status: 404 }
      );
    }

    // Get payout status from Blockradar for each payment
    const payoutStatuses = await Promise.all(
      payments.map(async (payment) => {
        if (!payment.blockradarTransactionId) {
          return {
            paymentId: payment._id,
            status: 'not_initiated',
            error: 'No Blockradar transaction ID found'
          };
        }

        const statusResult = await getPayoutStatus({
          transactionId: payment.blockradarTransactionId,
          paymentId: payment._id.toString(),
        });

        return {
          paymentId: payment._id,
          transactionId: payment.blockradarTransactionId,
          status: statusResult.success ? statusResult.status : 'error',
          details: statusResult.success ? statusResult.details : null,
          error: statusResult.success ? null : statusResult.error,
          lastChecked: new Date().toISOString(),
        };
      })
    );

    // Update payment statuses in database if they've changed
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const statusInfo = payoutStatuses[i];
      
      if (statusInfo.status !== payment.payoutStatus) {
        await Payment.findByIdAndUpdate(payment._id, {
          payoutStatus: statusInfo.status,
          payoutLastChecked: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      payouts: payoutStatuses.map((status, index) => ({
        paymentId: status.paymentId,
        transactionId: status.transactionId,
        status: status.status,
        details: status.details,
        error: status.error,
        lastChecked: status.lastChecked,
        payment: {
          id: payments[index]._id,
          amountUSD: payments[index].amountUSD,
          amountUSDC: payments[index].amountUSDC,
          sellerId: payments[index].sellerId,
          payoutInitiatedAt: payments[index].payoutInitiatedAt,
          payoutLastChecked: payments[index].payoutLastChecked,
        }
      }))
    });

  } catch (error) {
    console.error('Error checking payout status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
