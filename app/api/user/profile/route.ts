import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import { User } from '@/lib/models/User';

// Validation schema for profile update
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

// GET /api/user/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const clerkId = searchParams.get('clerkId');

    if (!userId && !clerkId) {
      return NextResponse.json(
        { error: 'Either userId or clerkId is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { _id: userId },
        { clerkId: clerkId }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        walletAddress: user.walletAddress,
        blockradarWalletId: user.blockradarWalletId,
        isOnboardingComplete: user.isOnboardingComplete,
        isDeleted: user.isDeleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);
    const { userId, clerkId } = body;

    if (!userId && !clerkId) {
      return NextResponse.json(
        { error: 'Either userId or clerkId is required' },
        { status: 400 }
      );
    }

    // Find and update user
    const user = await User.findOneAndUpdate(
      {
        $or: [
          { _id: userId },
          { clerkId: clerkId }
        ]
      },
      {
        ...validatedData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        walletAddress: user.walletAddress,
        blockradarWalletId: user.blockradarWalletId,
        isOnboardingComplete: user.isOnboardingComplete,
        updatedAt: user.updatedAt,
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

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
