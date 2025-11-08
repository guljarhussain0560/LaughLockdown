'use client';

import { formatTime } from '@/lib/utils';
import { getPersonalBest } from '@/lib/leaderboard';
import { useEffect, useState } from 'react';

interface GameHUDProps {
  survivalTime: number;
  isPlaying: boolean;
  onPause: () => void;
  onResume: () => void;
  onQuit: () => void;
}

export default function GameHUD({
  survivalTime,
  isPlaying,
  onPause,
  onResume,
  onQuit,
}: GameHUDProps) {
  const [personalBest, setPersonalBest] = useState(0);

  useEffect(() => {
    setPersonalBest(getPersonalBest());
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Timer Display */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">SURVIVAL TIME</p>
            <p className="timer-display">{formatTime(survivalTime)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">PERSONAL BEST</p>
            <p className="text-3xl font-bold text-yellow-400">{formatTime(personalBest)}</p>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {isPlaying ? (
          <button
            onClick={onPause}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-full font-bold text-white transition-all duration-200"
          >
            ⏸️ Pause
          </button>
        ) : (
          <button
            onClick={onResume}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full font-bold text-white transition-all duration-200"
          >
            ▶️ Resume
          </button>
        )}
        <button
          onClick={onQuit}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-white transition-all duration-200"
        >
          🚪 Quit
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
        <p className="text-center text-sm text-blue-300">
          💡 <strong>Tip:</strong> Keep a straight face! The AI is watching your every move...
        </p>
      </div>
    </div>
  );
}
