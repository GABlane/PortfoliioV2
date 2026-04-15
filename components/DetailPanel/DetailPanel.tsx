'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioItem } from '@/types/portfolio';
import { useNavSound } from '@/hooks/useNavSound';
import ProjectPreview from '@/components/ProjectPreview/ProjectPreview';
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
          {item.ctaLabel && item.ctaHref && (
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
