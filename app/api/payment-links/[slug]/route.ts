import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { PaymentLink } from '@/lib/models/PaymentLink';

// PUT /api/payment-links/[slug] - Update payment link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    const body = await request.json();
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Payment link slug is required' },
        { status: 400 }
      );
    }
    
    const paymentLink = await PaymentLink.findOneAndUpdate(
      { slug },
      {
        ...body,
        updatedAt: new Date(),
      },
      { new: true }
    );
    
    if (!paymentLink) {
      return NextResponse.json(
        { error: 'Payment link not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      paymentLink: {
        id: paymentLink._id,
        slug: paymentLink.slug,
        type: paymentLink.type,
        name: paymentLink.name,
        description: paymentLink.description,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        url: paymentLink.url,
        status: paymentLink.status,
        sellerId: paymentLink.sellerId,
        createdAt: paymentLink.createdAt,
        updatedAt: paymentLink.updatedAt,
      }
    });
    
  } catch (error) {
    console.error('Error updating payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/payment-links/[slug] - Delete payment link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Payment link slug is required' },
        { status: 400 }
      );
    }
    
    const paymentLink = await PaymentLink.findOneAndDelete({ slug });
    
    if (!paymentLink) {
      return NextResponse.json(
        { error: 'Payment link not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment link deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}