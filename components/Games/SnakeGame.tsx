'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GameHost.module.css';
import GameOverlay from './shared/GameOverlay';
import Stat from './shared/Stat';
import { useGameAudio } from './shared/useGameAudio';
import { useGameStorage } from './shared/useGameStorage';
import { useGamePause } from './shared/useGamePause';
import { GAME_SOUNDS } from './shared/sounds';
import { SNAKE } from './shared/constants';

interface Props {
  running: boolean;
  restartToken: number;
  className?: string;
}

type Direction = 'up' | 'down' | 'left' | 'right';
interface Point { x: number; y: number }
interface HighScore { score: number; length: number }

const { COLS, ROWS, START_LENGTH, BASE_TICK_MS, MIN_TICK_MS, TICK_STEP_MS, SCORE_PER_APPLE, LENGTH_PER_SPEEDUP } = SNAKE;

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const VECTOR: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function createInitialSnake(): Point[] {
  const midY = Math.floor(ROWS / 2);
  const startX = Math.floor(COLS / 2) - Math.floor(START_LENGTH / 2);
  return Array.from({ length: START_LENGTH }, (_, i) => ({ x: startX - i, y: midY }));
}

function spawnApple(snake: Point[]): Point {
  const occupied = new Set(snake.map((p) => `${p.x}:${p.y}`));
  const open: Point[] = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (!occupied.has(`${x}:${y}`)) open.push({ x, y });
    }
  }
  if (!open.length) return { x: 0, y: 0 };
  return open[Math.floor(Math.random() * open.length)];
}

