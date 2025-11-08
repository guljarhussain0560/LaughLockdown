'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import MemeDisplay from '@/components/MemeDisplay';
import WebcamView from '@/components/WebcamView';
import GameHUD from '@/components/GameHUD';
import ResultModal from '@/components/ResultModal';
import GameSkeleton from '@/components/skeletons/GameSkeleton';
import { useMemeLoader } from '@/hooks/useMemeLoader';
import { useSmileDetection } from '@/hooks/useSmileDetection';
import { useGameTimer } from '@/hooks/useGameTimer';
import { savePersonalBest, getPersonalBest } from '@/lib/leaderboard';
import { cn } from '@/lib/utils';

export default function GamePage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [isPlaying, setIsPlaying] = useState(false); // Start paused for countdown
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'ended'>('playing');
  const [isSavingContest, setIsSavingContest] = useState(false);
  const [contestRank, setContestRank] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [endReason, setEndReason] = useState<'smiled' | 'no-face'>('smiled');
  const [countdown, setCountdown] = useState<number | null>(null); // Countdown state (3, 2, 1, null)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const { currentMeme, reset: resetMeme, skipToNext } = useMemeLoader(isPlaying);
  const { seconds: survivalTime, reset: resetTimer } = useGameTimer(isPlaying && gameState === 'playing');
  
  // FIX: Pass the ref object itself, not { current: null }
  const { status, isModelLoaded, reset: resetDetection } = useSmileDetection(
    videoRef,  // ✅ Pass the ref directly
    isPlaying && gameState === 'playing'
  );

  // Start countdown when AI model is loaded
  useEffect(() => {
    if (isModelLoaded && countdown === null && gameState === 'playing' && !isPlaying) {
      setCountdown(3); // Start 3-2-1 countdown
    }
  }, [isModelLoaded, countdown, gameState, isPlaying]);

  // Countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished, start game
      setCountdown(null);
      setIsPlaying(true);
    }
  }, [countdown]);

  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/game');
    }
  }, [authStatus, router]);

  // Save contest result when game ends
  const saveContestResult = useCallback(async (time: number) => {
    if (!session?.user?.email) return;
    
    setIsSavingContest(true);
    try {
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          survivalTime: time,
          result: 'loss', // They smiled/laughed
          memesViewed: Math.floor(time / 5), // Estimate based on time
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContestRank(data.rank);
        setIsNewRecord(data.isNewRecord);
      }
    } catch (error) {
      console.error('Failed to save contest:', error);
    } finally {
      setIsSavingContest(false);
    }
  }, [session]);

  // Check if player is out (smiled or no face detected)
  useEffect(() => {
    if ((status === 'out' || status === 'no-face') && gameState === 'playing') {
      setIsPlaying(false);
      setGameState('ended');
      setEndReason(status === 'no-face' ? 'no-face' : 'smiled');
      
      // Save personal best (localStorage for backwards compatibility)
      const personalBest = getPersonalBest();
      if (survivalTime > personalBest) {
        savePersonalBest(survivalTime);
      }

      // Save to database if authenticated
      if (session?.user) {
        saveContestResult(survivalTime);
      }
    }
  }, [status, gameState, survivalTime, session, saveContestResult]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setGameState('paused');
  }, []);

  const handleResume = useCallback(() => {
    setIsPlaying(true);
    setGameState('playing');
  }, []);

  const handleQuit = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleRetry = useCallback(() => {
    setIsPlaying(false); // Pause for countdown
    setGameState('playing');
    setContestRank(null);
    setIsNewRecord(false);
    setEndReason('smiled');
    setCountdown(3); // Start countdown again
    resetMeme();
    resetTimer();
    resetDetection();
  }, [resetMeme, resetTimer, resetDetection]);

  // Show loading while checking auth
  if (authStatus === 'loading') {
    return (
      <>
        <Navbar />
        <GameSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-full">
          {/* Main Game Area */}
          <div className="bg-white dark:bg-gray-900">
                
                {/* Game Header */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      Don&apos;t Laugh Challenge
                    </h1>
                    {isModelLoaded && (
                      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 md:py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
                        <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-400">
                          AI Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Model Loading Banner */}
                {!isModelLoaded && (
                  <div className="p-3 sm:p-4 mx-3 sm:mx-4 mt-3 sm:mt-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300">
                          Loading AI Model
                        </p>
                        <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400">
                          Initializing face detection...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Countdown Overlay */}
                {countdown !== null && countdown > 0 && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="p-12 text-center bg-white border-2 border-gray-200 shadow-2xl dark:bg-gray-900 dark:border-gray-700 rounded-3xl">
                      <p className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Starting in
                      </p>
                      <div className={cn(
                        "text-8xl font-black transition-all duration-300",
                        countdown === 3 && "text-red-600 dark:text-red-500",
                        countdown === 2 && "text-yellow-600 dark:text-yellow-500",
                        countdown === 1 && "text-green-600 dark:text-green-500"
                      )}>
                        {countdown}
                      </div>
                      <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
                        Don&apos;t smile!
                      </p>
                    </div>
                  </div>
                )}

                {/* Main Game Layout */}
                <div className="p-2 sm:p-3 md:p-4 max-w-7xl mx-auto">
                  {/* Video Section - Stacked on Mobile, Side by side on Desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                    {/* Meme Display */}
                    <div className="w-full overflow-hidden bg-gray-100 border border-gray-200 aspect-video dark:bg-gray-800 rounded-lg sm:rounded-xl dark:border-gray-700">
                      <MemeDisplay 
                        currentMeme={currentMeme} 
                        isPlaying={isPlaying} 
                        onSkip={skipToNext}
                      />
                    </div>

                    {/* Webcam Display - CRITICAL for mobile */}
                    <div className="w-full overflow-hidden bg-gray-100 border-2 border-blue-500 dark:border-blue-600 aspect-video dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg">
                      <WebcamView
                        status={status}
                        isActive={isPlaying && gameState === 'playing'}
                        onVideoRef={(ref) => {
                          videoRef.current = ref;
                        }}
                      />
                      {/* Mobile: AI Status Overlay */}
                      <div className="lg:hidden mt-2 text-center">
                        {!isModelLoaded && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading AI Model...
                          </div>
                        )}
                        {isModelLoaded && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-xs font-medium text-green-700 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            AI Detection Active
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Game HUD - Touch-optimized for mobile */}
                  <div className="max-w-4xl mx-auto touch-manipulation">
                    <GameHUD
                      survivalTime={survivalTime}
                      isPlaying={isPlaying}
                      onPause={handlePause}
                      onResume={handleResume}
                      onQuit={handleQuit}
                    />
                  </div>
                </div>

                {/* Result Modal */}
                {gameState === 'ended' && (
                  <ResultModal
                    survivalTime={survivalTime}
                    onRetry={handleRetry}
                    isNewRecord={isNewRecord}
                    rank={contestRank}
                    isSaving={isSavingContest}
                    endReason={endReason}
                  />
                )}
          </div>
        </div>
      </div>
    </>
  );
}
