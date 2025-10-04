import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import { User } from '@/lib/models/User';
import { verifyBlockradarWebhook } from '@/lib/blockradar';

// Blockradar webhook handler for transaction events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get('x-blockradar-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-blockradar-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const verification = verifyBlockradarWebhook(body, signature);
    
    if (!verification.success) {
      console.error('Blockradar webhook verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = verification.event;
    console.log(`Received Blockradar webhook: ${event.type}`);

    await connectDB();

    // Handle different event types
    switch (event.type) {
      case 'transaction.confirmed':
        await handleTransactionConfirmed(event.data);
        break;
      
      case 'transaction.failed':
        await handleTransactionFailed(event.data);
        break;
      
      case 'payout.completed':
        await handlePayoutCompleted(event.data);
        break;
      
      case 'payout.failed':
        await handlePayoutFailed(event.data);
        break;
      
      case 'wallet.balance_updated':
        await handleWalletBalanceUpdated(event.data);
        break;
      
      default:
        console.log(`Unhandled Blockradar event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Blockradar webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle confirmed transaction
async function handleTransactionConfirmed(data: any) {
  try {
    const { transaction_id, wallet_id, amount, currency, status } = data;
    
    console.log(`Transaction confirmed: ${transaction_id}, Amount: ${amount} ${currency}`);

    // Update payment status if this is a payout transaction
    const payment = await Payment.findOne({ 
      blockradarTransactionId: transaction_id 
    });
    
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, {
        payoutStatus: 'completed',
        payoutCompletedAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Updated payment ${payment._id} payout status to completed`);
    }

  } catch (error) {
    console.error('Error handling transaction confirmed:', error);
  }
}

// Handle failed transaction
async function handleTransactionFailed(data: any) {
  try {
    const { transaction_id, wallet_id, amount, currency, error_message } = data;
    
    console.log(`Transaction failed: ${transaction_id}, Error: ${error_message}`);

    // Update payment status if this is a payout transaction
    const payment = await Payment.findOne({ 
      blockradarTransactionId: transaction_id 
    });
    
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, {
        payoutStatus: 'failed',
        payoutFailureReason: error_message,
        payoutFailedAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Updated payment ${payment._id} payout status to failed`);
    }

  } catch (error) {
    console.error('Error handling transaction failed:', error);
  }
}

// Handle completed payout
async function handlePayoutCompleted(data: any) {
  try {
    const { payout_id, payment_id, amount, currency, transaction_hash } = data;
    
    console.log(`Payout completed: ${payout_id}, Payment: ${payment_id}`);

    // Update payment with payout completion details
    const payment = await Payment.findById(payment_id);
    
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, {
        payoutStatus: 'completed',
        payoutTransactionHash: transaction_hash,
        payoutCompletedAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Updated payment ${payment._id} payout to completed`);
    }

  } catch (error) {
    console.error('Error handling payout completed:', error);
  }
}

// Handle failed payout
async function handlePayoutFailed(data: any) {
  try {
    const { payout_id, payment_id, amount, currency, error_message } = data;
    
    console.log(`Payout failed: ${payout_id}, Payment: ${payment_id}, Error: ${error_message}`);

    // Update payment with payout failure details
    const payment = await Payment.findById(payment_id);
    
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, {
        payoutStatus: 'failed',
        payoutFailureReason: error_message,
        payoutFailedAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Updated payment ${payment._id} payout to failed`);
    }

  } catch (error) {
    console.error('Error handling payout failed:', error);
  }
}

// Handle wallet balance updated
async function handleWalletBalanceUpdated(data: any) {
  try {
    const { wallet_id, new_balance, currency, previous_balance } = data;
    
    console.log(`Wallet balance updated: ${wallet_id}, New balance: ${new_balance} ${currency}`);

    // Update user's wallet balance in database
    const user = await User.findOne({ blockradarWalletId: wallet_id });
    
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        walletBalance: new_balance,
        walletBalanceCurrency: currency,
        walletLastUpdated: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Updated user ${user._id} wallet balance`);
    }

  } catch (error) {
    console.error('Error handling wallet balance updated:', error);
  }
}
