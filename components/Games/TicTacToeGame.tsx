'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GameHost.module.css';

type Mark = 'X' | 'O';
type Cell = Mark | null;

interface Props {
  running: boolean;
  restartToken: number;
  className?: string;
}

interface ScoreState {
  x: number;
  o: number;
  draw: number;
}

const EMPTY_BOARD: Cell[] = Array(9).fill(null);

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getResult(board: Cell[]): Mark | 'draw' | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  if (board.every((cell) => cell)) return 'draw';
  return null;
}

function getStrategicMove(board: Cell[], mark: Mark): number | null {
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue;
    const next = [...board];
    next[i] = mark;
    if (getResult(next) === mark) return i;
  }
  return null;
}

function getRandomMove(board: Cell[], picks: number[]): number | null {
  const open = picks.filter((index) => !board[index]);
  if (!open.length) return null;
  return open[Math.floor(Math.random() * open.length)];
}

export default function TicTacToeGame({ running, restartToken, className }: Props) {
  const [board, setBoard] = useState<Cell[]>(EMPTY_BOARD);
  const [turn, setTurn] = useState<Mark>('X');
  const [result, setResult] = useState<Mark | 'draw' | null>(null);
  const [cursor, setCursor] = useState(4);
  const [score, setScore] = useState<ScoreState>({ x: 0, o: 0, draw: 0 });

  const boardRef = useRef<Cell[]>(EMPTY_BOARD);
  const aiTimerRef = useRef<number | null>(null);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const resetRound = useCallback(() => {
    if (aiTimerRef.current) {
      window.clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    const freshBoard = [...EMPTY_BOARD];
    boardRef.current = freshBoard;
    setBoard(freshBoard);
    setTurn('X');
    setResult(null);
    setCursor(4);
  }, []);

  useEffect(() => {
    resetRound();
  }, [restartToken, resetRound]);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    };
  }, []);

  const commitResult = useCallback((nextResult: Mark | 'draw') => {
    setResult(nextResult);
    setScore((prev) => {
      if (nextResult === 'X') return { ...prev, x: prev.x + 1 };
      if (nextResult === 'O') return { ...prev, o: prev.o + 1 };
      return { ...prev, draw: prev.draw + 1 };
    });
  }, []);

  const placeMark = useCallback((index: number, mark: Mark) => {
    const current = boardRef.current;
    if (current[index]) return false;

    const next = [...current];
    next[index] = mark;
    boardRef.current = next;
    setBoard(next);

    const nextResult = getResult(next);
    if (nextResult) {
      commitResult(nextResult);
    } else {
      setTurn(mark === 'X' ? 'O' : 'X');
    }

    return true;
  }, [commitResult]);

  useEffect(() => {
    if (!running || turn !== 'O' || result) return;

    aiTimerRef.current = window.setTimeout(() => {
      const current = boardRef.current;
      const winMove = getStrategicMove(current, 'O');
      const blockMove = getStrategicMove(current, 'X');
      const center = current[4] ? null : 4;
      const corner = getRandomMove(current, [0, 2, 6, 8]);
      const side = getRandomMove(current, [1, 3, 5, 7]);
      const move = winMove ?? blockMove ?? center ?? corner ?? side;

      if (move === null) {
        aiTimerRef.current = null;
        return;
      }

      const next = [...current];
      next[move] = 'O';
      boardRef.current = next;
      setBoard(next);

      const nextResult = getResult(next);
      if (nextResult) {
        commitResult(nextResult);
      } else {
        setTurn('X');
      }

      aiTimerRef.current = null;
    }, 220);

    return () => {
      if (aiTimerRef.current) {
        window.clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [running, turn, result, commitResult]);

  const handlePlayerMove = useCallback((index: number) => {
    if (!running || turn !== 'X' || result || boardRef.current[index]) return;
    placeMark(index, 'X');
  }, [running, turn, result, placeMark]);

  useEffect(() => {
    if (!running) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) return;
      event.preventDefault();

      if (event.key === 'ArrowLeft') {
        setCursor((prev) => {
          const row = Math.floor(prev / 3);
          const col = prev % 3;
          return row * 3 + ((col + 2) % 3);
        });
        return;
      }

      if (event.key === 'ArrowRight') {
        setCursor((prev) => {
          const row = Math.floor(prev / 3);
          const col = prev % 3;
          return row * 3 + ((col + 1) % 3);
        });
        return;
      }

      if (event.key === 'ArrowUp') {
        setCursor((prev) => {
          const row = Math.floor(prev / 3);
          const col = prev % 3;
          return ((row + 2) % 3) * 3 + col;
        });
        return;
      }

      if (event.key === 'ArrowDown') {
        setCursor((prev) => {
          const row = Math.floor(prev / 3);
          const col = prev % 3;
          return ((row + 1) % 3) * 3 + col;
        });
        return;
      }

      handlePlayerMove(cursor);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running, cursor, handlePlayerMove]);

  const status = useMemo(() => {
    if (result === 'draw') return 'Draw. Press Restart or R to play again.';
    if (result === 'X') return 'You won. Press Restart or R to play again.';
    if (result === 'O') return 'CPU won. Press Restart or R to play again.';
    if (turn === 'O') return 'CPU is thinking...';
    return 'Your turn (X).';
  }, [result, turn]);

  return (
    <div className={`${styles.host} ${className ?? ''}`}>
      <span className={styles.status}>{status}</span>
      <div className={styles.surface}>
        <div className={styles.tttGrid}>
          {board.map((cell, index) => {
            const markClass = cell === 'X' ? styles.tttMarkX : styles.tttMarkO;
            return (
              <button
                key={index}
                type="button"
                className={`${styles.tttCell} ${index === cursor ? styles.tttCellActive : ''}`}
                onClick={() => {
                  setCursor(index);
                  handlePlayerMove(index);
                }}
                disabled={!running || Boolean(result) || turn !== 'X' || Boolean(cell)}
                aria-label={`Cell ${index + 1}`}
              >
                <span className={markClass}>{cell ?? ''}</span>
              </button>
            );
          })}
        </div>
      </div>
      <span className={styles.status}>Wins X/O/Draw: {score.x} / {score.o} / {score.draw}</span>
    </div>
  );
}
