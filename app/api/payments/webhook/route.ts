import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { createTransaction } from '@/lib/blockradar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const verification = verifyWebhookSignature(body, signature);
    if (!verification.success) {
      console.error('Webhook signature verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = verification.event;

    // Handle different event types
    switch (event?.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event?.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Extract payment details
    const amount = paymentIntent.amount / 100; // Convert from cents
    const currency = paymentIntent.currency;
    const metadata = paymentIntent.metadata;

    // TODO: Store payment record in database
    // TODO: Create user wallet if doesn't exist
    // TODO: Initiate crypto payout

    // Example: Create crypto payout
    if (metadata.userId && metadata.walletId) {
      const payoutResult = await createTransaction(
        metadata.walletId,
        metadata.userAddress,
        amount.toString(),
        'USDC'
      );

      if (payoutResult.success) {
        console.log('Crypto payout initiated:', payoutResult.transaction?.id);
      } else {
        console.error('Failed to initiate crypto payout:', payoutResult.error);
      }
    }

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    console.log('Payment failed:', paymentIntent.id);
    
    // TODO: Update payment status in database
    // TODO: Notify user of payment failure
    // TODO: Log failure reason

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentRequiresAction(paymentIntent: any) {
  try {
    console.log('Payment requires action:', paymentIntent.id);
    
    // TODO: Update payment status in database
    // TODO: Notify user that additional action is required

  } catch (error) {
    console.error('Error handling payment requires action:', error);
  }
}
