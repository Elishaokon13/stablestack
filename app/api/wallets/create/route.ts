import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import { User } from '@/lib/models/User';
import { createBlockradarWallet } from '@/lib/blockradar';

// Validation schema for wallet creation
const createWalletSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Name is required'),
});

// POST /api/wallets/create - Create Blockradar wallet for user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = createWalletSchema.parse(body);

    // Check if user already has a wallet
    const existingUser = await User.findOne({ 
      $or: [
        { clerkId: validatedData.userId },
        { email: validatedData.email }
      ]
    });

    if (existingUser?.blockradarWalletId) {
      return NextResponse.json({
        success: true,
        message: 'User already has a wallet',
        wallet: {
          id: existingUser.blockradarWalletId,
          address: existingUser.walletAddress,
          userId: existingUser.clerkId,
        }
      });
    }

    // Create Blockradar wallet
    const walletResult = await createBlockradarWallet({
      userId: validatedData.userId,
      email: validatedData.email,
      name: validatedData.name,
    });

    if (!walletResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: walletResult.error || 'Failed to create wallet' 
        },
        { status: 500 }
      );
    }

    // Update or create user with wallet info
    const user = await User.findOneAndUpdate(
      { 
        $or: [
          { clerkId: validatedData.userId },
          { email: validatedData.email }
        ]
      },
      {
        clerkId: validatedData.userId,
        email: validatedData.email,
        firstName: validatedData.name.split(' ')[0] || '',
        lastName: validatedData.name.split(' ').slice(1).join(' ') || '',
        blockradarWalletId: walletResult.walletId,
        walletAddress: walletResult.address,
        isOnboardingComplete: true,
        updatedAt: new Date(),
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    return NextResponse.json({
      success: true,
      wallet: {
        id: walletResult.walletId,
        address: walletResult.address,
        userId: validatedData.userId,
        user: {
          id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}