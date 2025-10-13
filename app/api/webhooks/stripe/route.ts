import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Stripe webhook handler - forwards to backend API
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Stripe webhook received');

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log('✅ Webhook signature verified:', event.type);
    } catch (err) {
      const error = err as Error;
      console.error('❌ Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      );
    }

    // Log event details
    console.log(`📋 Event Type: ${event.type}`);
    console.log(`🆔 Event ID: ${event.id}`);

    // Forward to backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const backendWebhookUrl = `${apiUrl}/public/webhook/stripe`;

    console.log(`📤 Forwarding webhook to backend: ${backendWebhookUrl}`);

    try {
      const backendResponse = await fetch(backendWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-source': 'nextjs-frontend',
          'x-stripe-signature': signature,
        },
        body: JSON.stringify({
          event,
          rawBody: body,
        }),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend webhook processing failed:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          error: errorText,
        });
        
        // Return success to Stripe even if backend fails (prevents retry storms)
        // But log the error for investigation
        return NextResponse.json({ 
          received: true,
          warning: 'Backend processing failed but webhook acknowledged',
        });
      }

      const backendData = await backendResponse.json();
      console.log('✅ Backend processed webhook successfully:', backendData);

      return NextResponse.json({ 
        received: true,
        backendResponse: backendData,
      });

    } catch (fetchError) {
      console.error('❌ Error forwarding to backend:', fetchError);
      
      // Return success to Stripe to prevent retries
      return NextResponse.json({ 
        received: true,
        warning: 'Backend forwarding failed but webhook acknowledged',
      });
    }

  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get webhook event details
function getEventDetails(event: Stripe.Event) {
  const details: any = {
    id: event.id,
    type: event.type,
    created: event.created,
  };

  switch (event.type) {
    case 'payment_intent.succeeded':
      const piSucceeded = event.data.object as Stripe.PaymentIntent;
      details.paymentIntent = {
        id: piSucceeded.id,
        amount: piSucceeded.amount,
        currency: piSucceeded.currency,
        status: piSucceeded.status,
        metadata: piSucceeded.metadata,
      };
      break;

    case 'payment_intent.payment_failed':
      const piFailed = event.data.object as Stripe.PaymentIntent;
      details.paymentIntent = {
        id: piFailed.id,
        amount: piFailed.amount,
        currency: piFailed.currency,
        status: piFailed.status,
        lastError: piFailed.last_payment_error?.message,
      };
      break;

    case 'payment_intent.canceled':
      const piCanceled = event.data.object as Stripe.PaymentIntent;
      details.paymentIntent = {
        id: piCanceled.id,
        status: piCanceled.status,
      };
      break;

    case 'charge.succeeded':
      const chargeSucceeded = event.data.object as Stripe.Charge;
      details.charge = {
        id: chargeSucceeded.id,
        amount: chargeSucceeded.amount,
        currency: chargeSucceeded.currency,
        paymentIntent: chargeSucceeded.payment_intent,
      };
      break;

    case 'charge.refunded':
      const chargeRefunded = event.data.object as Stripe.Charge;
      details.charge = {
        id: chargeRefunded.id,
        amountRefunded: chargeRefunded.amount_refunded,
        refunded: chargeRefunded.refunded,
      };
      break;

    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      details.checkoutSession = {
        id: session.id,
        paymentIntent: session.payment_intent,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
      };
      break;
  }

  return details;
}
