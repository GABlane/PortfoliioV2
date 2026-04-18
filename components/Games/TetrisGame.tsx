'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GameHost.module.css';
import GameOverlay from './shared/GameOverlay';
import Stat from './shared/Stat';
import { useGameAudio } from './shared/useGameAudio';
import { useGameStorage } from './shared/useGameStorage';
import { useGamePause } from './shared/useGamePause';
import { GAME_SOUNDS } from './shared/sounds';
import { TETRIS } from './shared/constants';

interface Props {
  running: boolean;
  restartToken: number;
  className?: string;
}

type Board = number[][];

interface ActivePiece {
  id: number;
  shape: number[][];
  x: number;
  y: number;
}

interface HighScore {
  score: number;
  lines: number;
  level: number;
}

const TETROMINOES: Array<{ id: number; shape: number[][] }> = [
  { id: 1, shape: [[1, 1, 1, 1]] },
  { id: 2, shape: [[2, 2], [2, 2]] },
  { id: 3, shape: [[0, 3, 0], [3, 3, 3]] },
  { id: 4, shape: [[0, 4, 4], [4, 4, 0]] },
  { id: 5, shape: [[5, 5, 0], [0, 5, 5]] },
  { id: 6, shape: [[6, 0, 0], [6, 6, 6]] },
  { id: 7, shape: [[0, 0, 7], [7, 7, 7]] },
];

const PIECE_CLASSES = [styles.p0, styles.p1, styles.p2, styles.p3, styles.p4, styles.p5, styles.p6, styles.p7];
const { BOARD_WIDTH, BOARD_HEIGHT, LINE_SCORES, LINES_PER_LEVEL, MIN_GRAVITY_MS, BASE_GRAVITY_MS, GRAVITY_STEP_MS, LINE_FLASH_MS } = TETRIS;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

function cloneShape(shape: number[][]): number[][] {
  return shape.map((row) => [...row]);
}

function randomPiece(): ActivePiece {
  const picked = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  const shape = cloneShape(picked.shape);
  return {
    id: picked.id,
    shape,
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: 0,
  };
}

function collides(board: Board, piece: ActivePiece, offsetX: number, offsetY: number, shape = piece.shape): boolean {
  for (let r = 0; r < shape.length; r += 1) {
    for (let c = 0; c < shape[r].length; c += 1) {
      if (!shape[r][c]) continue;
      const nx = piece.x + c + offsetX;
      const ny = piece.y + r + offsetY;
      if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return true;
      if (ny >= 0 && board[ny][nx] !== 0) return true;
    }
  }
  return false;
}

function merge(board: Board, piece: ActivePiece): Board {
  const next = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r += 1) {
    for (let c = 0; c < piece.shape[r].length; c += 1) {
      if (!piece.shape[r][c]) continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        next[y][x] = piece.id;
      }
    }
  }
  return next;
}

function findFullRows(board: Board): number[] {
  const rows: number[] = [];
  for (let r = 0; r < BOARD_HEIGHT; r += 1) {
    if (board[r].every((cell) => cell !== 0)) rows.push(r);
  }
  return rows;
}

function removeRows(board: Board, rows: number[]): Board {
  const rowSet = new Set(rows);
  const kept = board.filter((_, index) => !rowSet.has(index));
  while (kept.length < BOARD_HEIGHT) {
    kept.unshift(Array(BOARD_WIDTH).fill(0));
  }
  return kept;
}

function rotateCW(shape: number[][]): number[][] {
  return shape[0].map((_, col) => shape.map((row) => row[col]).reverse());
}

function computeGhostY(board: Board, piece: ActivePiece): number {
  let drop = 0;
  while (!collides(board, piece, 0, drop + 1)) drop += 1;
  return piece.y + drop;
}

