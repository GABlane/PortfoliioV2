'use client';

import { useRef, useCallback } from 'react';

export function usePspChime() {
  const played = useRef(false);

  const play = useCallback(() => {
    if (played.current) return;
    played.current = true;

    try {
      const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();

      // 5 ascending notes — E4 Ab4 B4 Db5 E5
      const notes = [
        { freq: 330, time: 0.0,  dur: 0.55 },
        { freq: 415, time: 0.22, dur: 0.55 },
        { freq: 494, time: 0.44, dur: 0.55 },
        { freq: 554, time: 0.66, dur: 0.55 },
        { freq: 659, time: 0.88, dur: 2.0  },
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + time;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      });

      // Soft low pad under everything
      const pad  = ctx.createOscillator();
      const padG = ctx.createGain();
      pad.connect(padG);
      padG.connect(ctx.destination);
      pad.type = 'sine';
      pad.frequency.value = 165; // E3
      padG.gain.setValueAtTime(0, ctx.currentTime);
      padG.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.06);
      padG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);
      pad.start(ctx.currentTime);
      pad.stop(ctx.currentTime + 2.9);
    } catch {
      // audio unavailable — continue silently
    }
  }, []);

  return play;
}
