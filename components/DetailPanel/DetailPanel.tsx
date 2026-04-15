'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameId, PortfolioItem } from '@/types/portfolio';
import { useNavSound } from '@/hooks/useNavSound';
import ProjectPreview from '@/components/ProjectPreview/ProjectPreview';
import GameHost from '@/components/Games/GameHost';
import styles from './DetailPanel.module.css';

interface Props {
  item: PortfolioItem;
  activeGameId: GameId | null;
  isGameRunning: boolean;
  gameRestartToken: number;
  onStartGame: (gameId: GameId) => void;
  onExitGame: () => void;
  onRestartGame: () => void;
}

export default function DetailPanel({
  item,
  activeGameId,
  isGameRunning,
  gameRestartToken,
  onStartGame,
  onExitGame,
  onRestartGame,
}: Props) {
  const { playConfirm } = useNavSound();
  const gameId = item.gameId ?? null;
  const isGameItem = Boolean(gameId);
  const isActiveGame = Boolean(gameId && activeGameId === gameId);
  const showGameHost = Boolean(gameId && isActiveGame && isGameRunning);

  const handleStartGame = () => {
    if (!gameId) return;
    playConfirm();
    onStartGame(gameId);
  };

  const handleRestartGame = () => {
    if (!gameId) return;
    playConfirm();
    if (!isGameRunning || !isActiveGame) {
      onStartGame(gameId);
      return;
    }
    onRestartGame();
  };

  const handleExitGame = () => {
    playConfirm();
    onExitGame();
  };

  return (
    <div className={`${styles.panel} ${showGameHost ? styles.panelGame : ''}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className={`${styles.content} ${showGameHost ? styles.contentGame : ''}`}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Project image preview */}
          {item.image && (
            <ProjectPreview
              itemId={item.id}
              title={item.title}
              subtitle={item.subtitle}
            />
          )}

          <div className={styles.header}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.subtitle}>{item.subtitle}</span>
          </div>

          <div className={styles.divider} />

          <p className={styles.description}>{item.description}</p>

          {isGameItem && (
            <div className={styles.gameActions}>
              <button
                type="button"
                className={`${styles.gameBtn} ${styles.gameBtnPrimary}`}
                onClick={handleStartGame}
              >
                Start
              </button>
              <button
                type="button"
                className={styles.gameBtn}
                onClick={handleRestartGame}
              >
                Restart
              </button>
              <button
                type="button"
                className={styles.gameBtn}
                onClick={handleExitGame}
                disabled={!isGameRunning || !isActiveGame}
              >
                Exit
              </button>
              <span className={styles.gameHint}>
                {showGameHost ? 'Esc: Exit  |  R: Restart' : 'Press Enter or Start to launch'}
              </span>
            </div>
          )}

          {showGameHost && gameId && (
            <GameHost gameId={gameId} running={isGameRunning} restartToken={gameRestartToken} />
          )}

          {/* Tag pills */}
          {item.tags && item.tags.length > 0 && (
            <div className={styles.tags}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA button */}
          {item.ctaLabel && item.ctaHref && !isGameItem && (
            <a
              href={item.ctaHref}
              className={styles.cta}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              onClick={playConfirm}
            >
              <span className={styles.ctaIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </span>
              {item.ctaLabel}
            </a>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
