import { NextRequest, NextResponse } from 'next/server';
import { getWalletBalance } from '@/lib/blockradar';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    // Get wallet balance
    const result = await getWalletBalance(walletId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: result.balance,
    });
  } catch (error) {
    console.error('Error in get balance API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
