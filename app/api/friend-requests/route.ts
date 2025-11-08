import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get friend requests for current user
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    if (type === 'sent') {
      const sentRequests = await prisma.friendRequest.findMany({
        where: {
          senderId: user.id,
          status: 'pending',
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ requests: sentRequests });
    } else {
      const receivedRequests = await prisma.friendRequest.findMany({
        where: {
          receiverId: user.id,
          status: 'pending',
        },
        include: {
          sender: {
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
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ requests: receivedRequests });
    }
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 });
  }
}

// POST - Send a friend request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId } = await req.json();

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.id === receiverId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if already friends
    const existingFriend = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: receiverId },
          { userId: receiverId, friendId: user.id },
        ],
      },
    });

    if (existingFriend) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId, status: 'pending' },
          { senderId: receiverId, receiverId: user.id, status: 'pending' },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: user.id,
        receiverId,
        status: 'pending',
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ request: friendRequest });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
