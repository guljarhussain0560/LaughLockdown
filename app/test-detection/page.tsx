'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Webcam from 'react-webcam';
import { useSmileDetection } from '@/hooks/useSmileDetection';

export default function SmileDetectionTest() {
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  
  // FIX: Pass videoRef directly, not { current: null }
  const { status, isModelLoaded, reset, adjustSensitivity } = useSmileDetection(
    videoRef,  // ✅ Pass the ref directly
    isActive
  );

  const handleVideoRef = (video: HTMLVideoElement | null) => {
    videoRef.current = video;
    console.log('📹 Test page: Video element set', video ? 'Ready' : 'Null');
  };

  const handleSensitivityChange = (newSensitivity: number) => {
    setSensitivity(newSensitivity);
    adjustSensitivity(newSensitivity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-red-900 p-3 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 text-center">
          😄 Smile Detection Test
        </h1>
        <p className="text-sm sm:text-base text-gray-400 text-center mb-6 sm:mb-8">
          Test the accuracy of the smile detection system
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-900/50 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4 border border-purple-500/50 sm:border-2">
            <div className="text-gray-400 text-[10px] sm:text-sm mb-1">Model Status</div>
            <div className={`text-base sm:text-xl md:text-2xl font-bold ${isModelLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
              {isModelLoaded ? '✅' : '⏳'}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4 border border-purple-500/50 sm:border-2">
            <div className="text-gray-400 text-[10px] sm:text-sm mb-1">Detection Status</div>
            <div className={`text-base sm:text-xl md:text-2xl font-bold ${
              status === 'neutral' ? 'text-blue-400' :
              status === 'smiling' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {status === 'neutral' ? '😐' :
               status === 'smiling' ? '😄' :
               '💀'}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4 border border-purple-500/50 sm:border-2">
            <div className="text-gray-400 text-[10px] sm:text-sm mb-1">Active</div>
            <div className={`text-base sm:text-xl md:text-2xl font-bold ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
              {isActive ? '🟢' : '⚫'}
            </div>
          </div>
        </div>

        {/* Webcam View */}
        <div className="mb-4 sm:mb-6 relative">
          <div className={`rounded-2xl overflow-hidden border-4 ${
            status === 'neutral' ? 'border-green-500' :
            status === 'smiling' ? 'border-yellow-500 animate-pulse' :
            'border-red-500'
          }`}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'user',
              }}
              className="w-full"
              mirrored
              onUserMedia={() => {
                if (webcamRef.current?.video) {
                  handleVideoRef(webcamRef.current.video);
                }
              }}
            />
            
            {/* Status Overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className={`px-6 py-3 rounded-full font-bold text-lg ${
                status === 'neutral' ? 'bg-green-500/90 text-white' :
                status === 'smiling' ? 'bg-yellow-500/90 text-black animate-pulse' :
                'bg-red-500/90 text-white'
              }`}>
                {status === 'neutral' ? '😐 Keep a straight face' :
                 status === 'smiling' ? '😄 SMILE DETECTED!' :
                 '💀 YOU SMILED!'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 sm:space-y-4">
          {/* Start/Stop Button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => {
                setIsActive(!isActive);
                if (!isActive) reset();
              }}
              disabled={!isModelLoaded}
              className={`flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg md:text-xl transition-all touch-manipulation ${
                !isModelLoaded
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : isActive
                  ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl text-white'
              }`}
            >
              {isActive ? '⏹ Stop' : '▶️ Start'}
            </button>

            <button
              onClick={reset}
              disabled={!isActive}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-full font-bold text-base sm:text-lg md:text-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
            >
              🔄 Reset
            </button>
          </div>

          {/* Sensitivity Slider */}
          <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border-2 border-purple-500/50">
            <div className="flex justify-between items-center mb-4">
              <label className="text-white font-bold text-lg">
                Sensitivity Level
              </label>
              <span className="text-purple-400 font-mono text-xl">
                {sensitivity === 0 ? 'Low' : sensitivity === 1 ? 'Medium' : 'High'}
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={sensitivity}
              onChange={(e) => handleSensitivityChange(Number(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Less Sensitive</span>
              <span>Default</span>
              <span>More Sensitive</span>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p>• <strong>Low:</strong> Only detects strong, obvious smiles</p>
              <p>• <strong>Medium:</strong> Balanced detection (recommended)</p>
              <p>• <strong>High:</strong> Detects slight smiles and grins</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur rounded-xl p-6 border-2 border-purple-500/30">
            <h3 className="text-white font-bold text-lg mb-3">📋 How to Test</h3>
            <ol className="text-gray-300 space-y-2">
              <li>1. Wait for the model to load (green checkmark)</li>
              <li>2. Click &quot;Start Detection&quot; to begin</li>
              <li>3. Keep a neutral face - status should show &quot;Neutral&quot;</li>
              <li>4. Try smiling - it should detect and show &quot;Smiling&quot;</li>
              <li>5. Adjust sensitivity if needed</li>
            </ol>
            
            <div className="mt-4 pt-4 border-t border-purple-500/30">
              <h4 className="text-purple-400 font-semibold mb-2">✨ What Gets Detected:</h4>
              <p className="text-sm text-gray-400">
                Genuine smiles with widened mouth and raised corners, laughing with open mouth, grins with visible teeth
              </p>
              
              <h4 className="text-purple-400 font-semibold mb-2 mt-3">❌ What Doesn&apos;t Trigger:</h4>
              <p className="text-sm text-gray-400">
                Talking, yawning, neutral expressions, slight smirks below threshold
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full text-white font-semibold transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
