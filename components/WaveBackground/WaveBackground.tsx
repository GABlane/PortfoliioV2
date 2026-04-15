import styles from './WaveBackground.module.css';

export default function WaveBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.baseGrad} />
      <svg
        className={styles.waveLayer}
        viewBox="0 0 920 272"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className={styles.wave3}
          d="M0,200 C120,170 240,230 460,190 C680,150 800,210 920,185 L920,272 L0,272 Z"
        />
        <path
          className={styles.wave2}
          d="M0,220 C100,195 260,245 460,210 C660,175 780,230 920,205 L920,272 L0,272 Z"
        />
        <path
          className={styles.wave1}
          d="M0,242 C140,218 300,258 460,235 C620,212 760,248 920,230 L920,272 L0,272 Z"
        />
      </svg>
      <div className={styles.shimmer} />
    </div>
  );
}
