'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import { useNavSound } from '@/hooks/useNavSound';
import { useTheme } from '@/hooks/useTheme';
import { categories } from '@/data/content';
import ScreenViewport from '@/components/ScreenViewport/ScreenViewport';
import WaveBackground from '@/components/WaveBackground/WaveBackground';
import XmbNav from '@/components/XmbNav/XmbNav';
import CategoryList from '@/components/CategoryList/CategoryList';
import DetailPanel from '@/components/DetailPanel/DetailPanel';
import StatusBar from '@/components/StatusBar/StatusBar';
import BootIntro from '@/components/BootIntro/BootIntro';
import styles from './page.module.css';

type BootState = 'loading' | 'intro' | 'done';

export default function Home() {
  const nav = useNavigation(categories);
  const { playConfirm } = useNavSound();
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [bootState, setBootState] = useState<BootState>('loading');

  const hasCta = Boolean(nav.activeItem.ctaHref);

  // Resolve boot state after mount (sessionStorage unavailable on server)
  useEffect(() => {
    if (sessionStorage.getItem('psp-intro-seen')) {
      setBootState('done');
    } else {
      setBootState('intro');
    }
  }, []);

  // Focus container for keyboard nav (only once boot is done)
  useEffect(() => {
    if (bootState === 'done') containerRef.current?.focus();
  }, [bootState]);

  // Keyboard navigation
  useEffect(() => {
    if (bootState !== 'done') return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); nav.navigateLeft();  break;
        case 'ArrowRight': e.preventDefault(); nav.navigateRight(); break;
        case 'ArrowUp':    e.preventDefault(); nav.navigateUp();    break;
        case 'ArrowDown':  e.preventDefault(); nav.navigateDown();  break;
        case 'Enter': {
          const { ctaHref } = nav.activeItem;
          if (ctaHref) {
            playConfirm();
            window.open(ctaHref, '_blank', 'noopener,noreferrer');
          }
          break;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [bootState, nav, playConfirm]);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('psp-intro-seen', '1');
    setBootState('done');
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.page}
      tabIndex={0}
      aria-label="Portfolio — use arrow keys to navigate"
    >
      <ScreenViewport>
        <WaveBackground />

        <motion.div
          className={styles.xmbLayer}
          animate={{ opacity: bootState === 'done' ? 1 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ pointerEvents: bootState === 'done' ? 'auto' : 'none' }}
        >
          <StatusBar theme={theme} onToggleTheme={toggleTheme} />

          <XmbNav
            categories={categories}
            activeCategoryId={nav.state.activeCategoryId}
            activeCategoryIndex={nav.activeCategoryIndex}
            onSelect={nav.selectCategory}
          />

          <div className={styles.contentArea}>
            <CategoryList
              items={nav.activeCategory.items}
              activeItemId={nav.state.activeItemId}
              categoryId={nav.state.activeCategoryId}
              onSelect={nav.selectItem}
            />
            <DetailPanel item={nav.activeItem} />
          </div>

          <div className={styles.hints} aria-hidden="true">
            <span className={styles.hintKey}>
              <kbd>←</kbd><kbd>→</kbd>
              <span className={styles.hintLabel}>Category</span>
            </span>
            <span className={styles.hintKey}>
              <kbd>↑</kbd><kbd>↓</kbd>
              <span className={styles.hintLabel}>Navigate</span>
            </span>
            <AnimatePresence>
              {hasCta && (
                <motion.span
                  className={styles.hintKey}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <kbd>Enter</kbd>
                  <span className={styles.hintLabel}>Open</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {bootState === 'intro' && (
            <BootIntro onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>
      </ScreenViewport>
    </div>
  );
}
