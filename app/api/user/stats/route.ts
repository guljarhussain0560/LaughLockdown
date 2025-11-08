import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userStats: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Return user stats
    const stats = user.userStats || {
      totalContests: 0,
      totalWins: 0,
      totalLosses: 0,
      bestSurvivalTime: 0,
      totalSurvivalTime: 0,
      averageSurvivalTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedAt: null,
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
