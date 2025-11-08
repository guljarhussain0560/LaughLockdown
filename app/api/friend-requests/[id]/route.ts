import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { action } = await req.json();
  const { id } = await params;
  const fr = await prisma.friendRequest.findUnique({ where: { id } });

  if (!fr) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (fr.receiverId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  if (action === 'accept') {
    await prisma.$transaction([
      // Create bidirectional friendship - both users should see each other as friends
      prisma.friend.create({ data: { userId: fr.senderId, friendId: fr.receiverId } }),
      prisma.friend.create({ data: { userId: fr.receiverId, friendId: fr.senderId } }),
      prisma.friendRequest.update({ where: { id }, data: { status: 'accepted' } }),
    ]);
    return NextResponse.json({ message: 'Accepted' });
  } else {
    await prisma.friendRequest.update({ where: { id }, data: { status: 'rejected' } });
    return NextResponse.json({ message: 'Rejected' });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const fr = await prisma.friendRequest.findUnique({ where: { id } });

  if (!fr) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  // Only the sender can cancel their own request
  if (fr.senderId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await prisma.friendRequest.delete({ where: { id } });
  return NextResponse.json({ message: 'Request cancelled' });
}