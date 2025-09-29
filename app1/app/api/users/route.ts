import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  email: z.string().email().optional(),
  name: z.string().min(1, 'Name is required').optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  isOnboardingComplete: z.boolean().optional(),
});

// GET /api/users - Get user by address
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }
    
    const user = await User.findByAddress(address);
    
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
        address: user.address,
        email: user.email,
        name: user.name,
        username: user.username,
        isOnboardingComplete: user.isOnboardingComplete,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create or update user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    // Check if user already exists
    let user = await User.findByAddress(validatedData.address);
    
    if (user) {
      // Update existing user
      const updateData: any = {};
      if (validatedData.name) updateData.name = validatedData.name;
      if (validatedData.email) updateData.email = validatedData.email;
      
      user = await User.updateOnboarding(validatedData.address, updateData);
    } else {
      // Create new user
      user = await User.create(validatedData);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        address: user.address,
        email: user.email,
        name: user.name,
        username: user.username,
        isOnboardingComplete: user.isOnboardingComplete,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users - Update user
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { address, ...updateData } = body;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    
    const validatedData = updateUserSchema.parse(updateData);
    
    const user = await User.updateOnboarding(address, validatedData);
    
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
        address: user.address,
        email: user.email,
        name: user.name,
        username: user.username,
        isOnboardingComplete: user.isOnboardingComplete,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
