'use client';

import { useRef, useCallback, useEffect } from 'react';

type SoundKey = 'move' | 'tab' | 'select';

const SOUND_SRCS: Record<SoundKey, string> = {
  move:   '/sounds/deck_ui_navigation.wav',
  tab:    '/sounds/deck_ui_tab_transition_01.wav',
  select: '/sounds/deck_ui_default_activation.wav',
};

export function useNavSound() {
  const ctxRef     = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Partial<Record<SoundKey, AudioBuffer>>>({});
  const loadedRef  = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Preload all buffers once on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const ctx = getCtx();
    (Object.entries(SOUND_SRCS) as [SoundKey, string][]).forEach(([key, src]) => {
      fetch(src)
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => { buffersRef.current[key] = buf; })
        .catch(() => {/* silent — file may not exist */});
    });
  }, [getCtx]);

  const play = useCallback((key: SoundKey, volume = 1) => {
    try {
      const ctx = getCtx();
      const buf = buffersRef.current[key];
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

  const playMove   = useCallback(() => play('move',   0.6), [play]);
  const playTab    = useCallback(() => play('tab',    0.7), [play]);
  const playSelect = useCallback(() => play('select', 0.8), [play]);

  return { playMove, playTab, playSelect };
}
