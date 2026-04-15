'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import { useNavSound } from '@/hooks/useNavSound';
import { useTheme } from '@/hooks/useTheme';
import { categories } from '@/data/content';
import type { GameId } from '@/types/portfolio';
import ScreenViewport from '@/components/ScreenViewport/ScreenViewport';
import WaveBackground from '@/components/WaveBackground/WaveBackground';
import XmbNav from '@/components/XmbNav/XmbNav';
import CategoryList from '@/components/CategoryList/CategoryList';
import DetailPanel from '@/components/DetailPanel/DetailPanel';
import GameHost from '@/components/Games/GameHost';
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
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameRestartToken, setGameRestartToken] = useState(0);

  const hasCta = Boolean(nav.activeItem.ctaHref);
  const selectedGameId = nav.activeItem.gameId ?? null;
  const showEnterHint = hasCta || (Boolean(selectedGameId) && !isGameRunning);
  const showGameRuntimeHints = isGameRunning && Boolean(activeGameId);
  const isActiveGameRunning = isGameRunning && Boolean(selectedGameId && activeGameId === selectedGameId);

  const startGame = useCallback((gameId: GameId) => {
    setActiveGameId(gameId);
    setIsGameRunning(true);
    setGameRestartToken((token) => token + 1);
  }, []);

  const restartGame = useCallback(() => {
    setIsGameRunning(true);
    setGameRestartToken((token) => token + 1);
  }, []);

  const exitGame = useCallback(() => {
    setIsGameRunning(false);
  }, []);

  const handleRestartGameClick = useCallback(() => {
    playConfirm();
    restartGame();
  }, [playConfirm, restartGame]);

  const handleExitGameClick = useCallback(() => {
    playConfirm();
    exitGame();
  }, [playConfirm, exitGame]);

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

  // Reset running game whenever focused item changes.
  useEffect(() => {
    setActiveGameId(nav.activeItem.gameId ?? null);
    setIsGameRunning(false);
  }, [nav.activeItem.id, nav.activeItem.gameId]);

  // Keyboard navigation
  useEffect(() => {
    if (bootState !== 'done') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGameRunning) {
        e.preventDefault();
        exitGame();
        return;
      }

      if ((e.key === 'r' || e.key === 'R') && isGameRunning) {
        e.preventDefault();
        restartGame();
        return;
      }

      if (isGameRunning) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); nav.navigateLeft();  break;
        case 'ArrowRight': e.preventDefault(); nav.navigateRight(); break;
        case 'ArrowUp':    e.preventDefault(); nav.navigateUp();    break;
        case 'ArrowDown':  e.preventDefault(); nav.navigateDown();  break;
        case 'Enter': {
          if (selectedGameId) {
            e.preventDefault();
            startGame(selectedGameId);
            break;
          }
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
  }, [bootState, nav, playConfirm, selectedGameId, isGameRunning, startGame, restartGame, exitGame]);

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

          {isActiveGameRunning && activeGameId ? (
            <div className={styles.fullscreenGame}>
              <div className={styles.fullscreenGameTop}>
                <div className={styles.fullscreenGameMeta}>
                  <span className={styles.fullscreenGameTitle}>{nav.activeItem.title}</span>
                  <span className={styles.fullscreenGameSubtitle}>{nav.activeItem.subtitle}</span>
                </div>
                <div className={styles.fullscreenGameActions}>
                  <button
                    type="button"
                    className={`${styles.fullscreenGameBtn} ${styles.fullscreenGameBtnPrimary}`}
                    onClick={handleRestartGameClick}
                  >
                    Restart
                  </button>
                  <button
                    type="button"
                    className={styles.fullscreenGameBtn}
                    onClick={handleExitGameClick}
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div className={styles.fullscreenGameBody}>
                <GameHost
                  gameId={activeGameId}
                  running={isGameRunning}
                  restartToken={gameRestartToken}
                  className={styles.fullscreenGameHost}
                />
              </div>
            </div>
          ) : (
            <>
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
                <DetailPanel
                  item={nav.activeItem}
                  activeGameId={activeGameId}
                  isGameRunning={isGameRunning}
                  gameRestartToken={gameRestartToken}
                  onStartGame={startGame}
                  onRestartGame={restartGame}
                  onExitGame={exitGame}
                />
              </div>
            </>
          )}

          <div className={styles.hints} aria-hidden="true">
            {!isGameRunning && (
              <span className={styles.hintKey}>
                <kbd>←</kbd><kbd>→</kbd>
                <span className={styles.hintLabel}>Category</span>
              </span>
            )}
            {!isGameRunning && (
              <span className={styles.hintKey}>
                <kbd>↑</kbd><kbd>↓</kbd>
                <span className={styles.hintLabel}>Navigate</span>
              </span>
            )}
            <AnimatePresence>
              {showEnterHint && (
                <motion.span
                  className={styles.hintKey}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <kbd>Enter</kbd>
                  <span className={styles.hintLabel}>{hasCta ? 'Open' : 'Start'}</span>
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showGameRuntimeHints && (
                <motion.span
                  className={styles.hintKey}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <kbd>Esc</kbd>
                  <span className={styles.hintLabel}>Exit</span>
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showGameRuntimeHints && (
                <motion.span
                  className={styles.hintKey}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <kbd>R</kbd>
                  <span className={styles.hintLabel}>Restart</span>
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
