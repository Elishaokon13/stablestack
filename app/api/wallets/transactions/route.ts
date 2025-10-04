import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { User } from '@/lib/models/User';
import { getWalletTransactions } from '@/lib/blockradar';

// GET /api/wallets/transactions - Get wallet transaction history
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // 'incoming', 'outgoing', 'all'
    const status = searchParams.get('status'); // 'pending', 'confirmed', 'failed'

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
        { error: 'User does not have a wallet configured' },
        { status: 404 }
      );
    }

    // Get wallet transactions from Blockradar
    const transactionsResult = await getWalletTransactions({
      walletId: user.blockradarWalletId,
      address: user.walletAddress,
      limit: limit + offset, // Get more to account for filtering
    });

    if (!transactionsResult.success) {
      return NextResponse.json(
        { 
          error: transactionsResult.error || 'Failed to fetch wallet transactions' 
        },
        { status: 500 }
      );
    }

    let transactions = transactionsResult.transactions || [];

    // Apply filters
    if (type && type !== 'all') {
      transactions = transactions.filter((tx: any) => {
        if (type === 'incoming') {
          return tx.to_address?.toLowerCase() === user.walletAddress.toLowerCase();
        } else if (type === 'outgoing') {
          return tx.from_address?.toLowerCase() === user.walletAddress.toLowerCase();
        }
        return true;
      });
    }

    if (status) {
      transactions = transactions.filter((tx: any) => tx.status === status);
    }

    // Apply pagination
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    // Calculate summary statistics
    const summary = {
      totalTransactions: transactions.length,
      totalIncoming: transactions.filter((tx: any) => 
        tx.to_address?.toLowerCase() === user.walletAddress.toLowerCase()
      ).length,
      totalOutgoing: transactions.filter((tx: any) => 
        tx.from_address?.toLowerCase() === user.walletAddress.toLowerCase()
      ).length,
      totalVolume: transactions.reduce((sum: number, tx: any) => {
        const amount = parseFloat(tx.amount) || 0;
        return sum + amount;
      }, 0),
      pendingTransactions: transactions.filter((tx: any) => tx.status === 'pending').length,
      confirmedTransactions: transactions.filter((tx: any) => tx.status === 'confirmed').length,   
      failedTransactions: transactions.filter((tx: any) => tx.status === 'failed').length,
    };

    return NextResponse.json({
      success: true,
      transactions: paginatedTransactions.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        fromAddress: tx.from_address,
        toAddress: tx.to_address,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.created_at,
        updatedAt: tx.updated_at,
        isIncoming: tx.to_address?.toLowerCase() === user.walletAddress.toLowerCase(),
        isOutgoing: tx.from_address?.toLowerCase() === user.walletAddress.toLowerCase(),
      })),
      pagination: {
        total: transactions.length,
        limit,
        offset,
        hasMore: offset + limit < transactions.length,
      },
      summary,
      wallet: {
        id: user.blockradarWalletId,
        address: user.walletAddress,
        userId: user.clerkId,
      }
    });

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
