'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Meme {
  id: string;
  url: string;
  type: string;
  duration: number | null;
  title: string | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface MemeDisplayProps {
  currentMeme: Meme | null;
  isPlaying: boolean;
  onSkip?: () => void;
}

export default function MemeDisplay({ currentMeme, isPlaying, onSkip }: MemeDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Set initial volume when video loads
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [currentMeme, volume, isMuted]);

  // Auto-play video when it changes
  useEffect(() => {
    if (videoRef.current && isPlaying && !isVideoPaused) {
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    }
  }, [currentMeme, isPlaying, isVideoPaused]);

  // Pause/resume video based on game state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && !isVideoPaused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isVideoPaused]);

  const toggleVideoPlayPause = () => {
    if (videoRef.current) {
      if (isVideoPaused) {
        videoRef.current.play();
        setIsVideoPaused(false);
      } else {
        videoRef.current.pause();
        setIsVideoPaused(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
  };

  if (!currentMeme) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading memes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMeme.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          {currentMeme.type === 'video' ? (
            <video
              ref={videoRef}
              src={currentMeme.url}
              muted={false}
              playsInline
              className="max-w-full max-h-full object-contain"
              onEnded={() => {
                // Video ended, skip button will handle next meme
              }}
            />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={currentMeme.url}
                alt={currentMeme.title || 'Meme'}
                fill
                className="object-contain"
                priority
                unoptimized={currentMeme.type === 'gif'}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Video Controls - Only show for videos during gameplay */}
      {isPlaying && currentMeme.type === 'video' && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={toggleVideoPlayPause}
            className="bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-lg shadow-lg transition-all hover:scale-105"
            aria-label={isVideoPaused ? 'Play video' : 'Pause video'}
          >
            {isVideoPaused ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            )}
          </button>

          {/* Volume Control */}
          <div 
            className="relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={toggleMute}
              className="bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-lg shadow-lg transition-all hover:scale-105"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <div className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
                <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="text-white text-xs font-semibold w-8 text-right">{Math.round(volume * 100)}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skip Button - Only show during gameplay */}
      {isPlaying && onSkip && (
        <button
          onClick={onSkip}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          aria-label="Skip to next meme"
        >
          <span>Skip</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Meme Info Overlay */}
      {currentMeme.user && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
          <p className="text-xs font-medium">
            By: {currentMeme.user.name || currentMeme.user.username || 'Anonymous'}
          </p>
        </div>
      )}

      {/* Paused Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white text-2xl font-bold">Game Paused</p>
          </div>
        </div>
      )}
    </div>
  );
}
