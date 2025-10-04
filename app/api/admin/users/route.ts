import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { User } from '@/lib/models/User';

// GET /api/admin/users - Admin: List all users
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'active', 'deleted'
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status === 'deleted') {
      query.isDeleted = true;
    } else if (status === 'active') {
      query.isDeleted = { $ne: true };
    }

    // Get users with pagination
    const users = await User.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit)
      .skip(offset);

    // Get total count for pagination
    const totalCount = await User.countDocuments(query);

    // Get user statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $ne: ['$isDeleted', true] }, 1, 0] }
          },
          deletedUsers: {
            $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] }
          },
          usersWithWallets: {
            $sum: { $cond: [{ $ne: ['$blockradarWalletId', null] }, 1, 0] }
          },
          usersWithOnboarding: {
            $sum: { $cond: [{ $eq: ['$isOnboardingComplete', true] }, 1, 0] }
          }
        }
      }
    ]);

    const userStats = stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      deletedUsers: 0,
      usersWithWallets: 0,
      usersWithOnboarding: 0,
    };

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        walletAddress: user.walletAddress,
        blockradarWalletId: user.blockradarWalletId,
        isOnboardingComplete: user.isOnboardingComplete,
        isDeleted: user.isDeleted,
        deletedAt: user.deletedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      statistics: {
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        deletedUsers: userStats.deletedUsers,
        usersWithWallets: userStats.usersWithWallets,
        usersWithOnboarding: userStats.usersWithOnboarding,
        walletAdoptionRate: userStats.totalUsers > 0 
          ? ((userStats.usersWithWallets / userStats.totalUsers) * 100).toFixed(2)
          : 0,
        onboardingCompletionRate: userStats.totalUsers > 0 
          ? ((userStats.usersWithOnboarding / userStats.totalUsers) * 100).toFixed(2)
          : 0,
      }
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
