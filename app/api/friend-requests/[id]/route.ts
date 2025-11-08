import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Shared function for accept/reject logic
async function handleAcceptReject(
  req: NextRequest,
  params: { id: string }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json(); // 'accept' or 'reject'
    const requestId = params.id;

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (friendRequest.receiverId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to respond to this request' }, { status: 403 });
    }

    if (action === 'accept') {
      // Create friendship and update request status
      await prisma.$transaction([
        prisma.friend.create({
          data: {
            userId: friendRequest.senderId,
            friendId: friendRequest.receiverId,
          },
        }),
        prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: 'accepted' },
        }),
      ]);

      return NextResponse.json({ message: 'Friend request accepted' });
    } else {
      // Reject request
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      return NextResponse.json({ message: 'Friend request rejected' });
    }
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return NextResponse.json({ error: 'Failed to respond to friend request' }, { status: 500 });
  }
}

// PUT - Accept/reject a friend request
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleAcceptReject(req, resolvedParams);
}

// POST - Accept/reject a friend request (alias for PUT)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleAcceptReject(req, resolvedParams);
}

// DELETE - Cancel sent friend request
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const requestId = resolvedParams.id;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (friendRequest.senderId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to cancel this request' }, { status: 403 });
    }

    await prisma.friendRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ message: 'Friend request cancelled' });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    return NextResponse.json({ error: 'Failed to cancel friend request' }, { status: 500 });
  }
}
