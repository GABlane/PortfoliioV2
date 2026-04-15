import type { ReactNode } from 'react';
import styles from './PspShell.module.css';

interface Props {
  children: ReactNode;
}

function DPad() {
  return (
    <div className={styles.dpad} aria-hidden="true">
      <div className={styles.dpadH} />
      <div className={styles.dpadV} />
      <div className={styles.dpadCenter} />
      {/* Arrow indicators */}
      <span className={`${styles.dpadArrow} ${styles.dpadUp}`}>▲</span>
      <span className={`${styles.dpadArrow} ${styles.dpadDown}`}>▼</span>
      <span className={`${styles.dpadArrow} ${styles.dpadLeft}`}>◀</span>
      <span className={`${styles.dpadArrow} ${styles.dpadRight}`}>▶</span>
    </div>
  );
}

function FaceButtons() {
  return (
    <div className={styles.faceButtons} aria-hidden="true">
      <button className={`${styles.faceBtn} ${styles.triangle}`} tabIndex={-1}>△</button>
      <button className={`${styles.faceBtn} ${styles.square}`} tabIndex={-1}>□</button>
      <button className={`${styles.faceBtn} ${styles.cross}`} tabIndex={-1}>✕</button>
      <button className={`${styles.faceBtn} ${styles.circle}`} tabIndex={-1}>○</button>
    </div>
  );
}

function SpeakerGrille({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className={`${styles.speaker} ${side === 'left' ? styles.speakerLeft : styles.speakerRight}`}
      aria-hidden="true"
    />
  );
}

export default function PspShell({ children }: Props) {
  return (
    <div className={styles.shell} role="region" aria-label="PSP Portfolio">
      {/* Silver top accent strip */}
      <div className={styles.silverStrip} />

      {/* Shoulder buttons */}
      <div className={`${styles.shoulder} ${styles.shoulderL}`} aria-hidden="true">
        <span className={styles.shoulderLabel}>L</span>
      </div>
      <div className={`${styles.shoulder} ${styles.shoulderR}`} aria-hidden="true">
        <span className={styles.shoulderLabel}>R</span>
      </div>

      {/* Body gloss highlight */}
      <div className={styles.glossHighlight} aria-hidden="true" />

      {/* Speaker grilles */}
      <SpeakerGrille side="left" />
      <SpeakerGrille side="right" />

      {/* Left control cluster */}
      <div className={styles.leftControls} aria-hidden="true">
        <DPad />
        <div className={styles.analogNub} aria-label="Analog stick" />
      </div>

      {/* Screen bezel + screen */}
      <div className={styles.screenBezel}>
        <div className={styles.screenFrame}>
          {children}
        </div>
      </div>

      {/* Right control cluster */}
      <div className={styles.rightControls} aria-hidden="true">
        <FaceButtons />
        <div className={styles.homeBtn}>
          <span className={styles.homeBtnInner}>⌂</span>
        </div>
      </div>

      {/* Power / Hold edge labels */}
      <div className={styles.powerLabel} aria-hidden="true">POWER</div>
      <div className={styles.holdLabel} aria-hidden="true">HOLD</div>

      {/* Bottom bar */}
      <div className={styles.bottomBar} aria-hidden="true">
        <div className={styles.bottomLeft}>
          <div className={styles.statusLed} />
          <div className={styles.volBtn}>▾</div>
          <div className={styles.volBtn}>▴</div>
          <div className={styles.dispBtn}>◫</div>
        </div>
        <div className={styles.pspLogo}>PSP</div>
        <div className={styles.bottomRight}>
          <div className={styles.ctrlBtn}>SELECT</div>
          <div className={styles.ctrlBtn}>START</div>
        </div>
      </div>
    </div>
  );
}
