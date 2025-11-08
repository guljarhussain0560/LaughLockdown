import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get eligible partners for multiplayer (friends)
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

    // Get all friends
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: user.id },
          { friendId: user.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Map to eligible partners format
    const eligiblePartners = friendships.map(friendship => ({
      user: friendship.userId === user.id ? friendship.friend : friendship.user,
      isDirect: true, // All friends are direct connections
    }));

    return NextResponse.json({ eligiblePartners });
  } catch (error) {
    console.error('Error fetching smile connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
