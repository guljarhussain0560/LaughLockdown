import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get contest details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const resolvedParams = await params;
    const contestId = resolvedParams.id;

    const contest = await prisma.multiplayerContest.findUnique({
      where: { id: contestId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: { survivalTime: 'desc' }
        }
      }
    })

    if (!contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ contest })

  } catch (error) {
    console.error("Get contest error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Update contest (accept/reject invitation, start contest, update participant status)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, survivalTime } = body
    // action: 'accept', 'reject', 'start', 'eliminate', 'complete'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const resolvedParams = await params;
    const contestId = resolvedParams.id;

    const contest = await prisma.multiplayerContest.findUnique({
      where: { id: contestId },
      include: {
        participants: true
      }
    })

    if (!contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      )
    }

    const participant = contest.participants.find(p => p.userId === user.id)

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this contest" },
        { status: 403 }
      )
    }

    if (action === 'accept') {
      // Accept invitation
      if (participant.status !== 'invited') {
        return NextResponse.json(
          { error: "Invalid participant status" },
          { status: 400 }
        )
      }

      await prisma.contestParticipant.update({
        where: { id: participant.id },
        data: { 
          status: 'accepted',
          joinedAt: new Date()
        }
      })

      return NextResponse.json({
        message: "Contest invitation accepted!"
      })
    }

    if (action === 'reject') {
      // Reject invitation
      if (participant.status !== 'invited') {
        return NextResponse.json(
          { error: "Invalid participant status" },
          { status: 400 }
        )
      }

      await prisma.contestParticipant.update({
        where: { id: participant.id },
        data: { status: 'rejected' }
      })

      return NextResponse.json({
        message: "Contest invitation rejected"
      })
    }

    if (action === 'start') {
      // Start contest (creator only)
      if (contest.creatorId !== user.id) {
        return NextResponse.json(
          { error: "Only the creator can start the contest" },
          { status: 403 }
        )
      }

      if (contest.status !== 'pending') {
        return NextResponse.json(
          { error: "Contest already started" },
          { status: 400 }
        )
      }

      // Check if at least 2 participants accepted
      const acceptedCount = contest.participants.filter(p => p.status === 'accepted').length
      if (acceptedCount < 2) {
        return NextResponse.json(
          { error: "Need at least 2 accepted participants to start" },
          { status: 400 }
        )
      }

      await prisma.multiplayerContest.update({
        where: { id: contestId },
        data: { 
          status: 'active',
          startTime: new Date()
        }
      })

      // Update all accepted participants to playing
      await prisma.contestParticipant.updateMany({
        where: {
          contestId: contestId,
          status: 'accepted'
        },
        data: { status: 'playing' }
      })

      return NextResponse.json({
        message: "Contest started! Good luck!"
      })
    }

    if (action === 'eliminate') {
      // Player got eliminated (smiled/laughed)
      if (participant.status !== 'playing') {
        return NextResponse.json(
          { error: "You are not playing" },
          { status: 400 }
        )
      }

      await prisma.contestParticipant.update({
        where: { id: participant.id },
        data: { 
          status: 'eliminated',
          survivalTime: survivalTime || 0,
          eliminatedAt: new Date()
        }
      })

      // Check if only one player remaining
      const remainingPlayers = await prisma.contestParticipant.count({
        where: {
          contestId: contestId,
          status: 'playing'
        }
      })

      if (remainingPlayers === 1) {
        // Find the winner
        const winner = await prisma.contestParticipant.findFirst({
          where: {
            contestId: contestId,
            status: 'playing'
          }
        })

        if (winner) {
          // Mark contest as completed
          await prisma.multiplayerContest.update({
            where: { id: contestId },
            data: { 
              status: 'completed',
              winnerId: winner.userId,
              endTime: new Date()
            }
          })

          // Mark winner as winner status
          await prisma.contestParticipant.update({
            where: { id: winner.id },
            data: { status: 'eliminated' } // Changed from playing to track their time
          })
        }
      }

      if (remainingPlayers === 0) {
        // All eliminated, mark as completed
        await prisma.multiplayerContest.update({
          where: { id: contestId },
          data: { 
            status: 'completed',
            endTime: new Date()
          }
        })
      }

      return NextResponse.json({
        message: "You've been eliminated!",
        remainingPlayers
      })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Update contest error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
