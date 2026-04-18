'use client';

import { AnimatePresence, motion } from 'framer-motion';
import styles from '../GameHost.module.css';

export type OverlayVariant = 'game-over' | 'paused' | 'ready' | 'win';

interface OverlayStat {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface OverlayAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface Props {
  open: boolean;
  variant: OverlayVariant;
  title: string;
  subtitle?: string;
  stats?: OverlayStat[];
  actions?: OverlayAction[];
}

export default function GameOverlay({ open, variant, title, subtitle, stats, actions }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className={`${styles.gameOverlay} ${styles[`overlay-${variant}`] ?? ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className={styles.overlayCard}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.overlayKicker}>{variant.replace('-', ' ')}</div>
            <h3 className={styles.overlayTitle}>{title}</h3>
            {subtitle && <p className={styles.overlaySubtitle}>{subtitle}</p>}
            {stats && stats.length > 0 && (
              <div className={styles.overlayStats}>
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className={`${styles.overlayStat} ${stat.highlight ? styles.overlayStatHighlight : ''}`}
                  >
                    <span className={styles.overlayStatLabel}>{stat.label}</span>
                    <span className={styles.overlayStatValue}>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
            {actions && actions.length > 0 && (
              <div className={styles.overlayActions}>
                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className={`${styles.overlayBtn} ${action.primary ? styles.overlayBtnPrimary : ''}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