export default function SnakeGame({ running, restartToken, className }: Props) {
  const [snake, setSnake] = useState<Point[]>(() => createInitialSnake());
  const [apple, setApple] = useState<Point>(() => spawnApple(createInitialSnake()));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [justBeatHighScore, setJustBeatHighScore] = useState(false);

  const [highScore, setHighScore] = useGameStorage<HighScore>('snake.best', { score: 0, length: START_LENGTH });

  const { play, muted, toggleMuted } = useGameAudio({
    eat: GAME_SOUNDS.eat,
    crash: GAME_SOUNDS.crash,
    highScore: GAME_SOUNDS.highScore,
    move: GAME_SOUNDS.move,
    pauseIn: GAME_SOUNDS.pauseIn,
    pauseOut: GAME_SOUNDS.pauseOut,
  });

  const { paused, toggle: togglePause } = useGamePause({
    running,
    gameOver,
    onPause: () => play('pauseIn', 0.5),
    onResume: () => play('pauseOut', 0.5),
  });

  const snakeRef = useRef(snake);
  const appleRef = useRef(apple);
  const directionRef = useRef<Direction>('right');
  const queuedDirectionRef = useRef<Direction>('right');
  const gameOverRef = useRef(false);
  const pausedRef = useRef(paused);
  const swipeStartRef = useRef<Point | null>(null);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { appleRef.current = apple; }, [apple]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const resetGame = useCallback(() => {
    const freshSnake = createInitialSnake();
    const freshApple = spawnApple(freshSnake);
    snakeRef.current = freshSnake;
    appleRef.current = freshApple;
    directionRef.current = 'right';
    queuedDirectionRef.current = 'right';
    gameOverRef.current = false;
    setSnake(freshSnake);
    setApple(freshApple);
    setScore(0);
    setGameOver(false);
    setJustBeatHighScore(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [restartToken, resetGame]);

  const queueDirection = useCallback((dir: Direction) => {
    if (OPPOSITE[dir] === directionRef.current) return;
    queuedDirectionRef.current = dir;
  }, []);

  const advance = useCallback(() => {
    if (!running || gameOverRef.current || pausedRef.current) return;
    directionRef.current = queuedDirectionRef.current;
    const vec = VECTOR[directionRef.current];
    const current = snakeRef.current;
    const head = current[0];
    const nextHead: Point = { x: head.x + vec.x, y: head.y + vec.y };

    if (nextHead.x < 0 || nextHead.x >= COLS || nextHead.y < 0 || nextHead.y >= ROWS) {
      gameOverRef.current = true;
      setGameOver(true);
      play('crash', 0.8);
      return;
    }

    const ateApple = nextHead.x === appleRef.current.x && nextHead.y === appleRef.current.y;
    const nextBody = ateApple ? current : current.slice(0, -1);

    if (nextBody.some((p) => p.x === nextHead.x && p.y === nextHead.y)) {
      gameOverRef.current = true;
      setGameOver(true);
      play('crash', 0.8);
      return;
    }

    const nextSnake = [nextHead, ...nextBody];
    snakeRef.current = nextSnake;
    setSnake(nextSnake);

    if (ateApple) {
      const newApple = spawnApple(nextSnake);
      appleRef.current = newApple;
      setApple(newApple);
      setScore((prev) => prev + SCORE_PER_APPLE);
      play('eat', 0.6);
    }
  }, [running, play]);

  useEffect(() => {
    if (!running || gameOver || paused) return;
    const growthSteps = Math.floor((snake.length - START_LENGTH) / LENGTH_PER_SPEEDUP);
    const tickMs = Math.max(MIN_TICK_MS, BASE_TICK_MS - growthSteps * TICK_STEP_MS);
    const timer = window.setInterval(advance, tickMs);
    return () => window.clearInterval(timer);
  }, [running, gameOver, paused, snake.length, advance]);

  useEffect(() => {
    if (!running) return;
    const onKey = (event: KeyboardEvent) => {
      const k = event.key.toLowerCase();
      let dir: Direction | null = null;
      if (k === 'arrowup' || k === 'w') dir = 'up';
      else if (k === 'arrowdown' || k === 's') dir = 'down';
      else if (k === 'arrowleft' || k === 'a') dir = 'left';
      else if (k === 'arrowright' || k === 'd') dir = 'right';
      if (dir) {
        event.preventDefault();
        queueDirection(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, queueDirection]);

  useEffect(() => {
    if (!gameOver) return;
    if (score > highScore.score) {
      setHighScore({ score, length: snake.length });
      setJustBeatHighScore(true);
      play('highScore', 0.8);
    }
  }, [gameOver, score, snake.length, highScore.score, setHighScore, play]);

  const handleSwipeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleSwipeEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) queueDirection(dx > 0 ? 'right' : 'left');
      else queueDirection(dy > 0 ? 'down' : 'up');
    },
    [queueDirection],
  );

  const snakeCellSet = useMemo(() => {
    const map = new Map<string, 'head' | 'body'>();
    snake.forEach((p, i) => map.set(`${p.x}:${p.y}`, i === 0 ? 'head' : 'body'));
    return map;
  }, [snake]);

  const cells = useMemo(() => {
    const out: Array<{ key: string; cls: string }> = [];
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const key = `${x}:${y}`;
        const kind = snakeCellSet.get(key);
        const isApple = apple.x === x && apple.y === y;
        let cls = styles.snakeCell;
        if (kind === 'head') cls = `${styles.snakeCell} ${styles.snakeHead}`;
        else if (kind === 'body') cls = `${styles.snakeCell} ${styles.snakeBody}`;
        else if (isApple) cls = `${styles.snakeCell} ${styles.snakeApple}`;
        out.push({ key, cls });
      }
    }
    return out;
  }, [snakeCellSet, apple]);

  return (
    <div className={`${styles.host} ${className ?? ''}`}>
      <div className={styles.difficultyRow}>
        <span>Length {snake.length}</span>
        <button type="button" className={styles.difficultyBtn} onClick={togglePause} disabled={!running || gameOver}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className={styles.audioToggle} onClick={toggleMuted}>
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
      </div>

      <div className={styles.surface}>
        <div
          className={styles.snakeWrap}
          onPointerDown={handleSwipeStart}
          onPointerUp={handleSwipeEnd}
          onPointerCancel={() => { swipeStartRef.current = null; }}
        >
          <div
            className={styles.snakeBoard}
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
          >
            {cells.map((cell) => (
              <div key={cell.key} className={cell.cls} />
            ))}
          </div>
          <div className={styles.snakeStats}>
            <Stat label="Score" value={score} />
            <Stat label="Best" value={highScore.score} />
          </div>
        </div>

        <GameOverlay
          open={paused && !gameOver}
          variant="paused"
          title="Paused"
          subtitle="Press P or Esc to resume"
          actions={[{ label: 'Resume', onClick: togglePause, primary: true }]}
        />

        <GameOverlay
          open={gameOver}
          variant="game-over"
          title="Game Over"
          subtitle={justBeatHighScore ? 'New high score!' : 'Swipe or arrow keys to move'}
          stats={[
            { label: 'Score', value: score, highlight: justBeatHighScore },
            { label: 'Length', value: snake.length },
            { label: 'Best', value: Math.max(score, highScore.score) },
          ]}
          actions={[]}
        />
      </div>
    </div>
  );
}
