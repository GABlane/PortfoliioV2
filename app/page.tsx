'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import { categories } from '@/data/content';
import ScreenViewport from '@/components/ScreenViewport/ScreenViewport';
import WaveBackground from '@/components/WaveBackground/WaveBackground';
import XmbNav from '@/components/XmbNav/XmbNav';
import CategoryList from '@/components/CategoryList/CategoryList';
import DetailPanel from '@/components/DetailPanel/DetailPanel';
import BootIntro from '@/components/BootIntro/BootIntro';
import styles from './page.module.css';

type BootState = 'loading' | 'intro' | 'done';

export default function Home() {
  const nav = useNavigation(categories);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bootState, setBootState] = useState<BootState>('loading');

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
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [bootState, nav]);

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
        {/* Wave background — always visible, shared by intro + XMB */}
        <WaveBackground />

        {/* XMB UI — fades in after intro */}
        <motion.div
          className={styles.xmbLayer}
          animate={{ opacity: bootState === 'done' ? 1 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ pointerEvents: bootState === 'done' ? 'auto' : 'none' }}
        >
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
            <span>← → Category</span>
            <span>↑ ↓ Navigate</span>
          </div>
        </motion.div>

        {/* Boot intro overlay — on top of waves, removed when done */}
        <AnimatePresence>
          {bootState === 'intro' && (
            <BootIntro onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>
      </ScreenViewport>
    </div>
  );
}
