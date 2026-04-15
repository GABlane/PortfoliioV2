'use client';

import { useRef, useCallback, useEffect } from 'react';

export function useNavSound() {
  const ctxRef      = useRef<AudioContext | null>(null);
  const navBufRef   = useRef<AudioBuffer | null>(null);
  const confBufRef  = useRef<AudioBuffer | null>(null);
  const loadedRef   = useRef(false);

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
      .then((buf) => { navBufRef.current = buf; })
      .catch(() => {});

    fetch('/sounds/confirmation_positive.wav')
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { confBufRef.current = buf; })
      .catch(() => {});
  }, [getCtx]);

  const playBuf = useCallback((buf: AudioBuffer | null, volume: number) => {
    if (!buf) return;
    try {
      const ctx    = getCtx();
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

  const playMove    = useCallback(() => playBuf(navBufRef.current,  0.6), [playBuf]);
  const playTab     = useCallback(() => playBuf(navBufRef.current,  0.7), [playBuf]);
  const playSelect  = useCallback(() => playBuf(navBufRef.current,  0.8), [playBuf]);
  const playConfirm = useCallback(() => playBuf(confBufRef.current, 0.9), [playBuf]);

  return { playMove, playTab, playSelect, playConfirm };
}
