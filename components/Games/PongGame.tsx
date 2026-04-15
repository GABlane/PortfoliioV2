'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GameHost.module.css';

interface Props {
  running: boolean;
  restartToken: number;
  className?: string;
}

interface PongState {
  leftY: number;
  rightY: number;
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  leftScore: number;
  rightScore: number;
  winner: 'PLAYER' | 'CPU' | null;
}

const FIELD_WIDTH = 560;
const FIELD_HEIGHT = 220;
const PADDLE_HEIGHT = 62;
const PADDLE_WIDTH = 8;
const BALL_SIZE = 10;
const LEFT_PADDLE_X = 10;
const RIGHT_PADDLE_X = FIELD_WIDTH - LEFT_PADDLE_X - PADDLE_WIDTH;
const PLAYER_SPEED = 305;
const AI_SPEED = 250;

const PADDLE_WIDTH_PCT = (PADDLE_WIDTH / FIELD_WIDTH) * 100;
const PADDLE_HEIGHT_PCT = (PADDLE_HEIGHT / FIELD_HEIGHT) * 100;
const LEFT_PADDLE_LEFT_PCT = (LEFT_PADDLE_X / FIELD_WIDTH) * 100;
const RIGHT_PADDLE_LEFT_PCT = (RIGHT_PADDLE_X / FIELD_WIDTH) * 100;
const BALL_WIDTH_PCT = (BALL_SIZE / FIELD_WIDTH) * 100;
const BALL_HEIGHT_PCT = (BALL_SIZE / FIELD_HEIGHT) * 100;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createInitialState(): PongState {
  return {
    leftY: (FIELD_HEIGHT - PADDLE_HEIGHT) / 2,
    rightY: (FIELD_HEIGHT - PADDLE_HEIGHT) / 2,
    ballX: FIELD_WIDTH / 2 - BALL_SIZE / 2,
    ballY: FIELD_HEIGHT / 2 - BALL_SIZE / 2,
    vx: Math.random() > 0.5 ? 220 : -220,
    vy: (Math.random() * 2 - 1) * 120,
    leftScore: 0,
    rightScore: 0,
    winner: null,
  };
}

