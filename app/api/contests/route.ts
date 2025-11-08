import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch user's contest history
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
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get contests
    const contests = await prisma.contest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ contests })

  } catch (error) {
    console.error("Get contests error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Save contest result
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
    const { survivalTime, result, memesViewed } = body

    if (!survivalTime || !result) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { userStats: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate rank (number of users with better time + 1)
    const betterScores = await prisma.contest.count({
      where: {
        survivalTime: { gt: survivalTime },
        result: 'loss' // Only count completed games
      }
    })
    const rank = betterScores + 1

    // Create contest record
    const contest = await prisma.contest.create({
      data: {
        userId: user.id,
        survivalTime,
        result,
        memesViewed: memesViewed || Math.floor(survivalTime / 5),
        rank,
      }
    })

    // Update user stats
    const isWin = result === 'win'
    const isLoss = result === 'loss'
    
    const stats = user.userStats
    const newTotalContests = stats ? stats.totalContests + 1 : 1
    const newTotalWins = stats ? stats.totalWins + (isWin ? 1 : 0) : (isWin ? 1 : 0)
    const newTotalLosses = stats ? stats.totalLosses + (isLoss ? 1 : 0) : (isLoss ? 1 : 0)
    const newBestTime = stats ? Math.max(stats.bestSurvivalTime, survivalTime) : survivalTime
    const newTotalTime = stats ? stats.totalSurvivalTime + survivalTime : survivalTime
    const newAvgTime = newTotalTime / newTotalContests
    
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        totalContests: newTotalContests,
        totalWins: newTotalWins,
        totalLosses: newTotalLosses,
        bestSurvivalTime: newBestTime,
        totalSurvivalTime: newTotalTime,
        averageSurvivalTime: newAvgTime,
        lastPlayedAt: new Date(),
      },
      create: {
        userId: user.id,
        totalContests: 1,
        totalWins: isWin ? 1 : 0,
        totalLosses: isLoss ? 1 : 0,
        bestSurvivalTime: survivalTime,
        totalSurvivalTime: survivalTime,
        averageSurvivalTime: survivalTime,
        lastPlayedAt: new Date(),
      }
    })

    return NextResponse.json({
      contest,
      rank,
      isNewRecord: newBestTime === survivalTime && (stats?.bestSurvivalTime || 0) < survivalTime
    }, { status: 201 })

  } catch (error) {
    console.error("Save contest error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
