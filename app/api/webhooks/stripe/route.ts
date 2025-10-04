import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/stripe';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';
import { initiateStablecoinPayout } from '@/lib/blockradar';

// Stripe webhook handler for payment events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const verification = verifyWebhookSignature(body, signature);
    
    if (!verification.success) {
      console.error('Stripe webhook verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = verification.event;
    console.log(`Received Stripe webhook: ${event.type}`);

    await connectDB();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    const { id, amount, currency, metadata } = paymentIntent;
    
    console.log(`Payment succeeded: ${id}, Amount: ${amount} ${currency}`);

    // Find or create payment record
    let payment = await Payment.findOne({ stripePaymentIntentId: id });
    
    if (!payment) {
      // Create new payment record
      const product = await Product.findOne({ 
        paymentLink: metadata?.linkSlug 
      });
      
      if (product) {
        payment = await Payment.create({
          stripePaymentIntentId: id,
          productId: product._id,
          sellerId: product.sellerId,
          amountUSD: amount / 100, // Convert from cents
          amountUSDC: Math.floor(amount * 1e6 / 100), // Convert to USDC (6 decimals)
          status: 'completed',
          stripeMetadata: metadata,
          completedAt: new Date(),
        });
      }
    } else {
      // Update existing payment
      payment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          status: 'completed',
          completedAt: new Date(),
        },
        { new: true }
      );
    }

    if (payment) {
      // Initiate stablecoin payout to merchant
      const payoutResult = await initiateStablecoinPayout({
        paymentId: payment._id.toString(),
        sellerId: payment.sellerId,
        amountUSDC: payment.amountUSDC,
        currency: 'USDC',
      });

      if (payoutResult.success) {
        // Update payment with payout info
        await Payment.findByIdAndUpdate(payment._id, {
          blockradarTransactionId: payoutResult.transactionId,
          payoutStatus: 'initiated',
        });
        
        console.log(`Initiated stablecoin payout for payment ${payment._id}`);
      } else {
        console.error(`Failed to initiate payout for payment ${payment._id}:`, payoutResult.error);
      }
    }

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: any) {
  try {
    const { id, last_payment_error } = paymentIntent;
    
    console.log(`Payment failed: ${id}, Error: ${last_payment_error?.message}`);

    // Update payment status
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: id },
      {
        status: 'failed',
        failureReason: last_payment_error?.message || 'Payment failed',
        updatedAt: new Date(),
      }
    );

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent: any) {
  try {
    const { id } = paymentIntent;
    
    console.log(`Payment canceled: ${id}`);

    // Update payment status
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: id },
      {
        status: 'cancelled',
        updatedAt: new Date(),
      }
    );

  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session: any) {
  try {
    const { id, payment_intent, metadata } = session;
    
    console.log(`Checkout session completed: ${id}`);

    // This is typically handled by payment_intent.succeeded
    // But we can add additional logic here if needed
    
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}
