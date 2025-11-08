'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /home if user is logged in
    if (status === 'authenticated') {
      router.push('/home');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  // Don't render landing page if authenticated (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  // Landing page for guests (before login)
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

        {/* Hero Section */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Don&apos;t Laugh Challenge
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                  Test your self-control with hilarious memes while AI tracks your face. Compete globally and climb the leaderboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    href="/auth/login"
                    className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors text-center touch-manipulation"
                  >
                    Play Now
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="px-6 sm:px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors text-center touch-manipulation"
                  >
                    Leaderboard
                  </Link>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center order-first lg:order-last">
                <div className="text-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-8 sm:w-10 h-8 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Game Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-12">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">10K+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">50K+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">2:45</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">Best Record</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 md:mb-12">Game Features</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Real-Time Detection</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                AI-powered facial recognition tracks your expressions instantly
              </p>
            </div>
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Multiplayer Mode</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Challenge friends and compete in group battles
              </p>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Global Leaderboard</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Track your rank and compete with players worldwide
              </p>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 md:mb-12">How to Play</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm sm:text-base">1</div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Enable Camera</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Allow camera access for face detection</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm sm:text-base">2</div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Keep Straight Face</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Watch memes without smiling</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 sm:col-span-2 md:col-span-1">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm sm:text-base">3</div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Beat Records</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Survive longer than other players</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Ready to Test Your Skills?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
              Join the challenge and see how long you can last
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-8 sm:px-10 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors touch-manipulation"
            >
              Start Playing
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
