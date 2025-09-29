import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';
import { z } from 'zod';

// Validation schemas
const createPaymentSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  buyerId: z.string().min(1, 'Buyer ID is required'),
  buyerEmail: z.string().email().optional(),
  buyerName: z.string().optional(),
});

const updatePaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']),
  transactionHash: z.string().optional(),
});

// GET /api/payments - Get payments by seller, buyer, or product
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const buyerId = searchParams.get('buyerId');
    const productId = searchParams.get('productId');
    const paymentLink = searchParams.get('paymentLink');
    
    let payments = [];
    
    if (sellerId) {
      payments = await Payment.findBySeller(sellerId);
    } else if (buyerId) {
      payments = await Payment.findByBuyer(buyerId);
    } else if (productId) {
      payments = await Payment.findByProduct(productId);
    } else if (paymentLink) {
      payments = await Payment.findByPaymentLink(paymentLink);
    } else {
      return NextResponse.json(
        { error: 'One of sellerId, buyerId, productId, or paymentLink parameter is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        productId: payment.productId,
        sellerId: payment.sellerId,
        buyerId: payment.buyerId,
        amountUSDC: payment.amountUSDC,
        transactionHash: payment.transactionHash,
        status: payment.status,
        paymentLink: payment.paymentLink,
        buyerEmail: payment.buyerEmail,
        buyerName: payment.buyerName,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
      }))
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);
    
    // Get product details
    const product = await Product.findById(validatedData.productId);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not active' },
        { status: 400 }
      );
    }
    
    // Create payment
    const payment = await Payment.create({
      productId: validatedData.productId,
      sellerId: product.sellerId,
      buyerId: validatedData.buyerId,
      amountUSDC: product.priceUSDC,
      paymentLink: product.paymentLink,
      buyerEmail: validatedData.buyerEmail,
      buyerName: validatedData.buyerName,
    });
    
    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        productId: payment.productId,
        sellerId: payment.sellerId,
        buyerId: payment.buyerId,
        amountUSDC: payment.amountUSDC,
        transactionHash: payment.transactionHash,
        status: payment.status,
        paymentLink: payment.paymentLink,
        buyerEmail: payment.buyerEmail,
        buyerName: payment.buyerName,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/payments - Update payment status
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = updatePaymentSchema.parse(body);
    
    const payment = await Payment.updateStatus(
      validatedData.paymentId,
      validatedData.status,
      validatedData.transactionHash
    );
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        productId: payment.productId,
        sellerId: payment.sellerId,
        buyerId: payment.buyerId,
        amountUSDC: payment.amountUSDC,
        transactionHash: payment.transactionHash,
        status: payment.status,
        paymentLink: payment.paymentLink,
        buyerEmail: payment.buyerEmail,
        buyerName: payment.buyerName,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
