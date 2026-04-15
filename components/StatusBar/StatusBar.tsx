'use client';

import { useEffect, useState } from 'react';
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

export default function StatusBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <div className={styles.bar} aria-hidden="true">
      <span className={styles.date}>{formatDate(now)}</span>
      <span className={styles.sep} />
      <span className={styles.time}>{formatTime(now)}</span>
    </div>
  );
}
