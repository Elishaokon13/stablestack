import { NextRequest, NextResponse } from 'next/server';
import { createWallet } from '@/lib/blockradar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currency = 'USDC', label, userId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create wallet
    const result = await createWallet(currency, label || `Wallet for user ${userId}`);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // TODO: Store wallet in database with user association
    // TODO: Generate dedicated address for user

    return NextResponse.json({
      wallet: result.wallet,
      message: 'Wallet created successfully',
    });
  } catch (error) {
    console.error('Error in create wallet API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
