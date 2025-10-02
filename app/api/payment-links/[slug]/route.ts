import { NextRequest, NextResponse } from 'next/server';
import { getPaymentLink } from '@/lib/payment-links-store';

// GET /api/payment-links/[slug] - Get payment link details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get payment link from database
    const paymentLink = await getPaymentLink(slug);
    
    if (!paymentLink) {
      return NextResponse.json(
        { error: 'Payment link not found' },
        { status: 404 }
      );
    }

    // Convert to product format for compatibility
    const product = {
      id: paymentLink.id,
      sellerId: paymentLink.sellerId,
      name: paymentLink.name,
      description: paymentLink.description,
      priceUSD: paymentLink.amount || 0,
      priceUSDC: paymentLink.amount ? (paymentLink.amount * 1e6).toString() : '0',
      paymentLink: paymentLink.slug,
      isActive: paymentLink.status === 'active',
      imageUrl: undefined,
      category: paymentLink.type === 'product' ? 'Product' : 'General',
      createdAt: paymentLink.createdAt,
      updatedAt: paymentLink.createdAt,
    };

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error fetching payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
