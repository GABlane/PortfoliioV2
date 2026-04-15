import type { ReactNode } from 'react';
import styles from './ScreenViewport.module.css';

export default function ScreenViewport({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewport}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
