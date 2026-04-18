'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './GameHost.module.css';
import GameOverlay from './shared/GameOverlay';
import Stat from './shared/Stat';
import { useGameAudio } from './shared/useGameAudio';
import { useGameStorage } from './shared/useGameStorage';
import { useGamePause } from './shared/useGamePause';
import { GAME_SOUNDS } from './shared/sounds';
import { PONG, type PongDifficulty } from './shared/constants';

interface Props {
  running: boolean;
  restartToken: number;
  className?: string;
}

interface TrailPoint { x: number; y: number; id: number }
interface Ripple { x: number; y: number; id: number }

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
  trail: TrailPoint[];
}

interface PongStats {
  wins: number;
  losses: number;
  longestStreak: number;
  currentStreak: number;
}

const {
  FIELD_WIDTH, FIELD_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE, LEFT_PADDLE_X,
  PLAYER_SPEED, MATCH_POINT, BALL_MAX_SPEED, BALL_ACCEL_ON_HIT,
  BOUNCE_X_DAMPEN, BOUNCE_VY_FROM_IMPACT, SERVE_SPEED_MIN, SERVE_SPEED_JITTER, SERVE_VY_RANGE, AI,
} = PONG;
const RIGHT_PADDLE_X = FIELD_WIDTH - LEFT_PADDLE_X - PADDLE_WIDTH;
const PADDLE_WIDTH_PCT = (PADDLE_WIDTH / FIELD_WIDTH) * 100;
const PADDLE_HEIGHT_PCT = (PADDLE_HEIGHT / FIELD_HEIGHT) * 100;
const LEFT_PADDLE_LEFT_PCT = (LEFT_PADDLE_X / FIELD_WIDTH) * 100;
const RIGHT_PADDLE_LEFT_PCT = (RIGHT_PADDLE_X / FIELD_WIDTH) * 100;
const BALL_WIDTH_PCT = (BALL_SIZE / FIELD_WIDTH) * 100;
const TRAIL_LENGTH = 6;

const DIFFICULTY_LABELS: Record<PongDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const INITIAL_STATS: PongStats = { wins: 0, losses: 0, longestStreak: 0, currentStreak: 0 };

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
    trail: [],
  };
}

