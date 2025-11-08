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
  
  const request = await prisma.friendRequest.create({
    data: { senderId: user.id, receiverId },
    include: { receiver: { select: { id: true, name: true, username: true, image: true } } },
  });
  return NextResponse.json({ request });
}
