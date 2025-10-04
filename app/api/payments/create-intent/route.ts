import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent } from '@/lib/stripe';

// Validation schema for create payment intent
const createIntentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  metadata: z.object({
    productName: z.string().optional(),
    description: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerName: z.string().optional(),
  }).optional(),
});

// POST /api/payments/create-intent - Create Stripe payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createIntentSchema.parse(body);

    // Create real Stripe payment intent
    const result = await createPaymentIntent(
      validatedData.amount,
      validatedData.currency,
      validatedData.metadata
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment intent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
