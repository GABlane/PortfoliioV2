'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioItem } from '@/types/portfolio';
import { useNavSound } from '@/hooks/useNavSound';
import styles from './DetailPanel.module.css';

interface Props {
  item: PortfolioItem;
}

export default function DetailPanel({ item }: Props) {
  const { playConfirm } = useNavSound();

  return (
    <div className={styles.panel}>
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className={styles.content}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className={styles.header}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.subtitle}>{item.subtitle}</span>
          </div>
          <div className={styles.divider} />
          <p className={styles.description}>{item.description}</p>
          {item.meta && (
            <span className={styles.meta}>{item.meta}</span>
          )}
          {item.ctaLabel && item.ctaHref && (
            <a
              href={item.ctaHref}
              className={styles.cta}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              onClick={playConfirm}
            >
              {item.ctaLabel} →
            </a>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
