import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Product from '@/lib/models/Product';
import { z } from 'zod';

// Validation schemas
const createProductSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  priceUSD: z.number().min(0.01, 'Price must be greater than 0'),
  imageUrl: z.string().url().optional(),
  category: z.string().optional(),
});

// GET /api/products - Get products by seller or by payment link
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const paymentLink = searchParams.get('paymentLink');
    
    if (paymentLink) {
      // Get single product by payment link
      const product = await Product.findByPaymentLink(paymentLink);
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        product: {
          id: product._id,
          sellerId: product.sellerId,
          name: product.name,
          description: product.description,
          priceUSD: product.priceUSD,
          priceUSDC: product.priceUSDC,
          paymentLink: product.paymentLink,
          isActive: product.isActive,
          imageUrl: product.imageUrl,
          category: product.category,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      });
    }
    
    if (sellerId) {
      // Get all products by seller
      const products = await Product.findBySeller(sellerId);
      
      return NextResponse.json({
        success: true,
        products: products.map((product: any) => ({
          id: product._id,
          sellerId: product.sellerId,
          name: product.name,
          description: product.description,
          priceUSD: product.priceUSD,
          priceUSDC: product.priceUSDC,
          paymentLink: product.paymentLink,
          isActive: product.isActive,
          imageUrl: product.imageUrl,
          category: product.category,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }))
      });
    }
    
    return NextResponse.json(
      { error: 'Either sellerId or paymentLink parameter is required' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);
    
    // Generate payment link
    const paymentLink = await Product.generatePaymentLink(validatedData.name);
    
    // Convert USD to USDC
    const priceUSDC = Product.convertUSDToUSDC(validatedData.priceUSD);
    
    const product = await Product.create({
      ...validatedData,
      priceUSDC,
      paymentLink,
    });
    
    return NextResponse.json({
      success: true,
      product: {
        id: product._id,
        sellerId: product.sellerId,
        name: product.name,
        description: product.description,
        priceUSD: product.priceUSD,
        priceUSDC: product.priceUSDC,
        paymentLink: product.paymentLink,
        isActive: product.isActive,
        imageUrl: product.imageUrl,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products - Update product
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { productId, isActive } = body;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }
    
    const product = await Product.updateStatus(productId, isActive);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product: {
        id: product._id,
        sellerId: product.sellerId,
        name: product.name,
        description: product.description,
        priceUSD: product.priceUSD,
        priceUSDC: product.priceUSDC,
        paymentLink: product.paymentLink,
        isActive: product.isActive,
        imageUrl: product.imageUrl,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
