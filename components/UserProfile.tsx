'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user stats
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
    );
  }

  if (!session) {
    return (
      <Link
        href="/auth/login"
        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white hover:shadow-lg transition-all duration-200"
      >
        Sign In
      </Link>
    );
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700 hover:border-purple-500 transition-all duration-200"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'
          )}
        </div>
        
        {/* Name & Stats */}
        <div className="text-left hidden md:block">
          <p className="text-sm font-semibold text-white">
            {session.user.name || 'User'}
          </p>
          {stats && (
            <p className="text-xs text-gray-400">
              {stats.totalContests} games played
            </p>
          )}
        </div>

        {/* Dropdown Icon */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{session.user.name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                </div>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-black/30 rounded-lg">
                    <p className="text-lg font-bold text-green-400">{stats.totalWins}</p>
                    <p className="text-xs text-gray-400">Wins</p>
                  </div>
                  <div className="text-center p-2 bg-black/30 rounded-lg">
                    <p className="text-lg font-bold text-red-400">{stats.totalLosses}</p>
                    <p className="text-xs text-gray-400">Losses</p>
                  </div>
                  <div className="text-center p-2 bg-black/30 rounded-lg">
                    <p className="text-lg font-bold text-yellow-400">{stats.bestSurvivalTime}s</p>
                    <p className="text-xs text-gray-400">Best</p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-xl">📊</span>
                <span className="text-white font-medium">Dashboard</span>
              </Link>

              <Link
                href="/smile-network"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-xl">😊</span>
                <span className="text-white font-medium">Smile Network</span>
              </Link>

              <Link
                href="/game"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-xl">🎮</span>
                <span className="text-white font-medium">Play Solo</span>
              </Link>

              <Link
                href="/multiplayer/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-xl">👥</span>
                <span className="text-white font-medium">Create Contest</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-xl">⚙️</span>
                <span className="text-white font-medium">Settings</span>
              </Link>

              <div className="my-2 border-t border-gray-700"></div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/20 transition-colors text-red-400"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
