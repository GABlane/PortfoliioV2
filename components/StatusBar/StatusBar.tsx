'use client';

import { useEffect, useState } from 'react';
import type { Theme } from '@/types/portfolio';
import styles from './StatusBar.module.css';

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round">
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.1 3.1l1.3 1.3M11.6 11.6l1.3 1.3M12.9 3.1l-1.3 1.3M4.4 11.6l-1.3 1.3" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.9 1.7a6.5 6.5 0 1 0 3.4 10.9A5.8 5.8 0 0 1 10.9 1.7Z" />
    </svg>
  );
}

export default function StatusBar({ theme, onToggleTheme }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.themeToggle}
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <span className={styles.sep} />
      <span className={styles.date}>{formatDate(now)}</span>
      <span className={styles.sep} />
      <span className={styles.time}>{formatTime(now)}</span>
    </div>
  );
}
