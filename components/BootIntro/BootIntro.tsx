'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePspChime } from '@/hooks/usePspChime';
import styles from './BootIntro.module.css';

interface Props {
  onComplete: () => void;
}

export default function BootIntro({ onComplete }: Props) {
  const [started, setStarted]       = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [wavesVisible, setWavesVisible] = useState(false);
  const playChime    = usePspChime();
  // Keep a stable ref so the timeout closure always calls the latest onComplete
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  const startBoot = useCallback(() => {
    if (started) return;
    setStarted(true);
    playChime();
  }, [started, playChime]);

  // Trigger on any key or click while in standby
  useEffect(() => {
    if (started) return;
    window.addEventListener('keydown', startBoot);
    window.addEventListener('click',   startBoot);
    return () => {
      window.removeEventListener('keydown', startBoot);
      window.removeEventListener('click',   startBoot);
    };
  }, [started, startBoot]);

  // Sequence — runs once when started flips true.
  // Single effect so phase sub-transitions never cancel each other's timers.
  useEffect(() => {
    if (!started) return;
    const t1 = setTimeout(() => setTextVisible(true),   200);
    const t2 = setTimeout(() => setWavesVisible(true),  1600);
    const t3 = setTimeout(() => setTextVisible(false),  3200);
    const t4 = setTimeout(() => onCompleteRef.current(), 4200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [started]); // ← only `started` — never re-runs mid-sequence

  const overlayOpacity = !started ? 0.97 : wavesVisible ? 0.10 : 0.80;
  const overlayDuration = wavesVisible ? 1.8 : 0.6;

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      {/* Dark scrim that lifts as waves bleed in */}
      <motion.div
        className={styles.overlay}
        animate={{ opacity: overlayOpacity }}
        transition={{ duration: overlayDuration, ease: 'easeOut' }}
      />

      {/* Standby prompt */}
      <AnimatePresence>
        {!started && (
          <motion.div
            key="standby"
            className={styles.standby}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className={styles.powerIcon}>⏻</span>
            <span className={styles.pressPrompt}>PRESS ANY KEY</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boot text */}
      <div className={styles.center}>
        <AnimatePresence>
          {textVisible && (
            <motion.div
              key="bootText"
              className={styles.textBlock}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.7 } }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p className={styles.label}>FULL STACK DEVELOPER</p>
              <h1 className={styles.name}>JOHN GABRIEL</h1>
              <motion.div
                className={styles.nameLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
