'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseGamePauseOptions {
  running: boolean;
  gameOver?: boolean;
  onPause?: () => void;
  onResume?: () => void;
}

export function useGamePause({ running, gameOver = false, onPause, onResume }: UseGamePauseOptions) {
  const [paused, setPaused] = useState(false);

  const setPausedSafe = useCallback(
    (next: boolean) => {
      setPaused((prev) => {
        if (prev === next) return prev;
        if (next) onPause?.();
        else onResume?.();
        return next;
      });
    },
    [onPause, onResume],
  );

  const toggle = useCallback(() => {
    if (!running || gameOver) return;
    setPausedSafe(!paused);
  }, [running, gameOver, paused, setPausedSafe]);

  useEffect(() => {
    if (!running || gameOver) {
      if (paused) setPausedSafe(false);
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        setPausedSafe(!paused);
      }
    };

    const onVisibility = () => {
      if (document.hidden && !paused) setPausedSafe(true);
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [running, gameOver, paused, setPausedSafe]);

  return { paused, toggle, setPaused: setPausedSafe };
}