export default function PongGame({ running, restartToken, className }: Props) {
  const [snapshot, setSnapshot] = useState<PongState>(() => createInitialState());
  const snapshotRef = useRef(snapshot);
  const frameRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const inputRef = useRef({ up: false, down: false });

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const restartMatch = useCallback(() => {
    const fresh = createInitialState();
    snapshotRef.current = fresh;
    setSnapshot(fresh);
  }, []);

  const resetRound = useCallback((direction: 1 | -1) => {
    const current = snapshotRef.current;
    const next: PongState = {
      ...current,
      leftY: (FIELD_HEIGHT - PADDLE_HEIGHT) / 2,
      rightY: (FIELD_HEIGHT - PADDLE_HEIGHT) / 2,
      ballX: FIELD_WIDTH / 2 - BALL_SIZE / 2,
      ballY: FIELD_HEIGHT / 2 - BALL_SIZE / 2,
      vx: direction * (205 + Math.random() * 40),
      vy: (Math.random() * 2 - 1) * 120,
    };

    snapshotRef.current = next;
    setSnapshot(next);
  }, []);

  const tick = useCallback((timestamp: number) => {
    const prev = prevTimeRef.current || timestamp;
    const dt = Math.min((timestamp - prev) / 1000, 0.033);
    prevTimeRef.current = timestamp;

    const current = snapshotRef.current;
    if (current.winner) return;

    const next: PongState = { ...current };

    if (inputRef.current.up) next.leftY -= PLAYER_SPEED * dt;
    if (inputRef.current.down) next.leftY += PLAYER_SPEED * dt;
    next.leftY = clamp(next.leftY, 0, FIELD_HEIGHT - PADDLE_HEIGHT);

    const aiTarget = next.ballY + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    if (aiTarget > next.rightY + 4) next.rightY += AI_SPEED * dt;
    if (aiTarget < next.rightY - 4) next.rightY -= AI_SPEED * dt;
    next.rightY = clamp(next.rightY, 0, FIELD_HEIGHT - PADDLE_HEIGHT);

    next.ballX += next.vx * dt;
    next.ballY += next.vy * dt;

    if (next.ballY <= 0) {
      next.ballY = 0;
      next.vy = Math.abs(next.vy);
    }

    if (next.ballY >= FIELD_HEIGHT - BALL_SIZE) {
      next.ballY = FIELD_HEIGHT - BALL_SIZE;
      next.vy = -Math.abs(next.vy);
    }

    const hitLeftPaddle =
      next.vx < 0 &&
      next.ballX <= LEFT_PADDLE_X + PADDLE_WIDTH &&
      next.ballX >= LEFT_PADDLE_X &&
      next.ballY + BALL_SIZE >= next.leftY &&
      next.ballY <= next.leftY + PADDLE_HEIGHT;

    if (hitLeftPaddle) {
      next.ballX = LEFT_PADDLE_X + PADDLE_WIDTH;
      const impact = (next.ballY + BALL_SIZE / 2 - (next.leftY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const speed = Math.min(420, Math.hypot(next.vx, next.vy) + 18);
      next.vx = Math.abs(speed * 0.92);
      next.vy = speed * impact * 0.62;
    }

    const hitRightPaddle =
      next.vx > 0 &&
      next.ballX + BALL_SIZE >= RIGHT_PADDLE_X &&
      next.ballX + BALL_SIZE <= RIGHT_PADDLE_X + PADDLE_WIDTH &&
      next.ballY + BALL_SIZE >= next.rightY &&
      next.ballY <= next.rightY + PADDLE_HEIGHT;

    if (hitRightPaddle) {
      next.ballX = RIGHT_PADDLE_X - BALL_SIZE;
      const impact = (next.ballY + BALL_SIZE / 2 - (next.rightY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const speed = Math.min(420, Math.hypot(next.vx, next.vy) + 18);
      next.vx = -Math.abs(speed * 0.92);
      next.vy = speed * impact * 0.62;
    }

    let resetDirection: 1 | -1 | null = null;

    if (next.ballX < -BALL_SIZE) {
      next.rightScore += 1;
      if (next.rightScore >= 11) {
        next.winner = 'CPU';
      } else {
        resetDirection = 1;
      }
    } else if (next.ballX > FIELD_WIDTH) {
      next.leftScore += 1;
      if (next.leftScore >= 11) {
        next.winner = 'PLAYER';
      } else {
        resetDirection = -1;
      }
    }

    if (resetDirection !== null) {
      snapshotRef.current = next;
      resetRound(resetDirection);
    } else {
      snapshotRef.current = next;
      setSnapshot(next);
    }

    if (running && !next.winner) {
      frameRef.current = window.requestAnimationFrame(tick);
    }
  }, [resetRound, running]);

  useEffect(() => {
    if (!running) return;

    restartMatch();
    prevTimeRef.current = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        inputRef.current.up = true;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        inputRef.current.down = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') inputRef.current.up = false;
      if (event.key === 'ArrowDown') inputRef.current.down = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      inputRef.current.up = false;
      inputRef.current.down = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [running, restartToken, restartMatch, tick]);

  const status = useMemo(() => {
    if (snapshot.winner === 'PLAYER') return 'You win the match.';
    if (snapshot.winner === 'CPU') return 'CPU wins the match.';
    return 'Arrow Up/Down move paddle. First to 11 wins.';
  }, [snapshot.winner]);

  return (
    <div className={`${styles.host} ${className ?? ''}`}>
      <span className={styles.status}>{status}</span>

      <div className={styles.surface}>
        <div className={styles.pongArena}>
          <div className={styles.pongNet} />
          <div className={styles.pongScore}>{snapshot.leftScore} : {snapshot.rightScore}</div>

          <div
            className={styles.pongPaddle}
            style={{
              left: `${LEFT_PADDLE_LEFT_PCT}%`,
              top: `${(snapshot.leftY / FIELD_HEIGHT) * 100}%`,
              width: `${PADDLE_WIDTH_PCT}%`,
              height: `${PADDLE_HEIGHT_PCT}%`,
            }}
          />

          <div
            className={styles.pongPaddle}
            style={{
              left: `${RIGHT_PADDLE_LEFT_PCT}%`,
              top: `${(snapshot.rightY / FIELD_HEIGHT) * 100}%`,
              width: `${PADDLE_WIDTH_PCT}%`,
              height: `${PADDLE_HEIGHT_PCT}%`,
            }}
          />

          <div
            className={styles.pongBall}
            style={{
              left: `${(snapshot.ballX / FIELD_WIDTH) * 100}%`,
              top: `${(snapshot.ballY / FIELD_HEIGHT) * 100}%`,
              width: `${BALL_WIDTH_PCT}%`,
              height: `${BALL_HEIGHT_PCT}%`,
            }}
          />

          {snapshot.winner && <div className={styles.pongOverlay}>{snapshot.winner === 'PLAYER' ? 'Player Wins' : 'CPU Wins'}</div>}
        </div>
      </div>

      <div className={styles.touchControls} aria-label="Pong touch controls">
        <div className={styles.touchRow}>
          <button
            type="button"
            className={styles.touchBtn}
            onPointerDown={() => { inputRef.current.up = true; }}
            onPointerUp={() => { inputRef.current.up = false; }}
            onPointerLeave={() => { inputRef.current.up = false; }}
            onPointerCancel={() => { inputRef.current.up = false; }}
          >
            UP
          </button>
          <button
            type="button"
            className={styles.touchBtn}
            onPointerDown={() => { inputRef.current.down = true; }}
            onPointerUp={() => { inputRef.current.down = false; }}
            onPointerLeave={() => { inputRef.current.down = false; }}
            onPointerCancel={() => { inputRef.current.down = false; }}
          >
            DOWN
          </button>
        </div>
      </div>
    </div>
  );
}