export default function TetrisGame({ running, restartToken, className }: Props) {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [piece, setPiece] = useState<ActivePiece>(() => randomPiece());
  const [nextPiece, setNextPiece] = useState<ActivePiece>(() => randomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[] | null>(null);
  const [justBeatHighScore, setJustBeatHighScore] = useState(false);

  const [highScore, setHighScore] = useGameStorage<HighScore>('tetris.best', { score: 0, lines: 0, level: 1 });

  const { play, muted, toggleMuted } = useGameAudio({
    lock: GAME_SOUNDS.lock,
    move: GAME_SOUNDS.move,
    rotate: GAME_SOUNDS.confirm,
    lineClear: GAME_SOUNDS.lineClear,
    tetrisClear: GAME_SOUNDS.tetrisClear,
    gameOver: GAME_SOUNDS.gameOver,
    pauseIn: GAME_SOUNDS.pauseIn,
    pauseOut: GAME_SOUNDS.pauseOut,
    highScore: GAME_SOUNDS.highScore,
  });

  const { paused, toggle: togglePause } = useGamePause({
    running,
    gameOver,
    onPause: () => play('pauseIn', 0.6),
    onResume: () => play('pauseOut', 0.6),
  });

  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const nextPieceRef = useRef(nextPiece);
  const clearingRef = useRef<number[] | null>(null);
  const linesRef = useRef(0);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { pieceRef.current = piece; }, [piece]);
  useEffect(() => { nextPieceRef.current = nextPiece; }, [nextPiece]);
  useEffect(() => { clearingRef.current = clearingRows; }, [clearingRows]);
  useEffect(() => { linesRef.current = lines; }, [lines]);

  const level = Math.floor(lines / LINES_PER_LEVEL) + 1;

  const resetGame = useCallback(() => {
    const freshBoard = createEmptyBoard();
    const freshPiece = randomPiece();
    const freshNext = randomPiece();
    boardRef.current = freshBoard;
    pieceRef.current = freshPiece;
    nextPieceRef.current = freshNext;
    clearingRef.current = null;
    linesRef.current = 0;
    setBoard(freshBoard);
    setPiece(freshPiece);
    setNextPiece(freshNext);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setClearingRows(null);
    setJustBeatHighScore(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [restartToken, resetGame]);

  const advancePiece = useCallback(() => {
    const upcoming = nextPieceRef.current;
    if (collides(boardRef.current, upcoming, 0, 0)) {
      setGameOver(true);
      play('gameOver', 0.8);
      return;
    }
    pieceRef.current = upcoming;
    setPiece(upcoming);
    const newNext = randomPiece();
    nextPieceRef.current = newNext;
    setNextPiece(newNext);
  }, [play]);

  const commitLineClear = useCallback(
    (mergedBoard: Board, fullRows: number[]) => {
      const cleared = fullRows.length;
      const currentLevel = Math.floor(linesRef.current / LINES_PER_LEVEL) + 1;
      const gain = LINE_SCORES[cleared] * currentLevel;

      setClearingRows(fullRows);
      clearingRef.current = fullRows;
      play(cleared === 4 ? 'tetrisClear' : 'lineClear', 0.7);

      window.setTimeout(() => {
        const cleanedBoard = removeRows(mergedBoard, fullRows);
        boardRef.current = cleanedBoard;
        setBoard(cleanedBoard);
        setLines((prev) => prev + cleared);
        setScore((prev) => prev + gain);
        setClearingRows(null);
        clearingRef.current = null;
        advancePiece();
      }, LINE_FLASH_MS);
    },
    [play, advancePiece],
  );

  const lockPiece = useCallback(
    (lockedPiece: ActivePiece) => {
      const merged = merge(boardRef.current, lockedPiece);
      boardRef.current = merged;
      setBoard(merged);
      play('lock', 0.5);

      const fullRows = findFullRows(merged);
      if (fullRows.length > 0) {
        commitLineClear(merged, fullRows);
      } else {
        advancePiece();
      }
    },
    [play, commitLineClear, advancePiece],
  );

  const dropPiece = useCallback(
    (awardSoftDrop = false): boolean => {
      if (!running || gameOver || paused || clearingRef.current) return false;
      const current = pieceRef.current;

      if (collides(boardRef.current, current, 0, 1)) {
        lockPiece(current);
        return false;
      }

      const moved = { ...current, y: current.y + 1 };
      pieceRef.current = moved;
      setPiece(moved);

      if (awardSoftDrop) setScore((prev) => prev + 1);
      return true;
    },
    [running, gameOver, paused, lockPiece],
  );

  const moveHorizontal = useCallback(
    (delta: number) => {
      if (!running || gameOver || paused || clearingRef.current) return;
      const current = pieceRef.current;
      if (collides(boardRef.current, current, delta, 0)) return;
      const moved = { ...current, x: current.x + delta };
      pieceRef.current = moved;
      setPiece(moved);
      play('move', 0.3);
    },
    [running, gameOver, paused, play],
  );

  const rotatePiece = useCallback(() => {
    if (!running || gameOver || paused || clearingRef.current) return;
    const current = pieceRef.current;
    const rotated = rotateCW(current.shape);

    const tryKick = (offset: number) => {
      if (!collides(boardRef.current, current, offset, 0, rotated)) {
        const kicked = { ...current, x: current.x + offset, shape: rotated };
        pieceRef.current = kicked;
        setPiece(kicked);
        play('rotate', 0.4);
        return true;
      }
      return false;
    };
    if (tryKick(0)) return;
    if (tryKick(-1)) return;
    tryKick(1);
  }, [running, gameOver, paused, play]);

  useEffect(() => {
    if (!running || gameOver || paused || clearingRows) return;
    const speed = Math.max(MIN_GRAVITY_MS, BASE_GRAVITY_MS - (level - 1) * GRAVITY_STEP_MS);
    const timer = window.setInterval(() => {
      dropPiece(false);
    }, speed);
    return () => window.clearInterval(timer);
  }, [running, gameOver, paused, clearingRows, level, dropPiece]);

  useEffect(() => {
    if (!running) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) return;
      event.preventDefault();
      if (paused || gameOver || clearingRef.current) return;

      if (event.key === 'ArrowLeft') moveHorizontal(-1);
      else if (event.key === 'ArrowRight') moveHorizontal(1);
      else if (event.key === 'ArrowDown') dropPiece(true);
      else if (event.key === 'ArrowUp') rotatePiece();
      else if (event.key === ' ') {
        while (dropPiece(true)) {
          // hard drop until lock
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running, paused, gameOver, moveHorizontal, dropPiece, rotatePiece]);

  useEffect(() => {
    if (!gameOver) return;
    if (score > highScore.score) {
      setHighScore({ score, lines, level });
      setJustBeatHighScore(true);
      play('highScore', 0.8);
    }
  }, [gameOver, score, lines, level, highScore.score, setHighScore, play]);

  const renderedBoard = useMemo(() => {
    const next = board.map((row) => [...row]);
    if (gameOver || clearingRows) return next;

    const ghostY = computeGhostY(board, piece);
    for (let r = 0; r < piece.shape.length; r += 1) {
      for (let c = 0; c < piece.shape[r].length; c += 1) {
        if (!piece.shape[r][c]) continue;
        const x = piece.x + c;
        const y = ghostY + r;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && next[y][x] === 0) {
          next[y][x] = -piece.id;
        }
      }
    }
    for (let r = 0; r < piece.shape.length; r += 1) {
      for (let c = 0; c < piece.shape[r].length; c += 1) {
        if (!piece.shape[r][c]) continue;
        const x = piece.x + c;
        const y = piece.y + r;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          next[y][x] = piece.id;
        }
      }
    }
    return next;
  }, [board, piece, gameOver, clearingRows]);

  const nextPreview = useMemo(() => {
    const grid = Array.from({ length: 2 }, () => Array(4).fill(0));
    const shape = nextPiece.shape;
    for (let r = 0; r < shape.length && r < 2; r += 1) {
      for (let c = 0; c < shape[r].length && c < 4; c += 1) {
        if (shape[r][c]) grid[r][c] = nextPiece.id;
      }
    }
    return grid;
  }, [nextPiece]);

  const clearingRowSet = useMemo(() => new Set(clearingRows ?? []), [clearingRows]);

  return (
    <div className={`${styles.host} ${className ?? ''}`}>
      <div className={styles.difficultyRow}>
        <span>Level {level}</span>
        <button type="button" className={styles.difficultyBtn} onClick={togglePause} disabled={!running || gameOver}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className={styles.audioToggle} onClick={toggleMuted}>
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
      </div>

      <div className={styles.surface}>
        <div className={styles.tetrisWrap}>
          <div className={styles.tetrisBoard}>
            {renderedBoard.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.tetrisRow}>
                {row.map((cell, cellIndex) => {
                  const isGhost = cell < 0;
                  const pieceClass = PIECE_CLASSES[Math.abs(cell)];
                  const cls = `${styles.tetrisCell} ${pieceClass} ${isGhost ? styles.tetrisGhost : ''} ${clearingRowSet.has(rowIndex) ? styles.tetrisFlash : ''}`;
                  return <div key={`${rowIndex}-${cellIndex}`} className={cls} />;
                })}
              </div>
            ))}
          </div>

          <div className={styles.tetrisMeta}>
            <div className={styles.tetrisNext}>
              <span className={styles.statLabel}>Next</span>
              <div className={styles.tetrisNextBoard}>
                {nextPreview.flatMap((row, r) =>
                  row.map((cell, c) => (
                    <div key={`np-${r}-${c}`} className={`${styles.tetrisNextCell} ${PIECE_CLASSES[cell]}`} />
                  )),
                )}
              </div>
            </div>
            <Stat label="Score" value={score} />
            <Stat label="Lines" value={lines} />
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
          subtitle={justBeatHighScore ? 'New high score!' : undefined}
          stats={[
            { label: 'Score', value: score, highlight: justBeatHighScore },
            { label: 'Lines', value: lines },
            { label: 'Level', value: level },
            { label: 'Best', value: Math.max(score, highScore.score) },
          ]}
          actions={[]}
        />
      </div>

      <div className={styles.touchControls} aria-label="Tetris touch controls">
        <div className={styles.touchRow}>
          <button type="button" className={styles.touchBtn} onClick={() => moveHorizontal(-1)}>{'<'}</button>
          <button type="button" className={styles.touchBtn} onClick={() => dropPiece(true)}>v</button>
          <button type="button" className={styles.touchBtn} onClick={() => moveHorizontal(1)}>{'>'}</button>
          <button type="button" className={styles.touchBtn} onClick={rotatePiece}>ROT</button>
          <button type="button" className={styles.touchBtn} onClick={togglePause}>{paused ? 'PLAY' : 'PAUSE'}</button>
        </div>
      </div>
    </div>
  );
}
