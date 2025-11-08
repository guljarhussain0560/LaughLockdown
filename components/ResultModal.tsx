'use client';

import { motion } from 'framer-motion';
import { formatTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ResultModalProps {
  survivalTime: number;
  onRetry: () => void;
  isNewRecord: boolean;
  rank?: number | null;
  isSaving?: boolean;
  endReason?: 'smiled' | 'no-face';
}

export default function ResultModal({ 
  survivalTime, 
  onRetry, 
  isNewRecord,
  rank,
  isSaving = false,
  endReason = 'smiled'
}: ResultModalProps) {
  const router = useRouter();

  const isNoFace = endReason === 'no-face';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Optional: close on backdrop click
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNoFace ? 'Game Ended' : 'Challenge Complete'}
            </h2>
            {isNewRecord && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-semibold rounded-full border border-yellow-300 dark:border-yellow-700">
                New Record
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isNoFace 
              ? 'Face detection lost. Keep your face visible to the camera.' 
              : 'You smiled! Better luck next time.'}
          </p>
        </div>

        {/* Survival Time - Featured */}
        <div className="px-6 py-8 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Survival Time
            </p>
            <p className="text-6xl font-bold text-gray-900 dark:text-white mb-1">
              {formatTime(survivalTime)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {Math.floor(survivalTime / 5)} memes viewed
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Performance</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {survivalTime < 30 ? 'Rookie' : survivalTime < 60 ? 'Pro' : survivalTime < 120 ? 'Expert' : 'Legend'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Global Rank</p>
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : rank ? (
              <p className="text-lg font-bold text-blue-600 dark:text-blue-500">
                #{rank}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                --
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-6 space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Play Again</span>
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 text-sm"
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Footer Message */}
        {isNewRecord && (
          <div className="px-6 pb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Congratulations on your new personal record!
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
