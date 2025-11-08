import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Join a contest by room code
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roomCode } = body;

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find contest by room code
    const contest = await prisma.multiplayerContest.findFirst({
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        participants: true
      }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Invalid room code' },
        { status: 404 }
      );
    }

    // Check if contest has already started or completed
    if (contest.status === 'active') {
      return NextResponse.json(
        { error: 'Contest has already started' },
        { status: 400 }
      );
    }

    if (contest.status === 'completed' || contest.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Contest is no longer available' },
        { status: 400 }
      );
    }

    // Check if user is already a participant
    const existingParticipant = contest.participants.find(
      (p) => p.userId === user.id
    );

    if (existingParticipant) {
      // Update status to accepted if they were invited
      if (existingParticipant.status === 'invited') {
        await prisma.contestParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            status: 'accepted',
            joinedAt: new Date()
          }
        });
      }

      return NextResponse.json({
        contestId: contest.id,
        message: 'You have joined the contest!'
      });
    }

    // Add user as participant
    await prisma.contestParticipant.create({
      data: {
        contestId: contest.id,
        userId: user.id,
        status: 'accepted',
        joinedAt: new Date()
      }
    });

    return NextResponse.json({
      contestId: contest.id,
      message: 'Successfully joined the contest!'
    });

  } catch (error) {
    console.error('Join contest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
