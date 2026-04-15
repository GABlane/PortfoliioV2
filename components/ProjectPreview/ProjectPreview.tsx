'use client';

import { motion } from 'framer-motion';
import styles from './ProjectPreview.module.css';

// Each project gets a unique gradient accent
const PROJECT_COLORS: Record<string, [string, string]> = {
  motomedic:   ['#e85d04', '#dc2f02'],
  smartvault:  ['#06d6a0', '#118ab2'],
  gearfalcon:  ['#7209b7', '#3a0ca3'],
  'java-game': ['#f72585', '#b5179e'],
  bagyoalerto: ['#4cc9f0', '#4361ee'],
};

const FALLBACK_COLORS: [string, string] = ['#4a90d9', '#2563eb'];

interface Props {
  itemId: string;
  title: string;
  subtitle: string;
}

export default function ProjectPreview({ itemId, title, subtitle }: Props) {
  const [c1, c2] = PROJECT_COLORS[itemId] ?? FALLBACK_COLORS;
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Gradient background */}
      <div
        className={styles.gradient}
        style={{
          background: `linear-gradient(135deg, ${c1}18 0%, ${c2}10 100%)`,
        }}
      />

      {/* Accent stripe */}
      <div
        className={styles.stripe}
        style={{ background: `linear-gradient(180deg, ${c1}, ${c2})` }}
      />

      {/* Grid pattern overlay */}
      <div className={styles.grid} />

      {/* Content */}
      <div className={styles.content}>
        <span className={styles.initials} style={{ color: `${c1}50` }}>
          {initials}
        </span>
        <div className={styles.label}>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </div>

      {/* Corner decoration */}
      <svg className={styles.corner} viewBox="0 0 40 40" fill="none">
        <path d="M0 0L40 0L40 40" stroke={c1} strokeWidth="1" opacity="0.3" />
      </svg>
    </motion.div>
  );
}
