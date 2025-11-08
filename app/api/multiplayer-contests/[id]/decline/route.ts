import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: contestId } = await params;

    // Find the participant record
    const participant = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId: user.id,
        status: 'invited',
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Update participant status to declined
    await prisma.contestParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        status: 'declined',
      },
    });

    return NextResponse.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 });
  }
}
