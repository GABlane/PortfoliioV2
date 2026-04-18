import styles from '../GameHost.module.css';

interface StatProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

export default function Stat({ label, value, accent = false }: StatProps) {
  return (
    <div className={`${styles.statPill} ${accent ? styles.statPillAccent : ''}`}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}
