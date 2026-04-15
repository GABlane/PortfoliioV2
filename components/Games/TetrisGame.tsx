'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GameHost.module.css';

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

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

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

function clearLines(board: Board): { board: Board; cleared: number } {
  const keptRows = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = BOARD_HEIGHT - keptRows.length;
  while (keptRows.length < BOARD_HEIGHT) {
    keptRows.unshift(Array(BOARD_WIDTH).fill(0));
  }
  return { board: keptRows, cleared };
}

function rotateCW(shape: number[][]): number[][] {
  return shape[0].map((_, col) => shape.map((row) => row[col]).reverse());
}

export default function TetrisGame({ running, restartToken, className }: Props) {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [piece, setPiece] = useState<ActivePiece>(() => randomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const boardRef = useRef(board);
  const pieceRef = useRef(piece);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { pieceRef.current = piece; }, [piece]);

  const resetGame = useCallback(() => {
    const freshBoard = createEmptyBoard();
    const freshPiece = randomPiece();
    boardRef.current = freshBoard;
    pieceRef.current = freshPiece;
    setBoard(freshBoard);
    setPiece(freshPiece);
    setScore(0);
    setLines(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    resetGame();
  }, [running, restartToken, resetGame]);

  const lockPiece = useCallback((lockedPiece: ActivePiece) => {
    const merged = merge(boardRef.current, lockedPiece);
    const { board: nextBoard, cleared } = clearLines(merged);

    boardRef.current = nextBoard;
    setBoard(nextBoard);

    if (cleared > 0) {
      setLines((prev) => prev + cleared);
      setScore((prev) => prev + cleared * 100);
    }

    const nextPiece = randomPiece();
    if (collides(nextBoard, nextPiece, 0, 0)) {
      setGameOver(true);
      return;
    }

    pieceRef.current = nextPiece;
    setPiece(nextPiece);
  }, []);

  const dropPiece = useCallback((awardSoftDrop = false): boolean => {
    if (!running || gameOver) return false;
    const current = pieceRef.current;

    if (collides(boardRef.current, current, 0, 1)) {
      lockPiece(current);
      return false;
    }

    const moved = { ...current, y: current.y + 1 };
    pieceRef.current = moved;
    setPiece(moved);

    if (awardSoftDrop) {
      setScore((prev) => prev + 1);
    }

    return true;
  }, [running, gameOver, lockPiece]);

  const moveHorizontal = useCallback((delta: number) => {
    if (!running || gameOver) return;
    const current = pieceRef.current;
    if (collides(boardRef.current, current, delta, 0)) return;
    const moved = { ...current, x: current.x + delta };
    pieceRef.current = moved;
    setPiece(moved);
  }, [running, gameOver]);

  const rotatePiece = useCallback(() => {
    if (!running || gameOver) return;
    const current = pieceRef.current;
    const rotated = rotateCW(current.shape);

    if (!collides(boardRef.current, current, 0, 0, rotated)) {
      const updated = { ...current, shape: rotated };
      pieceRef.current = updated;
      setPiece(updated);
      return;
    }

    if (!collides(boardRef.current, current, -1, 0, rotated)) {
      const kicked = { ...current, x: current.x - 1, shape: rotated };
      pieceRef.current = kicked;
      setPiece(kicked);
      return;
    }

    if (!collides(boardRef.current, current, 1, 0, rotated)) {
      const kicked = { ...current, x: current.x + 1, shape: rotated };
      pieceRef.current = kicked;
      setPiece(kicked);
    }
  }, [running, gameOver]);

  useEffect(() => {
    if (!running || gameOver) return;
    const speed = Math.max(130, 620 - lines * 14);
    const timer = window.setInterval(() => {
      dropPiece(false);
    }, speed);

    return () => window.clearInterval(timer);
  }, [running, gameOver, lines, dropPiece]);

  useEffect(() => {
    if (!running) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) return;
      event.preventDefault();

      if (event.key === 'ArrowLeft') {
        moveHorizontal(-1);
      } else if (event.key === 'ArrowRight') {
        moveHorizontal(1);
      } else if (event.key === 'ArrowDown') {
        dropPiece(true);
      } else if (event.key === 'ArrowUp') {
        rotatePiece();
      } else if (event.key === ' ') {
        while (dropPiece(true)) {
          // hard drop until lock
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running, moveHorizontal, dropPiece, rotatePiece]);

  const renderedBoard = useMemo(() => {
    const next = board.map((row) => [...row]);

    if (!gameOver) {
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
    }

    return next;
  }, [board, piece, gameOver]);

  const status = gameOver
    ? 'Game over. Press Restart or R to begin again.'
    : 'Arrow keys move, Up rotates, Space hard-drops.';

  return (
    <div className={`${styles.host} ${className ?? ''}`}>
      <span className={styles.status}>{status}</span>
      <div className={styles.surface}>
        <div className={styles.tetrisWrap}>
          <div className={styles.tetrisBoard}>
            {renderedBoard.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.tetrisRow}>
                {row.map((cell, cellIndex) => (
                  <div
                    key={`${rowIndex}-${cellIndex}`}
                    className={`${styles.tetrisCell} ${PIECE_CLASSES[cell]}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className={styles.tetrisMeta}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Score</span>
              <span className={styles.statValue}>{score}</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Lines</span>
              <span className={styles.statValue}>{lines}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.touchControls} aria-label="Tetris touch controls">
        <div className={styles.touchRow}>
          <button type="button" className={styles.touchBtn} onClick={() => moveHorizontal(-1)}>{'<'}</button>
          <button type="button" className={styles.touchBtn} onClick={() => dropPiece(true)}>v</button>
          <button type="button" className={styles.touchBtn} onClick={() => moveHorizontal(1)}>{'>'}</button>
          <button type="button" className={styles.touchBtn} onClick={rotatePiece}>ROT</button>
        </div>
      </div>
    </div>
  );
}
