
'use client';

import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { WEBCAM_CONFIG } from '@/lib/constants';
import { GameStatus } from '../hooks/useSmileDetection';

interface WebcamViewProps {
  status: GameStatus;
  isActive: boolean;
  onVideoRef: (ref: HTMLVideoElement | null) => void;
}

export default function WebcamView({ status, isActive, onVideoRef }: WebcamViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoPassedRef = useRef(false); // Track if we've already passed the video ref

  useEffect(() => {
    // Request webcam permission
    async function requestPermission() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
      } catch (error) {
        console.error('Webcam permission denied:', error);
        setHasPermission(false);
      }
    }
    requestPermission();
  }, []);

  // Handle when webcam loads
  const handleUserMedia = () => {
    console.log('📹 Webcam stream started');
    if (webcamRef.current?.video) {
      const video = webcamRef.current.video;
      
      // Wait for video metadata to load
      const checkVideoReady = () => {
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          console.log('✅ Video fully loaded:', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
          
          // Only pass video ref once when it's truly ready
          if (!videoPassedRef.current) {
            onVideoRef(video);
            videoPassedRef.current = true;
            setVideoReady(true);
          }
        } else {
          console.log('⏳ Video loading...', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
          // Check again in 100ms
          setTimeout(checkVideoReady, 100);
        }
      };
      
      checkVideoReady();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'neutral':
        return 'border-green-500';
      case 'smiling':
        return 'border-yellow-500 animate-pulse';
      case 'out':
        return 'border-red-500';
      case 'no-face':
        return 'border-orange-500 animate-pulse';
      default:
        return 'border-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'neutral':
        return '🤖 AI Active - Neutral Face';
      case 'smiling':
        return '😄 AI: Smile Detected!';
      case 'out':
        return '💀 YOU\'RE OUT!';
      case 'no-face':
        return '⚠️ AI: Show Your Face!';
      default:
        return 'Loading AI Model...';
    }
  };

  if (hasPermission === false) {
    return (
      <div className="relative w-full h-full bg-red-900/20 rounded-lg border-4 border-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-xl font-bold mb-2">❌ Webcam Access Denied</p>
          <p className="text-gray-300 text-sm">
            Please allow webcam access to play the game
          </p>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="relative w-full h-full bg-gray-900 rounded-lg border-4 border-gray-500 flex items-center justify-center">
        <p className="text-white text-xl">Requesting webcam access...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className={`relative w-full h-full rounded-lg border-4 overflow-hidden ${getStatusColor()}`}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={WEBCAM_CONFIG}
          className="w-full h-full object-cover"
          mirrored
          onUserMedia={handleUserMedia}
        />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className={`
            px-4 py-2 rounded-lg font-bold text-center
            ${status === 'neutral' ? 'bg-green-500/90 text-white' : ''}
            ${status === 'smiling' ? 'bg-yellow-500/90 text-black animate-pulse' : ''}
            ${status === 'out' ? 'bg-red-500/90 text-white' : ''}
            ${status === 'no-face' ? 'bg-orange-500/90 text-white animate-pulse' : ''}
          `}>
            {getStatusText()}
          </div>
        </div>

        {/* Scanning Effect */}
        {isActive && status === 'neutral' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 via-transparent to-green-500/20 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
