import { NextRequest, NextResponse } from 'next/server';
import { createTransaction } from '@/lib/blockradar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fromWalletId, 
      toAddress, 
      amount, 
      currency = 'USDC', 
      memo,
      paymentId 
    } = body;

    // Validate required fields
    if (!fromWalletId || !toAddress || !amount) {
      return NextResponse.json(
        { error: 'fromWalletId, toAddress, and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create transaction
    const result = await createTransaction(
      fromWalletId,
      toAddress,
      amount,
      currency,
      memo
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // TODO: Store payout record in database
    // TODO: Link payout to payment record
    // TODO: Set up transaction monitoring

    return NextResponse.json({
      transaction: result.transaction,
      message: 'Payout initiated successfully',
    });
  } catch (error) {
    console.error('Error in initiate payout API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
