'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function GamesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl px-3 py-4 mx-auto sm:px-4 sm:py-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              Meme Games
            </h1>
            <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
              Test your self-control with hilarious memes
            </p>
          </div>

          {/* Featured Game */}
          <div className="mb-4 sm:mb-8">
            <Link
              href="/game"
              className="block p-6 text-white transition-colors bg-blue-600 rounded-lg sm:p-8 md:p-12 hover:bg-blue-700 active:bg-blue-800 group touch-manipulation"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg sm:w-12 sm:h-12 bg-white/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <svg className="w-4 h-4 transition-transform transform sm:w-5 sm:h-5 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold sm:mb-3 sm:text-3xl md:text-4xl">
                Don&apos;t Laugh Challenge
              </h2>
              <p className="text-sm text-blue-100 sm:text-base md:text-lg">
                Try not to smile while viewing hilarious memes. AI tracks your face!
              </p>
            </Link>
          </div>

          {/* Game Options Grid */}
          <div className="grid grid-cols-1 gap-3 mb-4 sm:gap-4 md:gap-6 sm:mb-8 sm:grid-cols-2 md:grid-cols-3">
            {/* Play Solo */}
            <Link
              href="/game"
              className="p-4 transition-colors bg-white border border-gray-200 rounded-lg sm:p-6 dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800 group touch-manipulation"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20">
                  <svg className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 transition-transform transform sm:w-5 sm:h-5 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl dark:text-white">Play Solo</h3>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Start a single player challenge</p>
            </Link>

            {/* Create Multiplayer */}
            <Link
              href="/multiplayer/create"
              className="p-4 transition-colors bg-white border border-gray-200 rounded-lg sm:p-6 dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800 group touch-manipulation"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-900/20">
                  <svg className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 transition-transform transform sm:w-5 sm:h-5 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl dark:text-white">Create Room</h3>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Start a multiplayer game room</p>
            </Link>

            {/* Join with Code */}
            <Link
              href="/multiplayer/join"
              className="p-4 transition-colors bg-white border border-gray-200 rounded-lg sm:p-6 dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800 group touch-manipulation"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/20">
                  <svg className="w-5 h-5 text-green-600 sm:w-6 sm:h-6 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 transition-transform transform sm:w-5 sm:h-5 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl dark:text-white">Join with Code</h3>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Enter room code to join game</p>
            </Link>

            {/* Leaderboard */}
            <Link
              href="/leaderboard"
              className="p-4 transition-colors bg-white border border-gray-200 rounded-lg sm:p-6 dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800 group touch-manipulation"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg sm:w-12 sm:h-12 bg-yellow-50 dark:bg-yellow-900/20">
                  <svg className="w-5 h-5 text-yellow-600 sm:w-6 sm:h-6 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 transition-transform transform sm:w-5 sm:h-5 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl dark:text-white">Leaderboard</h3>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">View top players worldwide</p>
            </Link>
          </div>

          {/* How It Works */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg sm:p-6 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl dark:text-white">How It Works</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900/20">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Allow Camera Access</h3>
                  <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Grant permission to use your webcam for AI face detection</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900/20">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Watch Memes</h3>
                  <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">View hilarious memes while our AI tracks your facial expressions</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900/20">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Don&apos;t Smile!</h3>
                  <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Keep a straight face as long as possible to achieve a high score</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
