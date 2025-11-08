'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export type GameStatus = 'neutral' | 'smiling' | 'out' | 'no-face';

interface SmileMetrics {
  mouthWidth: number;
  mouthHeight: number;
  smileRatio: number;
}

export function useSmileDetection(videoRef: React.RefObject<HTMLVideoElement>, isActive: boolean) {
  const [status, setStatus] = useState<GameStatus>('neutral');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const baselineMetricsRef = useRef<SmileMetrics[]>([]);
  const frameCountRef = useRef(0);
  const detectionCooldownRef = useRef(false);
  const consecutiveSmileFramesRef = useRef(0);
  const consecutiveNoFaceFramesRef = useRef(0);
  const faceDetectedRef = useRef(true);
  const warmupFramesRef = useRef(0); // Warmup period to ensure camera/AI is ready
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize TensorFlow and load Face Landmarks Detection model
  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        console.log('🤖 Loading TensorFlow.js Face Landmarks Detection Model...');
        
        // Try WebGL first, fallback to WASM for mobile compatibility
        try {
          await tf.setBackend('webgl');
          await tf.ready();
          console.log('✅ Using WebGL backend');
        } catch (webglError) {
          console.warn('⚠️ WebGL not available, falling back to WASM for mobile compatibility');
          await tf.setBackend('wasm');
          await tf.ready();
          console.log('✅ Using WASM backend (mobile-compatible)');
        }
        
        // Load the MediaPipeFaceMesh model
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'tfjs' as const,
          refineLandmarks: true,
          maxFaces: 1
        };
        
        const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        
        if (isMounted) {
          detectorRef.current = detector;
          setIsModelLoaded(true);
          console.log('✅ AI MODEL LOADED - MediaPipe Face Mesh with 478 Landmarks');
          console.log('🎯 Accurate smile detection using facial geometry analysis');
          console.log('📱 Mobile-optimized with automatic backend selection');
        }
      } catch (error) {
        console.error('❌ Failed to load AI model:', error);
        if (isMounted) {
          setIsModelLoaded(false);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // AI-POWERED SMILE DETECTION using Face Landmarks
  const detectSmile = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || !isModelLoaded || !isActive || detectionCooldownRef.current) return;

    try {
      const video = videoRef.current;
      
      // Skip if video not ready - wait for full video load
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        // Only log once when waiting
        if (frameCountRef.current === 0) {
          console.log('⏳ Waiting for video to be fully ready...', {
            readyState: video.readyState,
            width: video.videoWidth,
            height: video.videoHeight
          });
        }
        // Don't count as detection failure during video loading
        return;
      }

      // Create canvas if needed for better detection (especially important on mobile)
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        console.log('📱 Canvas created for mobile detection:', {
          width: canvasRef.current.width,
          height: canvasRef.current.height
        });
      }

      // Update canvas size if video dimensions changed (orientation change on mobile)
      if (canvasRef.current.width !== video.videoWidth || canvasRef.current.height !== video.videoHeight) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        console.log('📱 Canvas resized for mobile:', {
          width: canvasRef.current.width,
          height: canvasRef.current.height
        });
      }

      // Draw current video frame to canvas for better AI detection
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        // Mirror for front-facing camera (common on mobile)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvasRef.current.width, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.restore();
      }

      // AI-powered face and landmark detection
      // Use video directly on desktop, canvas on mobile for better performance
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const inputElement = isMobile ? canvasRef.current : video;
      
      const faces = await detectorRef.current.estimateFaces(inputElement, {
        flipHorizontal: !isMobile, // Already flipped in canvas for mobile
        staticImageMode: false
      });
      
      // Log detection results every 20 frames (1 second) to avoid spam
      if (frameCountRef.current % 20 === 0) {
        console.log(`📊 AI Frame ${frameCountRef.current}: ${faces ? faces.length : 0} face(s) detected`);
        if (faces && faces.length > 0) {
          console.log('✅ Face detected with', faces[0].keypoints?.length || 0, 'landmarks');
        } else {
          console.log('❌ No faces found. Video element:', {
            paused: video.paused,
            currentTime: video.currentTime,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
          });
        }
      }

      // Check if face is detected by AI
      if (!faces || faces.length === 0) {
        consecutiveNoFaceFramesRef.current++;
        
        // Extended grace period: Allow 100 frames (5 seconds) before elimination
        // This prevents false positives during initial camera/AI warmup
        if (consecutiveNoFaceFramesRef.current >= 100) {
          if (faceDetectedRef.current) {
            console.log('❌ AI: NO FACE DETECTED! Player removed from game.');
            faceDetectedRef.current = false;
            setStatus('no-face');
            return;
          }
        } else if (consecutiveNoFaceFramesRef.current === 40) {
          console.log(`⚠️ AI Warning: No face detected for 2 seconds`);
        } else if (consecutiveNoFaceFramesRef.current === 60) {
          console.log(`⚠️ AI Warning: No face detected for 3 seconds`);
        } else if (consecutiveNoFaceFramesRef.current === 80) {
          console.log(`⚠️ AI Warning: No face detected for 4 seconds - SHOW YOUR FACE!`);
        }
        return;
      }

      // Face detected by AI - reset no-face counter
      consecutiveNoFaceFramesRef.current = 0;
      faceDetectedRef.current = true;

      // Warmup period: Skip first 20 frames (1 second) to let camera/AI stabilize
      if (warmupFramesRef.current < 20) {
        warmupFramesRef.current++;
        if (warmupFramesRef.current === 20) {
          console.log('✅ Warmup complete - Detection active!');
        }
        return;
      }

      const face = faces[0];
      const keypoints = face.keypoints;

      // Validate we have the minimum keypoints needed
      if (!keypoints || keypoints.length < 100) {
        console.log('⚠️ AI: Insufficient landmarks detected');
        return;
      }

      // Extract mouth landmarks using MediaPipe Face Mesh indices
      const mouthLeft = keypoints[61];    // Left corner of mouth
      const mouthRight = keypoints[291];  // Right corner of mouth
      const mouthTop = keypoints[13];     // Upper lip center
      const mouthBottom = keypoints[14];  // Lower lip center

      if (!mouthLeft || !mouthRight || !mouthTop || !mouthBottom) {
        // Landmarks missing, but face is detected - don't count as no face
        return;
      }

      // Calculate smile metrics using AI-detected facial geometry
      const mouthWidth = Math.sqrt(
        Math.pow(mouthRight.x - mouthLeft.x, 2) + 
        Math.pow(mouthRight.y - mouthLeft.y, 2)
      );
      
      const mouthHeight = Math.sqrt(
        Math.pow(mouthBottom.x - mouthTop.x, 2) + 
        Math.pow(mouthBottom.y - mouthTop.y, 2)
      );

      // Smile ratio: width/height (higher = wider smile)
      const smileRatio = mouthWidth / (mouthHeight + 1);

      const currentMetrics: SmileMetrics = {
        mouthWidth,
        mouthHeight,
        smileRatio
      };

      // CALIBRATION PHASE: Establish baseline (first 10 frames = 0.5 seconds)
      frameCountRef.current++;
      if (frameCountRef.current <= 10) {
        baselineMetricsRef.current.push(currentMetrics);
        if (frameCountRef.current % 3 === 0) {
          console.log(`📊 AI Calibrating... ${frameCountRef.current}/10 - Stay neutral!`);
        }
        return;
      }

      // Calculate baseline averages
      if (baselineMetricsRef.current.length > 0) {
        const baseline = baselineMetricsRef.current.reduce((acc, m) => ({
          mouthWidth: acc.mouthWidth + m.mouthWidth,
          mouthHeight: acc.mouthHeight + m.mouthHeight,
          smileRatio: acc.smileRatio + m.smileRatio
        }), { mouthWidth: 0, mouthHeight: 0, smileRatio: 0 });

        const baselineAvg = {
          mouthWidth: baseline.mouthWidth / baselineMetricsRef.current.length,
          mouthHeight: baseline.mouthHeight / baselineMetricsRef.current.length,
          smileRatio: baseline.smileRatio / baselineMetricsRef.current.length
        };

        // Calculate percentage changes from baseline
        const widthChange = ((mouthWidth - baselineAvg.mouthWidth) / baselineAvg.mouthWidth) * 100;
        const ratioChange = ((smileRatio - baselineAvg.smileRatio) / baselineAvg.smileRatio) * 100;
        const heightChange = ((mouthHeight - baselineAvg.mouthHeight) / (baselineAvg.mouthHeight + 1)) * 100;

        // SIMPLE SMILE DETECTION - Just detect mouth width increase!
        // When you smile: mouth gets wider (corners pull out)
        // Simple rule: If mouth width increases by 12% or more = SMILE!
        
        const isSmiling = widthChange > 12;  // Simple: just check if mouth gets wider

        if (isSmiling) {
          consecutiveSmileFramesRef.current++;
        } else {
          consecutiveSmileFramesRef.current = 0;
        }

        // Debug logging every 10 frames
        if (frameCountRef.current % 10 === 0) {
          const mouthStatus = widthChange > 12 ? '😄 SMILING!' : '😐 NEUTRAL';
          
          console.log('🤖 AI DETECTION:', {
            status: mouthStatus,
            widthChange: `${widthChange.toFixed(1)}%`,
            ratioChange: `${ratioChange.toFixed(1)}%`,
            heightChange: `${heightChange.toFixed(1)}%`,
            isSmile: consecutiveSmileFramesRef.current >= 1
          });
        }

        // INSTANT DETECTION: Trigger on first smile (50ms response time at 20 FPS)
        if (consecutiveSmileFramesRef.current >= 1) {
          console.log('🎉 AI SMILE DETECTED! Width:', widthChange.toFixed(1), '% Ratio:', ratioChange.toFixed(1), '%');
          setStatus('smiling');
          
          // Cooldown to prevent multiple triggers
          detectionCooldownRef.current = true;
          consecutiveSmileFramesRef.current = 0;
          
          setTimeout(() => {
            setStatus('out');
          }, 300);
          
          // Shorter reset time for better responsiveness
          setTimeout(() => {
            detectionCooldownRef.current = false;
            console.log('🔄 Ready for next detection');
          }, 1500);
        }
      }

    } catch (error) {
      console.error('❌ AI Detection error:', error);
    }
  }, [videoRef, isModelLoaded, isActive]);

  // Start/stop AI detection
  useEffect(() => {
    if (isActive && isModelLoaded) {
      console.log('▶️ Starting AI SMILE DETECTION...');
      console.log('⏱️ Warming up camera and AI for 1 second...');
      frameCountRef.current = 0;
      baselineMetricsRef.current = [];
      detectionCooldownRef.current = false;
      consecutiveSmileFramesRef.current = 0;
      consecutiveNoFaceFramesRef.current = 0;
      faceDetectedRef.current = true;
      warmupFramesRef.current = 0; // Reset warmup counter
      detectionIntervalRef.current = setInterval(detectSmile, 50); // 20 FPS
      setStatus('neutral');
    } else {
      if (detectionIntervalRef.current) {
        console.log('⏹️ Stopping detection');
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      frameCountRef.current = 0;
      baselineMetricsRef.current = [];
      consecutiveSmileFramesRef.current = 0;
      consecutiveNoFaceFramesRef.current = 0;
      warmupFramesRef.current = 0; // Reset warmup
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isActive, isModelLoaded, detectSmile]);

  const reset = useCallback(() => {
    console.log('🔄 Manual reset');
    setStatus('neutral');
    frameCountRef.current = 0;
    baselineMetricsRef.current = [];
    detectionCooldownRef.current = false;
    consecutiveSmileFramesRef.current = 0;
    consecutiveNoFaceFramesRef.current = 0;
    faceDetectedRef.current = true;
    warmupFramesRef.current = 0; // Reset warmup
  }, []);

  const adjustSensitivity = useCallback((sensitivity: number) => {
    console.log(`🎯 Sensitivity: ${sensitivity === 0 ? 'Low' : sensitivity === 1 ? 'Medium' : 'High'}`);
  }, []);

  return { status, isModelLoaded, reset, adjustSensitivity };
}
