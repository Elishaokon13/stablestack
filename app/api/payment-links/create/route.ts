import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { storePaymentLink } from '@/lib/payment-links-store';
import { IPaymentLink } from '@/lib/models/PaymentLink';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, description, amount, currency = 'usd' } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (type === 'product' && (!amount || amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount is required for product links' },
        { status: 400 }
      );
    }

    // Generate unique payment link slug
    const slug = `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment intent for the link
    let paymentIntentResult;
    if (type === 'product' && amount) {
      paymentIntentResult = await createPaymentIntent(
        amount,
        currency,
        {
          linkSlug: slug,
          linkType: type,
          linkName: name,
          description: description || '',
        }
      );

      if (!paymentIntentResult.success) {
        return NextResponse.json(
          { error: paymentIntentResult.error },
          { status: 500 }
        );
      }
    }

    // Create payment link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/pay/${slug}`;

    // Store the payment link
    const paymentLinkData: any = {
      id: slug,
      slug: slug,
      type,
      name,
      description,
      amount: type === 'product' ? amount : undefined,
      currency,
      url: paymentUrl,
      paymentIntentId: paymentIntentResult?.paymentIntentId,
      clientSecret: paymentIntentResult?.clientSecret,
      status: 'active' as const,
      sellerId: 'user_123', // In production, get from auth
    };

    // Store in database
    const savedPaymentLink = await storePaymentLink(paymentLinkData);

    return NextResponse.json(savedPaymentLink);
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
