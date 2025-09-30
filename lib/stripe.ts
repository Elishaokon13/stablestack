import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe server-side client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Initialize Stripe client-side
export const stripeClient = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
    const paymentIntent = await stripe.paymentIntents.create({
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
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
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
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
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
    const session = await stripe.checkout.sessions.create({
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
    const event = stripe.webhooks.constructEvent(
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

// Get balance
export async function getBalance() {
  try {
    const balance = await stripe.balance.retrieve();
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
    const charges = await stripe.charges.list({
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
