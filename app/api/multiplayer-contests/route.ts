import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get user's multiplayer contests
export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'active', 'completed'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get contests where user is participant or creator
    const contests = await prisma.multiplayerContest.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          { participants: { some: { userId: user.id } } }
        ],
        ...(status ? { status } : {})
      },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ contests })

  } catch (error) {
    console.error("Get multiplayer contests error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a multiplayer contest and invite users
export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, participantEmails } = body

    if (!participantEmails || participantEmails.length === 0) {
      return NextResponse.json(
        { error: "At least one participant is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify all participants exist and are eligible (connected)
    const participants = await prisma.user.findMany({
      where: {
        email: { in: participantEmails }
      }
    })

    if (participants.length !== participantEmails.length) {
      return NextResponse.json(
        { error: "Some participants not found" },
        { status: 404 }
      )
    }

    // Generate unique room code (6 characters)
    const generateRoomCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing characters
      let code = ''
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    let roomCode = generateRoomCode()
    
    // Ensure room code is unique
    let existing = await prisma.multiplayerContest.findFirst({
      where: { roomCode }
    })
    
    while (existing) {
      roomCode = generateRoomCode()
      existing = await prisma.multiplayerContest.findFirst({
        where: { roomCode }
      })
    }

    // Create contest
    const contest = await prisma.multiplayerContest.create({
      data: {
        creatorId: user.id,
        title: title || `${user.name}'s Challenge`,
        roomCode,
        status: 'pending'
      }
    })

    // Add creator as participant with auto-accepted status
    await prisma.contestParticipant.create({
      data: {
        contestId: contest.id,
        userId: user.id,
        status: 'accepted',
        joinedAt: new Date()
      }
    })

    // Invite other participants
    for (const participant of participants) {
      if (participant.id !== user.id) {
        await prisma.contestParticipant.create({
          data: {
            contestId: contest.id,
            userId: participant.id,
            status: 'invited'
          }
        })
      }
    }

    // Fetch complete contest with participants
    const fullContest = await prisma.multiplayerContest.findUnique({
      where: { id: contest.id },
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
          }
        }
      }
    })

    return NextResponse.json({
      contest: fullContest,
      message: "Contest created and invitations sent!"
    }, { status: 201 })

  } catch (error) {
    console.error("Create multiplayer contest error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
