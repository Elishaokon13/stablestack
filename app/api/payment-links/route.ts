import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { getPaymentLinks } from '@/lib/payment-links-store';

// GET /api/payment-links - List user's payment links
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Get payment links
    const result = await getPaymentLinks({
      sellerId,
      status: status || undefined,
      type: type || undefined,
      limit,
      offset,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch payment links' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentLinks: result.paymentLinks,
      pagination: {
        total: result.total || 0,
        limit,
        offset,
        hasMore: offset + limit < (result.total || 0),
      }
    });

  } catch (error) {
    console.error('Error fetching payment links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}