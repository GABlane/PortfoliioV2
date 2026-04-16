'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import { useNavSound } from '@/hooks/useNavSound';
import { useTheme } from '@/hooks/useTheme';
import { categories } from '@/data/content';
import type { GameId, GamePhase } from '@/types/portfolio';
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
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [bootState, setBootState] = useState<BootState>('loading');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [gameRestartToken, setGameRestartToken] = useState(0);
  const [countdownStep, setCountdownStep] = useState<number | null>(null);

  const hasCta = Boolean(nav.activeItem.ctaHref);
  const selectedGameId = nav.activeItem.gameId ?? null;
  const isGameSessionActive = Boolean(activeGameId && gamePhase !== 'idle');
  const isGameRunning = gamePhase === 'running';
  const isGameStarting = gamePhase === 'starting';
  const isGamePaused = gamePhase === 'paused';
  const showEnterHint = !isGameSessionActive && (hasCta || Boolean(selectedGameId));
  const showGameRuntimeHints = isGameSessionActive;

  const activeGameItem = useMemo(
    () => categories.flatMap((category) => category.items).find((item) => item.gameId === activeGameId) ?? null,
    [activeGameId],
  );

  const startGame = useCallback((gameId: GameId) => {
    setActiveGameId(gameId);
    setGamePhase('starting');
    setGameRestartToken((token) => token + 1);
  }, []);

  const restartGame = useCallback(() => {
    if (!activeGameId) return;
    setGamePhase('starting');
    setGameRestartToken((token) => token + 1);
  }, [activeGameId]);

  const exitGame = useCallback(() => {
    setGamePhase('idle');
    setActiveGameId(null);
  }, []);

  const handleRestartGameClick = useCallback(() => {
    playConfirm();
    restartGame();
  }, [playConfirm, restartGame]);

  const handleResumeGameClick = useCallback(() => {
    playConfirm();
    setGamePhase('running');
  }, [playConfirm]);

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

  // Keep selected game id in sync while browsing, but do not override active session.
  useEffect(() => {
    if (gamePhase !== 'idle') return;
    setActiveGameId(nav.activeItem.gameId ?? null);
  }, [nav.activeItem.id, nav.activeItem.gameId, gamePhase]);

  // Startup countdown flow for game launch/restart.
  useEffect(() => {
    if (gamePhase !== 'starting') {
      setCountdownStep(null);
      return;
    }

    const interval = prefersReducedMotion ? 170 : 320;
    const sequence = [3, 2, 1, 0];
    let index = 0;

    setCountdownStep(sequence[index]);

    const timer = window.setInterval(() => {
      index += 1;
      if (index < sequence.length) {
        setCountdownStep(sequence[index]);
        return;
      }

      window.clearInterval(timer);
      setCountdownStep(null);
      setGamePhase('running');
    }, interval);

    return () => window.clearInterval(timer);
  }, [gamePhase, prefersReducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    if (bootState !== 'done') return;
    const handleKey = (e: KeyboardEvent) => {
      if (isGameSessionActive) {
        if (e.key === 'Escape') {
          e.preventDefault();
          exitGame();
          return;
        }

        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          restartGame();
          return;
        }

        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setGamePhase((phase) => (phase === 'running' ? 'paused' : phase === 'paused' ? 'running' : phase));
          return;
        }

        if (!isGameRunning && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          return;
        }

        if (isGameRunning && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
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
  }, [bootState, nav, playConfirm, selectedGameId, isGameSessionActive, isGameRunning, startGame, restartGame, exitGame]);

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

          {isGameSessionActive && activeGameId ? (
            <div className={styles.fullscreenGame}>
              <div className={styles.fullscreenGameTop}>
                <div className={styles.fullscreenGameMeta}>
                  <span className={styles.fullscreenGameTitle}>{activeGameItem?.title ?? 'Game'}</span>
                  <span className={styles.fullscreenGameSubtitle}>{activeGameItem?.subtitle ?? 'Arcade Session'}</span>
                  <span className={styles.fullscreenGameBadge}>
                    {isGameStarting ? 'Starting' : isGamePaused ? 'Paused' : 'Live'}
                  </span>
                </div>
                <div className={styles.fullscreenGameActions}>
                  {isGamePaused && (
                    <button
                      type="button"
                      className={`${styles.fullscreenGameBtn} ${styles.fullscreenGameBtnPrimary}`}
                      onClick={handleResumeGameClick}
                    >
                      Resume
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.fullscreenGameBtn}
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

                <AnimatePresence>
                  {isGameStarting && countdownStep !== null && (
                    <motion.div
                      className={styles.runtimeOverlay}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0.08 : 0.18 }}
                    >
                      <motion.span
                        key={countdownStep}
                        className={styles.runtimeCountdown}
                        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.22 }}
                      >
                        {countdownStep === 0 ? 'GO' : countdownStep}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isGamePaused && (
                    <motion.div
                      className={styles.runtimeOverlay}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0.08 : 0.16 }}
                    >
                      <motion.div
                        className={styles.runtimePausePanel}
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0.08 : 0.2 }}
                      >
                        <span className={styles.runtimePauseTitle}>Paused</span>
                        <div className={styles.runtimePauseActions}>
                          <button
                            type="button"
                            className={`${styles.fullscreenGameBtn} ${styles.fullscreenGameBtnPrimary}`}
                            onClick={handleResumeGameClick}
                          >
                            Resume
                          </button>
                          <button
                            type="button"
                            className={styles.fullscreenGameBtn}
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
                        <span className={styles.runtimePauseHint}>P Resume  |  R Restart  |  Esc Exit</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            {!isGameSessionActive && (
              <span className={styles.hintKey}>
                <kbd>←</kbd><kbd>→</kbd>
                <span className={styles.hintLabel}>Category</span>
              </span>
            )}
            {!isGameSessionActive && (
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
            <AnimatePresence>
              {showGameRuntimeHints && (
                <motion.span
                  className={styles.hintKey}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <kbd>P</kbd>
                  <span className={styles.hintLabel}>{isGamePaused ? 'Resume' : 'Pause'}</span>
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
