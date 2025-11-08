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
    const { survivalTime, reason } = await req.json();

    // Find the participant record
    const participant = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Update participant with elimination data
    await prisma.contestParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        status: 'out',
        survivalTime,
        eliminatedAt: new Date(),
      },
    });

    // Check if all participants are eliminated
    const contest = await prisma.multiplayerContest.findUnique({
      where: { id: contestId },
      include: {
        participants: true,
      },
    });

    if (contest) {
      const activePlayers = contest.participants.filter(
        p => p.status === 'playing' || p.status === 'accepted'
      );

      // If only one or zero players left, end the game
      if (activePlayers.length <= 1) {
        const winner = activePlayers[0];
        
        await prisma.multiplayerContest.update({
          where: { id: contestId },
          data: {
            status: 'completed',
            endTime: new Date(),
            winnerId: winner?.userId || null,
          },
        });
      }
    }

    return NextResponse.json({ 
      message: 'Player eliminated',
      survivalTime,
      reason
    });
  } catch (error) {
    console.error('Error eliminating player:', error);
    return NextResponse.json({ error: 'Failed to eliminate player' }, { status: 500 });
  }
}
