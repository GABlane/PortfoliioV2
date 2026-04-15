'use client';

import { useRef, useCallback } from 'react';

export function usePspChime() {
  const played  = useRef(false);
  const ctxRef  = useRef<AudioContext | null>(null);
  const bufRef  = useRef<AudioBuffer | null>(null);

  // Preload the buffer the first time this hook mounts
  const preload = useCallback(() => {
    if (bufRef.current) return;
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      fetch('/sounds/deck_ui_launch_game.wav')
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => { bufRef.current = buf; })
        .catch(() => {});
    } catch {
      // unavailable
    }
  }, []);

  // Call preload immediately on first render (no user gesture needed for fetch)
  const preloadedRef = useRef(false);
  if (!preloadedRef.current) {
    preloadedRef.current = true;
    if (typeof window !== 'undefined') preload();
  }

  const play = useCallback(() => {
    if (played.current) return;
    played.current = true;

    try {
      const ctx = ctxRef.current ?? new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const buf = bufRef.current;
      if (!buf) return;

      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(ctx.destination);
      source.start();
    } catch {
      // audio unavailable — continue silently
    }
  }, []);

  return play;
}
