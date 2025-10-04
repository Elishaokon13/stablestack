import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { User } from '@/lib/models/User';
import { getWalletBalance } from '@/lib/blockradar';

// GET /api/wallets/balance - Get user's wallet balance
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const walletAddress = searchParams.get('walletAddress');

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { error: 'Either userId or walletAddress is required' },
        { status: 400 }
      );
    }

    // Find user by userId or walletAddress
    let user;
    if (userId) {
      user = await User.findOne({ clerkId: userId });
    } else if (walletAddress) {
      user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.blockradarWalletId || !user.walletAddress) {
      return NextResponse.json(
        { error: 'User does not have a wallet' },
        { status: 404 }
      );
    }

    // Get wallet balance from Blockradar
    const balanceResult = await getWalletBalance({
      walletId: user.blockradarWalletId,
      address: user.walletAddress,
    });

    if (!balanceResult.success) {
      return NextResponse.json(
        { 
          error: balanceResult.error || 'Failed to fetch wallet balance' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: user.blockradarWalletId,
        address: user.walletAddress,
        userId: user.clerkId,
        balances: balanceResult.balances,
        totalValueUSD: balanceResult.totalValueUSD,
        lastUpdated: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}