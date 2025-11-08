import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get all friends
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get friends where user is either initiator or receiver
    const friendsAsInitiator = await prisma.friend.findMany({
      where: { userId: user.id },
      include: {
        friend: {
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
        },
      },
    });

    const friendsAsReceiver = await prisma.friend.findMany({
      where: { friendId: user.id },
      include: {
        user: {
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
        },
      },
    });

    const friends = [
      ...friendsAsInitiator.map((f) => ({ ...f.friend, friendshipId: f.id, createdAt: f.createdAt })),
      ...friendsAsReceiver.map((f) => ({ ...f.user, friendshipId: f.id, createdAt: f.createdAt })),
    ];

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

// POST - Remove a friend (unfriend)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendId } = await req.json();

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete friendship (both directions - bidirectional)
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { userId: user.id, friendId },
          { userId: friendId, friendId: user.id },
        ],
      },
    });

    return NextResponse.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }
}
