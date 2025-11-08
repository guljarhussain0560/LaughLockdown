import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const type = new URL(req.url).searchParams.get('type');
  const requests = await prisma.friendRequest.findMany({
    where: type === 'sent' ? { senderId: user.id } : { receiverId: user.id, status: 'pending' },
    include: { 
      sender: { select: { id: true, name: true, username: true, image: true } },
      receiver: { select: { id: true, name: true, username: true, image: true } }
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { receiverId } = await req.json();
  
  // Validate receiverId
  if (!receiverId || receiverId === user.id) {
    return NextResponse.json({ error: 'Invalid receiver ID' }, { status: 400 });
  }

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

  // Check for existing pending request
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: user.id, receiverId, status: 'pending' },
        { senderId: receiverId, receiverId: user.id, status: 'pending' },
      ],
    },
  });

  if (existingRequest) {
    return NextResponse.json({ error: 'Request already exists' }, { status: 400 });
  }

  const request = await prisma.friendRequest.create({
    data: { senderId: user.id, receiverId },
    include: { 
      sender: { select: { id: true, name: true, username: true, image: true } },
      receiver: { select: { id: true, name: true, username: true, image: true } } 
    },
  });
  return NextResponse.json({ request });
}
