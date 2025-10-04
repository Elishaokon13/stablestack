import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe server-side client (only for server-side usage)
let stripe: Stripe | null = null;
if (typeof window === 'undefined' && process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
}

// Initialize Stripe client-side
export const stripeClient = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Get server-side Stripe instance
export function getStripeServer() {
  if (!stripe) {
    throw new Error('Stripe server instance not available. Make sure STRIPE_SECRET_KEY is set.');
  }
  return stripe;
}

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'],
  automatic_payment_methods: {
    enabled: true,
  },
} as const;

// Payment intent creation
export async function createPaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, string>) {
  try {
    const stripeServer = getStripeServer();
    const paymentIntent = await stripeServer.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Retrieve payment intent
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const stripeServer = getStripeServer();
    const paymentIntent = await stripeServer.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Confirm payment intent
export async function confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
  try {
    const stripeServer = getStripeServer();
    const paymentIntent = await stripeServer.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Create checkout session
export async function createCheckoutSession(
  amount: number,
  currency: string = 'usd',
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  try {
    const stripeServer = getStripeServer();
    const session = await stripeServer.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Payment',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Webhook signature verification
export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    const stripeServer = getStripeServer();
    const event = stripeServer.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Create refund
export async function createRefund(refundInfo: {
  paymentIntentId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}) {
  try {
    const stripeServer = getStripeServer();
    
    const refund = await stripeServer.refunds.create({
      payment_intent: refundInfo.paymentIntentId,
      amount: refundInfo.amount,
      reason: refundInfo.reason,
      metadata: refundInfo.metadata,
    });

    return {
      success: true,
      refundId: refund.id,
      refund: refund,
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get balance
export async function getBalance() {
  try {
    const stripeServer = getStripeServer();
    const balance = await stripeServer.balance.retrieve();
    return {
      success: true,
      balance,
    };
  } catch (error) {
    console.error('Error retrieving balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// List recent charges
export async function listRecentCharges(limit: number = 10) {
  try {
    const stripeServer = getStripeServer();
    const charges = await stripeServer.charges.list({
      limit,
    });
    return {
      success: true,
      charges,
    };
  } catch (error) {
    console.error('Error listing charges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
