'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import NetworkSkeleton from '@/components/skeletons/NetworkSkeleton';

interface User {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  avatar: string | null;
  friendStatus?: 'friends' | 'pending_sent' | 'pending_received' | 'none';
  userStats?: {
    totalContests: number;
    totalWins: number;
    bestSurvivalTime: number;
  } | null;
  friendshipId?: string;
  createdAt?: string;
}

interface FriendRequest {
  id: string;
  sender?: User;
  receiver?: User;
  createdAt: string;
}

export default function NetworkPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      // Fetch friends
      const friendsRes = await fetch('/api/friends');
      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends);
      }

      // Fetch received requests
      const receivedRes = await fetch('/api/friend-requests?type=received');
      if (receivedRes.ok) {
        const data = await receivedRes.json();
        setReceivedRequests(data.requests);
      }

      // Fetch sent requests
      const sentRes = await fetch('/api/friend-requests?type=sent');
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      setError(null);
      const res = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send request');
        return;
      }

      setSuccess('Friend request sent!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh data
      await fetchData();
      await handleSearch();
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request');
    }
  };

  const respondToRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setError(null);
      const res = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to respond to request');
        return;
      }

      setSuccess(action === 'accept' ? 'Friend request accepted!' : 'Friend request declined');
      setTimeout(() => setSuccess(null), 3000);

      await fetchData();
    } catch (error) {
      console.error('Error responding to request:', error);
      setError('Failed to respond to request');
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to cancel request');
        return;
      }

      setSuccess('Friend request cancelled');
      setTimeout(() => setSuccess(null), 3000);

      await fetchData();
      await handleSearch();
    } catch (error) {
      console.error('Error cancelling request:', error);
      setError('Failed to cancel request');
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      setError(null);
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to remove friend');
        return;
      }

      setSuccess('Friend removed');
      setTimeout(() => setSuccess(null), 3000);

      await fetchData();
    } catch (error) {
      console.error('Error removing friend:', error);
      setError('Failed to remove friend');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || status === 'loading') {
    return (
      <>
        <Navbar />
        <NetworkSkeleton />
      </>
    );
  }

  const pendingRequestsCount = receivedRequests.length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-300">
              {success}
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Network</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
              Connect with friends for group challenges
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-1 sm:p-2">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                activeTab === 'friends'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`relative flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Requests
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Search
            </button>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Your Friends
                </h2>
                {friends.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">No friends yet.</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:underline font-semibold touch-manipulation inline-block py-2"
                    >
                      Find friends to connect with →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl"
                      >
                        {friend.image || friend.avatar ? (
                          <Image
                            src={friend.image || friend.avatar || ''}
                            alt={friend.name || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-base sm:text-lg font-semibold">
                              {friend.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {friend.name || 'Unknown'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            @{friend.username || 'unknown'}
                          </div>
                          {friend.userStats && (
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {friend.userStats.totalWins}W / {friend.userStats.totalContests}G • Best: {formatTime(friend.userStats.bestSurvivalTime)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <Link
                            href={`/multiplayer/create?invite=${friend.id}`}
                            className="px-2 sm:px-3 py-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors touch-manipulation whitespace-nowrap"
                          >
                            Invite
                          </Link>
                          <button
                            onClick={() => removeFriend(friend.id)}
                            className="px-2 sm:px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors touch-manipulation"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="p-6">
                {/* Received Requests */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Received Requests
                  </h2>
                  {receivedRequests.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No pending requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {receivedRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                        >
                          {request.sender?.image || request.sender?.avatar ? (
                            <Image
                              src={request.sender.image || request.sender.avatar || ''}
                              alt={request.sender.name || 'User'}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-lg font-semibold">
                                {request.sender?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {request.sender?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              @{request.sender?.username || 'unknown'}
                            </div>
                            {request.sender?.userStats && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {request.sender.userStats.totalWins}W / {request.sender.userStats.totalContests}G
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => respondToRequest(request.id, 'accept')}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToRequest(request.id, 'reject')}
                              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Sent Requests
                  </h2>
                  {sentRequests.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No pending sent requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {sentRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                        >
                          {request.receiver?.image || request.receiver?.avatar ? (
                            <Image
                              src={request.receiver.image || request.receiver.avatar || ''}
                              alt={request.receiver.name || 'User'}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-lg font-semibold">
                                {request.receiver?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {request.receiver?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              @{request.receiver?.username || 'unknown'}
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                              Pending...
                            </div>
                          </div>
                          <button
                            onClick={() => cancelRequest(request.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Find Friends
                </h2>
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by username or name..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {searchResults.length === 0 && searchQuery.trim().length >= 2 && !searching && (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No users found matching &quot;{searchQuery}&quot;
                  </p>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        {user.image || user.avatar ? (
                          <Image
                            src={user.image || user.avatar || ''}
                            alt={user.name || 'User'}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-lg font-semibold">
                              {user.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {user.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            @{user.username || 'unknown'}
                          </div>
                          {user.userStats && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {user.userStats.totalWins}W / {user.userStats.totalContests}G • Best: {formatTime(user.userStats.bestSurvivalTime)}
                            </div>
                          )}
                        </div>
                        {user.friendStatus === 'friends' && (
                          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg">
                            Friends
                          </span>
                        )}
                        {user.friendStatus === 'pending_sent' && (
                          <span className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-medium rounded-lg">
                            Pending...
                          </span>
                        )}
                        {user.friendStatus === 'pending_received' && (
                          <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg">
                            Respond in Requests
                          </span>
                        )}
                        {user.friendStatus === 'none' && (
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length < 2 && (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8 text-sm">
                    Enter at least 2 characters to search for users
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