export default function PongGame({ running, restartToken, className }: Props) {
  const [difficulty, setDifficulty] = useGameStorage<PongDifficulty>('pong.difficulty', 'medium');
  const [stats, setStats] = useGameStorage<PongStats>('pong.stats', INITIAL_STATS);
  const [snapshot, setSnapshot] = useState<PongState>(() => createInitialState());
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [justBeatStreak, setJustBeatStreak] = useState(false);

  const { play, muted, toggleMuted } = useGameAudio({
    paddleHit: GAME_SOUNDS.paddleHit,
    wallBounce: GAME_SOUNDS.wallBounce,
    score: GAME_SOUNDS.score,
    win: GAME_SOUNDS.win,
    gameOver: GAME_SOUNDS.gameOver,
    pauseIn: GAME_SOUNDS.pauseIn,
    pauseOut: GAME_SOUNDS.pauseOut,
  });

  const { paused, toggle: togglePause } = useGamePause({
    running,
    gameOver: Boolean(snapshot.winner),
    onPause: () => play('pauseIn', 0.5),
    onResume: () => play('pauseOut', 0.5),
  });

  const snapshotRef = useRef(snapshot);
  const frameRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const inputRef = useRef({ up: false, down: false });
  const pausedRef = useRef(paused);
  const difficultyRef = useRef(difficulty);
  const trailIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const matchRecordedRef = useRef(false);

  useEffect(() => { snapshotRef.current = snapshot; }, [snapshot]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);

  const restartMatch = useCallback(() => {
    const fresh = createInitialState();
    snapshotRef.current = fresh;
    setSnapshot(fresh);
    setRipples([]);
    matchRecordedRef.current = false;
    setJustBeatStreak(false);
  }, []);

  const resetRound = useCallback((direction: 1 | -1) => {
    const current = snapshotRef.current;
    const next: PongState = {
      ...current,
      leftY: (FIELD_HEIGHT - PADDLE_HEIGHT) / 2,
      rightY: (FIELD_HEIGHT - PADDLE_HEIGHT) / 2,
      ballX: FIELD_WIDTH / 2 - BALL_SIZE / 2,
      ballY: FIELD_HEIGHT / 2 - BALL_SIZE / 2,
      vx: direction * (SERVE_SPEED_MIN + Math.random() * SERVE_SPEED_JITTER),
      vy: (Math.random() * 2 - 1) * SERVE_VY_RANGE,
      trail: [],
    };
    snapshotRef.current = next;
    setSnapshot(next);
  }, []);

  useEffect(() => {
    restartMatch();
    prevTimeRef.current = 0;
  }, [restartToken, restartMatch]);

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleIdRef.current;
    const next: Ripple = { x, y, id };
    setRipples((prev) => [...prev, next]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 400);
  }, []);

  const tick = useCallback(
    (timestamp: number) => {
      if (!running) return;
      const prev = prevTimeRef.current || timestamp;
      const dt = Math.min((timestamp - prev) / 1000, 0.033);
      prevTimeRef.current = timestamp;

      if (pausedRef.current) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const current = snapshotRef.current;
      if (current.winner) return;

      const ai = AI[difficultyRef.current];
      const next: PongState = { ...current };

      if (inputRef.current.up) next.leftY -= PLAYER_SPEED * dt;
      if (inputRef.current.down) next.leftY += PLAYER_SPEED * dt;
      next.leftY = clamp(next.leftY, 0, FIELD_HEIGHT - PADDLE_HEIGHT);

      const aiTarget = next.ballY + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
      if (aiTarget > next.rightY + ai.deadzone) next.rightY += ai.speed * dt;
      if (aiTarget < next.rightY - ai.deadzone) next.rightY -= ai.speed * dt;
      next.rightY = clamp(next.rightY, 0, FIELD_HEIGHT - PADDLE_HEIGHT);

      next.ballX += next.vx * dt;
      next.ballY += next.vy * dt;

      let bouncedWall = false;
      if (next.ballY <= 0) {
        next.ballY = 0;
        next.vy = Math.abs(next.vy);
        bouncedWall = true;
      }
      if (next.ballY >= FIELD_HEIGHT - BALL_SIZE) {
        next.ballY = FIELD_HEIGHT - BALL_SIZE;
        next.vy = -Math.abs(next.vy);
        bouncedWall = true;
      }
      if (bouncedWall) play('wallBounce', 0.3);

      const hitLeftPaddle =
        next.vx < 0 &&
        next.ballX <= LEFT_PADDLE_X + PADDLE_WIDTH &&
        next.ballX >= LEFT_PADDLE_X &&
        next.ballY + BALL_SIZE >= next.leftY &&
        next.ballY <= next.leftY + PADDLE_HEIGHT;

      if (hitLeftPaddle) {
        next.ballX = LEFT_PADDLE_X + PADDLE_WIDTH;
        const impact = (next.ballY + BALL_SIZE / 2 - (next.leftY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        const speed = Math.min(BALL_MAX_SPEED, Math.hypot(next.vx, next.vy) + BALL_ACCEL_ON_HIT);
        next.vx = Math.abs(speed * BOUNCE_X_DAMPEN);
        next.vy = speed * impact * BOUNCE_VY_FROM_IMPACT;
        play('paddleHit', 0.6);
        addRipple(next.ballX, next.ballY + BALL_SIZE / 2);
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
        const speed = Math.min(BALL_MAX_SPEED, Math.hypot(next.vx, next.vy) + BALL_ACCEL_ON_HIT);
        next.vx = -Math.abs(speed * BOUNCE_X_DAMPEN);
        next.vy = speed * impact * BOUNCE_VY_FROM_IMPACT;
        play('paddleHit', 0.6);
        addRipple(next.ballX + BALL_SIZE, next.ballY + BALL_SIZE / 2);
      }

      const newTrail = [
        ...current.trail,
        { x: next.ballX, y: next.ballY, id: ++trailIdRef.current },
      ].slice(-TRAIL_LENGTH);
      next.trail = newTrail;

      let resetDirection: 1 | -1 | null = null;
      if (next.ballX < -BALL_SIZE) {
        next.rightScore += 1;
        play('score', 0.6);
        if (next.rightScore >= MATCH_POINT) {
          next.winner = 'CPU';
          play('gameOver', 0.8);
        } else {
          resetDirection = 1;
        }
      } else if (next.ballX > FIELD_WIDTH) {
        next.leftScore += 1;
        play('score', 0.6);
        if (next.leftScore >= MATCH_POINT) {
          next.winner = 'PLAYER';
          play('win', 0.9);
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

      if (!next.winner) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    },
    [running, addRipple, play, resetRound],
  );

  useEffect(() => {
    if (!running) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') { event.preventDefault(); inputRef.current.up = true; }
      if (event.key === 'ArrowDown') { event.preventDefault(); inputRef.current.down = true; }
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
  }, [running, tick]);

  useEffect(() => {
    if (!snapshot.winner || matchRecordedRef.current) return;
    matchRecordedRef.current = true;
    setStats((prev) => {
      if (snapshot.winner === 'PLAYER') {
        const nextStreak = prev.currentStreak + 1;
        const nextLongest = Math.max(prev.longestStreak, nextStreak);
        if (nextLongest > prev.longestStreak) setJustBeatStreak(true);
        return { ...prev, wins: prev.wins + 1, currentStreak: nextStreak, longestStreak: nextLongest };
      }
      return { ...prev, losses: prev.losses + 1, currentStreak: 0 };
    });
  }, [snapshot.winner, setStats]);

  const overlayActions = useMemo(
    () => [{ label: 'Rematch', onClick: restartMatch, primary: true }],
    [restartMatch],
  );

  return (
    <div className={`${styles.host} ${className ?? ''}`}>
      <div className={styles.difficultyRow}>
        <span>AI</span>
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            type="button"
            className={`${styles.difficultyBtn} ${difficulty === d ? styles.difficultyBtnActive : ''}`}
            onClick={() => {
              setDifficulty(d);
              restartMatch();
            }}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
        <button type="button" className={styles.difficultyBtn} onClick={togglePause} disabled={!running || Boolean(snapshot.winner)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className={styles.audioToggle} onClick={toggleMuted}>
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
      </div>

      <div className={styles.surface}>
        <div className={styles.pongArena}>
          <div className={styles.pongNet} />
          <div className={styles.pongScore}>{snapshot.leftScore} : {snapshot.rightScore}</div>

          {snapshot.trail.map((p, idx) => (
            <div
              key={p.id}
              className={styles.pongTrail}
              style={{
                left: `${(p.x / FIELD_WIDTH) * 100}%`,
                top: `${(p.y / FIELD_HEIGHT) * 100}%`,
                width: `${BALL_WIDTH_PCT}%`,
                aspectRatio: '1 / 1',
                opacity: ((idx + 1) / TRAIL_LENGTH) * 0.25,
              }}
            />
          ))}

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
            }}
          />

          <AnimatePresence>
            {ripples.map((r) => (
              <motion.div
                key={r.id}
                className={styles.pongRipple}
                initial={{
                  width: `${BALL_WIDTH_PCT}%`,
                  aspectRatio: '1 / 1',
                  left: `${(r.x / FIELD_WIDTH) * 100}%`,
                  top: `${(r.y / FIELD_HEIGHT) * 100}%`,
                  translateX: '-50%',
                  translateY: '-50%',
                  opacity: 1,
                  scale: 0.4,
                }}
                animate={{ opacity: 0, scale: 2.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>

          <GameOverlay
            open={paused && !snapshot.winner}
            variant="paused"
            title="Paused"
            subtitle="Press P or Esc to resume"
            actions={[{ label: 'Resume', onClick: togglePause, primary: true }]}
          />

          <GameOverlay
            open={Boolean(snapshot.winner)}
            variant={snapshot.winner === 'PLAYER' ? 'win' : 'game-over'}
            title={snapshot.winner === 'PLAYER' ? 'You Win' : 'CPU Wins'}
            subtitle={justBeatStreak ? 'New longest streak!' : `${snapshot.leftScore} - ${snapshot.rightScore}`}
            stats={[
              { label: 'Wins', value: stats.wins, highlight: snapshot.winner === 'PLAYER' },
              { label: 'Losses', value: stats.losses },
              { label: 'Streak', value: stats.currentStreak, highlight: justBeatStreak },
              { label: 'Best', value: stats.longestStreak },
            ]}
            actions={overlayActions}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <Stat label="Score" value={`${snapshot.leftScore} - ${snapshot.rightScore}`} />
        <Stat label="Streak" value={stats.currentStreak} />
        <Stat label="Best" value={stats.longestStreak} />
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
          <button type="button" className={styles.touchBtn} onClick={togglePause}>{paused ? 'PLAY' : 'PAUSE'}</button>
        </div>
      </div>
    </div>
  );
}
