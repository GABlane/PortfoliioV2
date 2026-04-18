'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGameStorage } from './useGameStorage';

export type SoundMap = Record<string, string>;

interface UseGameAudioReturn<K extends string> {
  play: (name: K, volume?: number) => void;
  muted: boolean;
  toggleMuted: () => void;
}

export function useGameAudio<K extends string>(sounds: Record<K, string>): UseGameAudioReturn<K> {
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Partial<Record<K, AudioBuffer>>>({});
  const loadedRef = useRef(false);
  const [muted, setMuted] = useGameStorage<boolean>('audio.muted', false);

  const getCtx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      ctxRef.current = new AudioCtor();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const ctx = getCtx();
    if (!ctx) return;

    (Object.entries(sounds) as Array<[K, string]>).forEach(([name, url]) => {
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => {
          buffersRef.current[name] = buf;
        })
        .catch(() => {});
    });
  }, [sounds, getCtx]);

  const play = useCallback(
    (name: K, volume = 0.7) => {
      if (muted) return;
      const ctx = getCtx();
      const buf = buffersRef.current[name];
      if (!ctx || !buf) return;
      try {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = buf;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
      } catch {
        // audio unavailable
      }
    },
    [muted, getCtx],
  );

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev);
  }, [setMuted]);

  return { play, muted, toggleMuted };
}
