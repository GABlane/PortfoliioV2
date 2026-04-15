'use client';

import { useRef, useCallback, useEffect } from 'react';

export function useNavSound() {
  const ctxRef    = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const loadedRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const ctx = getCtx();
    fetch('/sounds/deck_ui_navigation.wav')
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { bufferRef.current = buf; })
      .catch(() => {});
  }, [getCtx]);

  const play = useCallback((volume = 1) => {
    try {
      const ctx = getCtx();
      const buf = bufferRef.current;
      if (!buf) return;

      const source = ctx.createBufferSource();
      const gain   = ctx.createGain();
      source.buffer = buf;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch {
      // audio context unavailable
    }
  }, [getCtx]);

  const playMove   = useCallback(() => play(0.6), [play]);
  const playTab    = useCallback(() => play(0.7), [play]);
  const playSelect = useCallback(() => play(0.8), [play]);

  return { playMove, playTab, playSelect };
}
