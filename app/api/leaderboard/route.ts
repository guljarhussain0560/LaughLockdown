import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get global leaderboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get top players by best survival time
    const topPlayers = await prisma.userStats.findMany({
      where: {
        totalContests: {
          gt: 0, // Only users who have played at least one game
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        bestSurvivalTime: 'desc',
      },
      take: limit,
    });

    // Format the response with rank
    const leaderboard = topPlayers.map((player, index) => ({
      rank: index + 1,
      userId: player.user.id,
      name: player.user.name || 'Unknown Player',
      username: player.user.username || 'unknown',
      image: player.user.image || player.user.avatar,
      bestSurvivalTime: player.bestSurvivalTime,
      totalContests: player.totalContests,
      totalWins: player.totalWins,
      winRate: player.totalContests > 0 
        ? Math.round((player.totalWins / player.totalContests) * 100) 
        : 0,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
