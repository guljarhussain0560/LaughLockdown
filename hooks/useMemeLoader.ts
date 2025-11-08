'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

export function useMemeLoader(isPlaying: boolean) {
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const [memeQueue, setMemeQueue] = useState<Meme[]>([]);
  const [memeIndex, setMemeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch random memes from database
  const fetchMemes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/memes/random?count=20');
      const data = await response.json();
      
      if (data.memes && data.memes.length > 0) {
        setMemeQueue(data.memes);
        setCurrentMeme(data.memes[0]);
        setMemeIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch memes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize meme queue
  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);

  // Function to move to next meme
  const nextMeme = useCallback(() => {
    if (memeQueue.length === 0) return;

    setMemeIndex((prev) => {
      const next = (prev + 1) % memeQueue.length;
      
      // Fetch new batch when we're near the end
      if (next >= memeQueue.length - 3) {
        fetchMemes();
      }
      
      setCurrentMeme(memeQueue[next]);
      return next;
    });
  }, [memeQueue, fetchMemes]);

  // Auto-rotate memes based on type and duration
  useEffect(() => {
    if (!isPlaying || !currentMeme) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Determine wait time based on meme type
    let waitTime = 5000; // Default 5 seconds for images

    if (currentMeme.type === 'video' && currentMeme.duration) {
      // Wait for video duration (convert to milliseconds)
      waitTime = currentMeme.duration * 1000;
    } else if (currentMeme.type === 'gif') {
      // GIFs play for 8 seconds (allowing multiple loops)
      waitTime = 8000;
    }

    timeoutRef.current = setTimeout(() => {
      nextMeme();
    }, waitTime);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentMeme, nextMeme]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    fetchMemes();
  }, [fetchMemes]);

  const skipToNext = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    nextMeme();
  }, [nextMeme]);

  return { 
    currentMeme, 
    reset, 
    skipToNext,
    isLoading 
  };
}
