'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import LeaderboardSkeleton from '@/components/skeletons/LeaderboardSkeleton';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username: string;
  image: string | null;
  bestSurvivalTime: number;
  totalContests: number;
  totalWins: number;
  winRate: number;
}

interface GroupChallenge {
  id: string;
  title: string;
  status: string;
  participantCount: number;
  winner: {
    name: string;
    image: string | null;
    survivalTime: number;
  } | null;
  createdAt: string;
}

interface ContestParticipant {
  survivalTime: number | null;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface MultiplayerContest {
  id: string;
  title: string | null;
  status: string;
  createdAt: string;
  participants: ContestParticipant[];
}

type TabType = 'individual' | 'group';

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groupChallenges, setGroupChallenges] = useState<GroupChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userId: string | null = null;
        
        // First, get current user's ID
        if (session?.user?.email) {
          const userRes = await fetch(`/api/user/profile`);
          if (userRes.ok) {
            const userData = await userRes.json();
            userId = userData.user?.id || null;
            setCurrentUserId(userId);
          }
        }

        // Fetch individual leaderboard
        const res = await fetch('/api/leaderboard?limit=100');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard);
          
          // Find current user's rank
          if (userId) {
            const myEntry = data.leaderboard.find(
              (entry: LeaderboardEntry) => entry.userId === userId
            );
            if (myEntry) {
              setMyRank(myEntry.rank);
            }
          }
        }

        // Fetch group challenges
        const groupRes = await fetch('/api/multiplayer-contests?status=completed');
        if (groupRes.ok) {
          const groupData = await groupRes.json();
          const formattedChallenges = (groupData.contests as MultiplayerContest[] || []).map((contest) => {
            // Find winner (participant with highest survival time)
            const winner = contest.participants
              ?.filter((p) => p.survivalTime !== null)
              .sort((a, b) => (b.survivalTime || 0) - (a.survivalTime || 0))[0];

            return {
              id: contest.id,
              title: contest.title || 'Untitled Challenge',
              status: contest.status,
              participantCount: contest.participants?.length || 0,
              winner: winner ? {
                name: winner.user.name || 'Unknown',
                image: winner.user.image,
                survivalTime: winner.survivalTime || 0
              } : null,
              createdAt: contest.createdAt
            };
          });
          setGroupChallenges(formattedChallenges);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, session?.user?.email]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || status === 'loading') {
    return (
      <>
        <Navbar />
        <LeaderboardSkeleton />
      </>
    );
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl px-3 sm:px-4 py-6 sm:py-8 mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 text-center">
            <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
              Track rankings across solo games and group challenges
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors relative whitespace-nowrap touch-manipulation ${
                activeTab === 'individual'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Individual Games
              {activeTab === 'individual' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors relative whitespace-nowrap touch-manipulation ${
                activeTab === 'group'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Group Challenges
              {activeTab === 'group' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </div>

          {myRank && activeTab === 'individual' && (
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                Your Global Rank: #{myRank}
              </p>
            </div>
          )}

          {/* Individual Games Tab */}
          {activeTab === 'individual' && (
            <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg">
              {leaderboard.length === 0 ? (
                <div className="py-8 sm:py-12 text-center px-4">
                  <p className="mb-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">No players on the leaderboard yet.</p>
                  <Link href="/game" className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline touch-manipulation inline-block py-2">
                    Be the first to play! →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto touch-manipulation">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-left text-gray-600 uppercase dark:text-gray-400">
                          Rank
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-left text-gray-600 uppercase dark:text-gray-400">
                          Player
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-center text-gray-600 uppercase dark:text-gray-400">
                          Best Time
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-center text-gray-600 uppercase dark:text-gray-400">
                          Games
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-center text-gray-600 uppercase dark:text-gray-400">
                          Wins
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-center text-gray-600 uppercase dark:text-gray-400">
                          Win Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {leaderboard.map((player) => {
                        const isTopThree = player.rank <= 3;
                        const isCurrentUser = currentUserId && player.userId === currentUserId;

                        return (
                          <tr
                            key={player.userId}
                            className={`${
                              isCurrentUser 
                                ? 'bg-blue-50 dark:bg-blue-900/20' 
                                : isTopThree 
                                ? 'bg-yellow-50/50 dark:bg-yellow-900/10' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            } transition-colors`}
                          >
                            <td className="px-4 py-4">
                              <div className={`flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full ${getRankBadgeColor(player.rank)}`}>
                                {player.rank}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                {player.image ? (
                                  <Image
                                    src={player.image}
                                    alt={player.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                                    <span className="font-semibold">{player.name.charAt(0)}</span>
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {player.name}
                                    {isCurrentUser && (
                                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    @{player.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                                {formatTime(player.bestSurvivalTime)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-gray-900 dark:text-white">
                                {player.totalContests}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {player.totalWins}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {player.winRate}%
                                </span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                                  <div
                                    className="h-2 transition-all bg-green-500 rounded-full"
                                    style={{ width: `${player.winRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Group Challenges Tab */}
          {activeTab === 'group' && (
            <div className="space-y-4">
              {groupChallenges.length === 0 ? (
                <div className="py-12 text-center bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg">
                  <p className="mb-3 text-gray-600 dark:text-gray-400">No completed group challenges yet.</p>
                  <Link href="/multiplayer/create" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Create a challenge! →
                  </Link>
                </div>
              ) : (
                groupChallenges.map((challenge, index) => (
                  <div
                    key={challenge.id}
                    className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Challenge #{groupChallenges.length - index}
                          </span>
                          {challenge.title && (
                            <>
                              <span className="text-gray-400 dark:text-gray-600">•</span>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {challenge.title}
                              </h3>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{challenge.participantCount} participants</span>
                          <span>•</span>
                          <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {challenge.winner && (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-yellow-500 rounded-full">
                            👑
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase">
                              Winner
                            </div>
                            <div className="flex items-center gap-2">
                              {challenge.winner.image ? (
                                <Image
                                  src={challenge.winner.image}
                                  alt={challenge.winner.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-6 h-6 text-xs text-white rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                                  {challenge.winner.name.charAt(0)}
                                </div>
                              )}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {challenge.winner.name}
                              </span>
                              <span className="text-gray-400 dark:text-gray-600">•</span>
                              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                                {formatTime(challenge.winner.survivalTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
