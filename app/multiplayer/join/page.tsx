'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function JoinRoomPage() {
  const router = useRouter();
  const { status } = useSession();
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const handleJoin = async () => {
    if (!roomCode || roomCode.trim().length === 0) {
      setError('Please enter a room code');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const res = await fetch('/api/multiplayer-contests/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase() })
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to the contest room
        router.push(`/multiplayer/${data.contestId}`);
      } else {
        setError(data.error || 'Failed to join room');
      }
    } catch (err) {
      console.error('Join room error:', err);
      setError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleInputChange = (value: string) => {
    // Only allow alphanumeric characters and limit to 6
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(cleaned);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Join Game Room
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Enter the 6-character room code to join
            </p>

            {/* Room Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-6 py-4 text-2xl font-bold text-center tracking-widest rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                disabled={joining}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                {roomCode.length}/6 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={joining || roomCode.length !== 6}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Joining...
                </span>
              ) : (
                'Join Game'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            {/* Create New Game */}
            <button
              onClick={() => router.push('/multiplayer/create')}
              className="w-full px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Create New Game
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have a room code? Ask your friend to share it with you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
