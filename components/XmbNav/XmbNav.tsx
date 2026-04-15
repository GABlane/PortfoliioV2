'use client';

import { motion } from 'framer-motion';
import type { PortfolioCategory } from '@/types/portfolio';
import styles from './XmbNav.module.css';

interface Props {
  categories: PortfolioCategory[];
  activeCategoryId: string;
  activeCategoryIndex: number;
  onSelect: (id: string) => void;
}

function CategoryIcon({ type }: { type: PortfolioCategory['iconType'] }) {
  const icons: Record<PortfolioCategory['iconType'], React.ReactNode> = {
    profile: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
    projects: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="8" height="8" rx="1.5" opacity="0.9" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.75" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.75" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" opacity="0.6" />
      </svg>
    ),
    skills: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="8" y="8" width="8" height="8" rx="1" />
        <line x1="8" y1="2" x2="8" y2="4" />
        <line x1="16" y1="2" x2="16" y2="4" />
        <line x1="8" y1="20" x2="8" y2="22" />
        <line x1="16" y1="20" x2="16" y2="22" />
        <line x1="2" y1="8" x2="4" y2="8" />
        <line x1="2" y1="16" x2="4" y2="16" />
        <line x1="20" y1="8" x2="22" y2="8" />
        <line x1="20" y1="16" x2="22" y2="16" />
      </svg>
    ),
    experience: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    contact: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  };
  return <span className={styles.iconSvg}>{icons[type]}</span>;
}

export default function XmbNav({ categories, activeCategoryId, activeCategoryIndex, onSelect }: Props) {
  const SPACING = 200;

  return (
    <nav className={styles.nav} aria-label="Portfolio categories">
      <div className={styles.track}>
        {categories.map((cat, i) => {
          const offset = (i - activeCategoryIndex) * SPACING;
          const distance = Math.abs(i - activeCategoryIndex);
          const isActive = cat.id === activeCategoryId;
          const opacity = isActive ? 1 : distance === 1 ? 0.55 : distance === 2 ? 0.25 : 0.1;
          const scale = isActive ? 1 : distance === 1 ? 0.72 : 0.55;

          return (
            <motion.button
              key={cat.id}
              className={`${styles.catBtn} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'true' : undefined}
              aria-label={cat.label}
              animate={{ x: offset, opacity, scale }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
              onClick={() => onSelect(cat.id)}
              tabIndex={isActive ? 0 : -1}
            >
              <span className={styles.iconWrap}>
                {isActive && <span className={styles.glow} />}
                <CategoryIcon type={cat.iconType} />
              </span>
              <motion.span
                className={styles.label}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {cat.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
