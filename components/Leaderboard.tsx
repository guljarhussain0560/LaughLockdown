'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '@/lib/leaderboard';
import { formatTime } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  if (entries.length === 0) {
    return (
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-500/50">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
          🏆 Leaderboard
        </h2>
        <p className="text-center text-gray-400">
          No scores yet! Be the first to play!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-500/50">
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
        🏆 Top Survivors
      </h2>
      
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <motion.div
            key={`${entry.name}-${entry.date}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center justify-between p-4 rounded-xl
              ${index === 0 ? 'bg-yellow-500/20 border-2 border-yellow-500' :
                index === 1 ? 'bg-gray-400/20 border-2 border-gray-400' :
                index === 2 ? 'bg-orange-600/20 border-2 border-orange-600' :
                'bg-gray-800/50 border border-gray-600'}
            `}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold w-8">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <div>
                <p className="font-bold text-white">{entry.name || 'Anonymous'}</p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {formatTime(entry.survivalTime)}
              </p>
              <p className="text-xs text-gray-400">
                {Math.floor(entry.survivalTime / 5)} memes
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
