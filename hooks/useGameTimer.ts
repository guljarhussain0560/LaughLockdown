'use client';

import { useState, useEffect, useCallback } from 'react';

export function useGameTimer(isRunning: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = useCallback(() => {
    setSeconds(0);
  }, []);

  return { seconds, reset };
}
