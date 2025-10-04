import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { User } from '@/lib/models/User';
import { getWalletBalance, getWalletTransactions } from '@/lib/blockradar';

// GET /api/user/wallet - Get user's wallet information
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const clerkId = searchParams.get('clerkId');
    const includeTransactions = searchParams.get('includeTransactions') === 'true';
    const transactionLimit = parseInt(searchParams.get('transactionLimit') || '10');

    if (!userId && !clerkId) {
      return NextResponse.json(
        { error: 'Either userId or clerkId is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { _id: userId },
        { clerkId: clerkId }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.blockradarWalletId || !user.walletAddress) {
      return NextResponse.json(
        { error: 'User does not have a wallet configured' },
        { status: 404 }
      );
    }

    // Get wallet balance
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

    let transactions = null;
    
    // Get wallet transactions if requested
    if (includeTransactions) {
      const transactionsResult = await getWalletTransactions({
        walletId: user.blockradarWalletId,
        address: user.walletAddress,
        limit: transactionLimit,
      });

      if (transactionsResult.success) {
        transactions = transactionsResult.transactions;
      }
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: user.blockradarWalletId,
        address: user.walletAddress,
        userId: user.clerkId,
        balances: balanceResult.balances,
        totalValueUSD: balanceResult.totalValueUSD,
        transactions: transactions,
        lastUpdated: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching user wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
