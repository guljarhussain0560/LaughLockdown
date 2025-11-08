'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MultiplayerCreateSkeleton from '@/components/skeletons/MultiplayerCreateSkeleton'
import YourMemesWidget from '@/components/YourMemesWidget'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface Connection {
  user: User
  isDirect: boolean
}

export default function CreateMultiplayerPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [title, setTitle] = useState('')
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchConnections()
      
      // Pre-select user from URL if provided
      const userEmail = searchParams.get('user')
      if (userEmail) {
        setSelectedUsers([userEmail])
      }
    }
  }, [status, router, searchParams])

  const fetchConnections = async () => {
    try {
      console.log('Fetching connections from /api/smile-connections...')
      const res = await fetch('/api/smile-connections')
      console.log('Connections response status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Connections data:', data)
        setConnections(data.eligiblePartners || [])
      } else {
        const error = await res.json()
        console.error('Failed to fetch connections:', error)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = (email: string) => {
    setSelectedUsers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  const createContest = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one player')
      return
    }

    setCreating(true)
    try {
      console.log('Creating contest with:', { title, participantEmails: selectedUsers })
      
      const res = await fetch('/api/multiplayer-contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          participantEmails: selectedUsers
        })
      })

      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)

      if (res.ok) {
        alert(data.message || 'Contest created!')
        router.push(`/multiplayer/${data.contest.id}`)
      } else {
        alert(data.error || 'Failed to create contest')
      }
    } catch (error) {
      console.error('Create contest error:', error)
      alert('Network error: Failed to create contest. Please check console for details.')
    } finally {
      setCreating(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <>
        <Navbar />
        <MultiplayerCreateSkeleton />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors touch-manipulation py-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Group Challenge
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Challenge your friends to see who can keep a straight face the longest
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Contest Title Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Challenge Name (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Friday Night Challenge"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Select Players Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Select Players
                </h2>

                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No friends in your network yet</p>
                    <button
                      onClick={() => router.push('/network')}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Add Friends
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {selectedUsers.length} player{selectedUsers.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {connections.map((conn, index) => (
                        <div
                          key={conn.user.id + index}
                          onClick={() => toggleUser(conn.user.email)}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedUsers.includes(conn.user.email)
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {conn.user.name?.[0] || conn.user.email[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {conn.user.name || 'Anonymous'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {conn.user.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedUsers.includes(conn.user.email) && (
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              {connections.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createContest}
                    disabled={creating || selectedUsers.length === 0}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  >
                    {creating ? 'Creating...' : 'Create Challenge'}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Your Memes Widget */}
              <YourMemesWidget limit={3} showViewAll={true} />

              {/* Challenge Info */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">How It Works</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p>Select friends to invite</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p>Everyone plays the same game</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p>Longest survival time wins</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <p>See results on leaderboard</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {selectedUsers.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Challenge Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Players</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedUsers.length + 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">You</span>
                      <span className="text-gray-900 dark:text-white">Host</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Invited</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedUsers.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
