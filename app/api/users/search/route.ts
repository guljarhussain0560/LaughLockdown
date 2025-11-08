import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Search users
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Search users by username or name
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: currentUser.id }, // Exclude current user
          },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        avatar: true,
        userStats: {
          select: {
            totalContests: true,
            totalWins: true,
            bestSurvivalTime: true,
          },
        },
      },
      take: 20,
    });

    // Check friend status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if already friends
        const friendship = await prisma.friend.findFirst({
          where: {
            OR: [
              { userId: currentUser.id, friendId: user.id },
              { userId: user.id, friendId: currentUser.id },
            ],
          },
        });

        if (friendship) {
          return { ...user, friendStatus: 'friends' };
        }

        // Check for pending request
        const pendingRequest = await prisma.friendRequest.findFirst({
          where: {
            OR: [
              { senderId: currentUser.id, receiverId: user.id, status: 'pending' },
              { senderId: user.id, receiverId: currentUser.id, status: 'pending' },
            ],
          },
        });

        if (pendingRequest) {
          if (pendingRequest.senderId === currentUser.id) {
            return { ...user, friendStatus: 'pending_sent' };
          } else {
            return { ...user, friendStatus: 'pending_received' };
          }
        }

        return { ...user, friendStatus: 'none' };
      })
    );

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
