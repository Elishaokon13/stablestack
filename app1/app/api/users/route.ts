import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { User } from '@/lib/models/User';
import { z } from 'zod';

const userSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address").toLowerCase(),
  email: z.string().email("Invalid email address").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  isOnboardingComplete: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (walletAddress) {
      const user = await User.findByWalletAddress(walletAddress);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    const users = await User.find({});
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed. Please check your MongoDB setup.',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    let user = await User.findByWalletAddress(validatedData.walletAddress);
    if (user) {
      // If user exists, update email if provided and not already set
      if (validatedData.email && !user.email) {
        user.email = validatedData.email;
        await user.save();
      }
      return NextResponse.json({ user, message: 'User already exists, updated if necessary' }, { status: 200 });
    }

    user = await User.create(validatedData);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ message: 'Wallet address is required for update' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = userSchema.partial().parse(body); // Allow partial updates

    const user = await User.findOneAndUpdate(
      { walletAddress },
      { $set: validatedData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('PUT /api/users error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Database connection failed. Please check your MongoDB setup.',
      details: error.message 
    }, { status: 500 });
  }
}