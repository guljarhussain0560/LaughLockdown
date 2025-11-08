'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton'
import YourMemesWidget from '@/components/YourMemesWidget'

interface UserStats {
  totalContests: number
  totalWins: number
  totalLosses: number
  bestSurvivalTime: number
  averageSurvivalTime: number
  totalSurvivalTime: number
  currentStreak: number
  longestStreak: number
  lastPlayedAt: string | null
}

interface Contest {
  id: string
  survivalTime: number
  result: string
  memesViewed: number
  rank: number
  createdAt: string
}

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  username: string
  image: string | null
  bestSurvivalTime: number
  totalContests: number
  totalWins: number
  winRate: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [contests, setContests] = useState<Contest[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/user/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }

      // Fetch recent contests
      const contestsRes = await fetch('/api/contests?limit=10')
      if (contestsRes.ok) {
        const data = await contestsRes.json()
        setContests(data.contests)
      }

      // Fetch leaderboard
      const leaderboardRes = await fetch('/api/leaderboard?limit=10')
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading || status === 'loading') {
    return (
      <>
        <Navbar />
        <DashboardSkeleton />
      </>
    )
  }

  const winRate = stats && stats.totalContests > 0
    ? Math.round((stats.totalWins / stats.totalContests) * 100)
    : 0

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex justify-center">
          <div className="flex w-full max-w-[1280px]">
            {/* Left Sidebar - Quick Stats */}
            <div className="hidden lg:block lg:w-[275px] xl:w-[350px]">
              <div className="sticky px-3 lg:px-4 py-4 top-20">
                <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                  <h2 className="px-4 py-3 text-xl font-bold text-gray-900 dark:text-white">Quick Stats</h2>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Games</span>
                      <span className="font-bold text-gray-900 dark:text-white">{stats?.totalContests || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{winRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Best Time</span>
                      <span className="font-mono font-bold text-yellow-600 dark:text-yellow-400">
                        {formatTime(stats?.bestSurvivalTime || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">{stats?.currentStreak || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                  <h2 className="px-4 py-3 text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                  <div className="px-4 pb-4 space-y-2">
                    <Link
                      href="/game"
                      className="block w-full py-2 text-sm font-bold text-center text-white transition-colors bg-purple-600 rounded-full hover:bg-purple-700"
                    >
                      Play Solo
                    </Link>
                    <Link
                      href="/multiplayer/create"
                      className="block w-full py-2 text-sm font-bold text-center text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700"
                    >
                      Create Group Challenge
                    </Link>
                    <Link
                      href="/network"
                      className="block w-full py-2 text-sm font-bold text-center text-white transition-colors bg-green-600 rounded-full hover:bg-green-700"
                    >
                      Find Friends
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Stats */}
            <div className="flex-1 max-w-[600px] border-x-0 lg:border-x border-gray-200 dark:border-gray-800">
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm dark:border-gray-800">
                <div className="px-3 sm:px-4 py-3">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {session?.user?.name || 'Player'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Your laugh battle statistics
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                  <div className="p-3 sm:p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl sm:rounded-2xl touch-manipulation">
                    <div className="mb-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Total Games</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalContests || 0}</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl sm:rounded-2xl touch-manipulation">
                    <div className="mb-1 text-[10px] sm:text-xs text-green-600 dark:text-green-400">Wins</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalWins || 0}</div>
                    <div className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Win Rate: {winRate}%</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl sm:rounded-2xl touch-manipulation">
                    <div className="mb-1 text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">Best Time</div>
                    <div className="font-mono text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatTime(stats?.bestSurvivalTime || 0)}</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl sm:rounded-2xl touch-manipulation">
                    <div className="mb-1 text-[10px] sm:text-xs text-orange-600 dark:text-orange-400">Current Streak</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.currentStreak || 0}</div>
                    <div className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Best: {stats?.longestStreak || 0}</div>
                  </div>
                </div>
              </div>

              {/* Win/Loss Record */}
              <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="mb-3 text-base sm:text-lg font-bold text-gray-900 dark:text-white">Win/Loss Record</h2>
                <div className="p-3 sm:p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl sm:rounded-2xl">
                  <div className="space-y-3">
                    {/* Win Bar */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>Wins: {stats?.totalWins || 0}</span>
                        <span>{winRate}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-800">
                        <div
                          className="h-3 transition-all duration-500 bg-green-500 rounded-full"
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                    </div>
                    {/* Loss Bar */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>Losses: {stats?.totalLosses || 0}</span>
                        <span>{100 - winRate}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-800">
                        <div
                          className="h-3 transition-all duration-500 bg-red-500 rounded-full"
                          style={{ width: `${100 - winRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Games */}
              <div className="px-3 sm:px-4 py-3 sm:py-4">
                <h2 className="mb-3 text-base sm:text-lg font-bold text-gray-900 dark:text-white">Recent Games</h2>
                {contests.length === 0 ? (
                  <div className="py-6 sm:py-8 text-center">
                    <p className="mb-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">No games played yet.</p>
                    <Link href="/game" className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline touch-manipulation">
                      Start playing! →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contests.map((contest) => (
                      <div
                        key={contest.id}
                        className="p-3 sm:p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl sm:rounded-2xl touch-manipulation"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(contest.createdAt)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              contest.result === 'win'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {contest.result.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono font-bold text-gray-900 dark:text-white">{formatTime(contest.survivalTime)}</span>
                          <span className="text-gray-600 dark:text-gray-400">{contest.memesViewed} memes</span>
                          <span className="font-bold text-yellow-600 dark:text-yellow-400">#{contest.rank}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Play Now Button */}
              <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href="/game"
                  className="block w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold text-center text-white transition-colors rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 touch-manipulation"
                >
                  Play Now
                </Link>
              </div>
            </div>

            {/* Right Sidebar - Performance Details */}
            <div className="hidden xl:block xl:w-[350px] px-3 lg:px-4">
              <div className="sticky py-4 space-y-4 top-20">
                {/* Performance */}
                <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                  <h2 className="px-4 py-3 text-xl font-bold text-gray-900 dark:text-white">Performance</h2>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Average Time</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {formatTime(Math.round(stats?.averageSurvivalTime || 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Playing Time</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {formatTime(stats?.totalSurvivalTime || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Played</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {stats?.lastPlayedAt ? formatDate(stats.lastPlayedAt) : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Global Leaderboard */}
                <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                  <h2 className="px-4 py-3 text-xl font-bold text-gray-900 dark:text-white">Top Players</h2>
                  <div className="px-4 pb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {leaderboard.length === 0 ? (
                      <p className="py-4 text-center">No players yet. Be the first to play!</p>
                    ) : (
                      <div className="space-y-2">
                        {leaderboard.slice(0, 3).map((player) => {
                          const getRankColor = (rank: number) => {
                            if (rank === 1) return 'bg-yellow-500';
                            if (rank === 2) return 'bg-gray-400';
                            if (rank === 3) return 'bg-orange-600';
                            return 'bg-blue-500';
                          };
                          
                          const getBgColor = (rank: number) => {
                            if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20';
                            return 'bg-gray-50 dark:bg-gray-800/50';
                          };

                          return (
                            <div
                              key={player.userId}
                              className={`flex items-center gap-3 p-2 rounded-lg ${getBgColor(player.rank)}`}
                            >
                              <div className={`flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full ${getRankColor(player.rank)}`}>
                                {player.rank}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-900 truncate dark:text-white">
                                  {player.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatTime(player.bestSurvivalTime)} • {player.winRate}% WR
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {leaderboard.length > 3 && (
                          <Link
                            href="/leaderboard"
                            className="block py-2 mt-2 text-xs font-semibold text-center text-blue-600 rounded-lg dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            View Full Leaderboard →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Your Uploaded Memes */}
                <YourMemesWidget limit={6} showViewAll={true} />

                {/* Achievements Hint */}
                <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                  <h2 className="px-4 py-3 text-xl font-bold text-gray-900 dark:text-white">Progress Goals</h2>
                  <div className="px-4 pb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-3">Keep playing to unlock achievements!</p>
                    <div className="space-y-2">
                      {stats && stats.totalContests < 10 && (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded">
                            {stats.totalContests}/10
                          </div>
                          <span className="text-xs">Play {10 - stats.totalContests} more game{10 - stats.totalContests !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {stats && stats.currentStreak < 5 && (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded">
                            {stats.currentStreak}/5
                          </div>
                          <span className="text-xs">Win {5 - stats.currentStreak} more in a row</span>
                        </div>
                      )}
                      {stats && stats.bestSurvivalTime < 60 && (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-purple-500 rounded">
                            {formatTime(stats.bestSurvivalTime)}
                          </div>
                          <span className="text-xs">Survive 1 minute without laughing</span>
                        </div>
                      )}
                      {(!stats || (stats.totalContests >= 10 && stats.currentStreak >= 5 && stats.bestSurvivalTime >= 60)) && (
                        <div className="py-2 text-xs text-center text-green-600 dark:text-green-400">
                          All goals completed! 🎉
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
