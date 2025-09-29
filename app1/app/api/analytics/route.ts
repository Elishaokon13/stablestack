import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Payment from '@/lib/models/Payment';
import Product from '@/lib/models/Product';

// GET /api/analytics - Get analytics data for a seller
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }
    
    // Get seller earnings
    const earnings = await Payment.getSellerEarnings(sellerId);
    
    // Get total products
    const totalProducts = await Product.countDocuments({ 
      sellerId: sellerId.toLowerCase() 
    });
    
    // Get active products
    const activeProducts = await Product.countDocuments({ 
      sellerId: sellerId.toLowerCase(),
      isActive: true 
    });
    
    // Get recent payments
    const recentPayments = await Payment.getRecentPayments(sellerId, 5);
    
    // Calculate average order value
    const avgOrderValue = earnings.totalPayments > 0 
      ? (parseFloat(earnings.totalEarningsUSD) / earnings.totalPayments).toFixed(2)
      : '0.00';
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalEarnings: {
          usdc: earnings.totalEarningsUSDC,
          usd: earnings.totalEarningsUSD,
        },
        totalProducts,
        activeProducts,
        totalPayments: earnings.totalPayments,
        averageOrderValue: avgOrderValue,
        recentPayments: recentPayments.map(payment => ({
          id: payment._id,
          amountUSDC: payment.amountUSDC,
          amountUSD: (parseInt(payment.amountUSDC) / 1e6).toFixed(2),
          status: payment.status,
          completedAt: payment.completedAt,
          buyerEmail: payment.buyerEmail,
          buyerName: payment.buyerName,
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
