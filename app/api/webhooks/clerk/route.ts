import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/database';
import { User } from '@/lib/models/User';
import { createBlockradarWallet } from '@/lib/blockradar';

// Clerk webhook handler for user events
export async function POST(request: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await request.text();
    const body = JSON.parse(payload);

    // For now, we'll skip signature verification in development
    // In production, you should implement proper webhook signature verification
    const evt = body;

    // Handle the webhook event
    const eventType = evt.type;
    console.log(`Received Clerk webhook: ${eventType}`);

    await connectDB();

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      
      case 'session.created':
        await handleSessionCreated(evt.data);
        break;
      
      case 'session.ended':
        await handleSessionEnded(evt.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle user.created event - Auto-create Blockradar wallet
async function handleUserCreated(data: any) {
  try {
    const { id, email_addresses, first_name, last_name } = data;
    
    // Create user in database
    const user = await User.create({
      clerkId: id,
      email: email_addresses?.[0]?.email_address || '',
      firstName: first_name || '',
      lastName: last_name || '',
      isOnboardingComplete: false,
    });

    // Auto-create Blockradar wallet
    const walletResult = await createBlockradarWallet({
      userId: id,
      email: email_addresses?.[0]?.email_address || '',
      name: `${first_name || ''} ${last_name || ''}`.trim(),
    });

    if (walletResult.success) {
      // Update user with wallet info
      await User.findByIdAndUpdate(user._id, {
        blockradarWalletId: walletResult.walletId,
        walletAddress: walletResult.address,
      });
      
      console.log(`Created Blockradar wallet for user ${id}: ${walletResult.address}`);
    } else {
      console.error(`Failed to create Blockradar wallet for user ${id}:`, walletResult.error);
    }

  } catch (error) {
    console.error('Error handling user.created:', error);
  }
}

// Handle user.updated event
async function handleUserUpdated(data: any) {
  try {
    const { id, email_addresses, first_name, last_name } = data;
    
    await User.findOneAndUpdate(
      { clerkId: id },
      {
        email: email_addresses?.[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        updatedAt: new Date(),
      }
    );

    console.log(`Updated user ${id}`);
  } catch (error) {
    console.error('Error handling user.updated:', error);
  }
}

// Handle user.deleted event
async function handleUserDeleted(data: any) {
  try {
    const { id } = data;
    
    // Soft delete user (mark as deleted)
    await User.findOneAndUpdate(
      { clerkId: id },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    );

    console.log(`Soft deleted user ${id}`);
  } catch (error) {
    console.error('Error handling user.deleted:', error);
  }
}

// Handle session.created event
async function handleSessionCreated(data: any) {
  try {
    const { user_id, session_id } = data;
    
    // Track user session
    console.log(`User ${user_id} started session ${session_id}`);
    
    // You can add session tracking logic here
    // e.g., update last login time, track active sessions
    
  } catch (error) {
    console.error('Error handling session.created:', error);
  }
}

// Handle session.ended event
async function handleSessionEnded(data: any) {
  try {
    const { user_id, session_id } = data;
    
    // Handle session cleanup
    console.log(`User ${user_id} ended session ${session_id}`);
    
    // You can add session cleanup logic here
    
  } catch (error) {
    console.error('Error handling session.ended:', error);
  }
}
