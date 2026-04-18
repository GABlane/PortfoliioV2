'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GameHost.module.css';
import GameOverlay from './shared/GameOverlay';
import Stat from './shared/Stat';
import { useGameAudio } from './shared/useGameAudio';
import { useGameStorage } from './shared/useGameStorage';
import { GAME_SOUNDS } from './shared/sounds';
import { TTT, type TttDifficulty } from './shared/constants';

type Mark = 'X' | 'O';
type Cell = Mark | null;
type Mode = 'ai' | 'pvp';

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
const INITIAL_SCORE: ScoreState = { x: 0, o: 0, draw: 0 };

const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getResult(board: Cell[]): Mark | 'draw' | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  if (board.every((cell) => cell)) return 'draw';
  return null;
}

function getWinningLine(board: Cell[]): number[] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return line;
  }
  return null;
}

function findImmediateMove(board: Cell[], mark: Mark): number | null {
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue;
    const next = [...board];
    next[i] = mark;
    if (getResult(next) === mark) return i;
  }
  return null;
}

function pickRandom(board: Cell[], picks: number[]): number | null {
  const open = picks.filter((index) => !board[index]);
  if (!open.length) return null;
  return open[Math.floor(Math.random() * open.length)];
}

function minimax(board: Cell[], player: Mark, maximizer: Mark, depth: number): number {
  const result = getResult(board);
  if (result === maximizer) return 10 - depth;
  if (result && result !== 'draw') return depth - 10;
  if (result === 'draw') return 0;

  const isMax = player === maximizer;
  let best = isMax ? -Infinity : Infinity;
  const next: Mark = player === 'X' ? 'O' : 'X';

  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue;
    const candidate = [...board];
    candidate[i] = player;
    const score = minimax(candidate, next, maximizer, depth + 1);
    best = isMax ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function getOptimalMove(board: Cell[], mark: Mark): number | null {
  let bestScore = -Infinity;
  let bestMove: number | null = null;
  const opponent: Mark = mark === 'X' ? 'O' : 'X';
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue;
    const next = [...board];
    next[i] = mark;
    const score = minimax(next, opponent, mark, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

function chooseAiMove(board: Cell[], difficulty: TttDifficulty): number | null {
  if (difficulty === 'easy') {
    return pickRandom(board, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  }
  if (difficulty === 'medium') {
    const winMove = findImmediateMove(board, 'O');
    const blockMove = findImmediateMove(board, 'X');
    const center = board[4] ? null : 4;
    const corner = pickRandom(board, [0, 2, 6, 8]);
    const side = pickRandom(board, [1, 3, 5, 7]);
    return winMove ?? blockMove ?? center ?? corner ?? side;
  }
  return getOptimalMove(board, 'O');
}

const DIFFICULTY_LABELS: Record<TttDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export default function TicTacToeGame({ running, restartToken, className }: Props) {
  const [board, setBoard] = useState<Cell[]>(EMPTY_BOARD);
  const [turn, setTurn] = useState<Mark>('X');
  const [result, setResult] = useState<Mark | 'draw' | null>(null);
  const [cursor, setCursor] = useState(4);
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState<ScoreState>(INITIAL_SCORE);
  const [lifetimeScore, setLifetimeScore] = useGameStorage<ScoreState>('ttt.lifetime', INITIAL_SCORE);
  const [difficulty, setDifficulty] = useGameStorage<TttDifficulty>('ttt.difficulty', 'medium');
  const [mode, setMode] = useGameStorage<Mode>('ttt.mode', 'ai');

  const { play, muted, toggleMuted } = useGameAudio({
    move: GAME_SOUNDS.move,
    confirm: GAME_SOUNDS.confirm,
    win: GAME_SOUNDS.win,
    draw: GAME_SOUNDS.deny,
    restart: GAME_SOUNDS.start,
  });

  const boardRef = useRef<Cell[]>(EMPTY_BOARD);
  const aiTimerRef = useRef<number | null>(null);

  useEffect(() => { boardRef.current = board; }, [board]);

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
    setLastPlaced(null);
  }, []);

  useEffect(() => {
    resetRound();
  }, [restartToken, resetRound]);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    };
  }, []);

  const commitResult = useCallback(
    (nextResult: Mark | 'draw') => {
      setResult(nextResult);
      setSessionScore((prev) => {
        if (nextResult === 'X') return { ...prev, x: prev.x + 1 };
        if (nextResult === 'O') return { ...prev, o: prev.o + 1 };
        return { ...prev, draw: prev.draw + 1 };
      });
      setLifetimeScore((prev) => {
        if (nextResult === 'X') return { ...prev, x: prev.x + 1 };
        if (nextResult === 'O') return { ...prev, o: prev.o + 1 };
        return { ...prev, draw: prev.draw + 1 };
      });
      if (nextResult === 'draw') play('draw', 0.6);
      else play('win', 0.8);
    },
    [play, setLifetimeScore],
  );

  const placeMark = useCallback(
    (index: number, mark: Mark) => {
      const current = boardRef.current;
      if (current[index]) return false;

      const next = [...current];
      next[index] = mark;
      boardRef.current = next;
      setBoard(next);
      setLastPlaced(index);
      play(mark === 'X' ? 'confirm' : 'move', 0.6);

      const nextResult = getResult(next);
      if (nextResult) {
        commitResult(nextResult);
      } else {
        setTurn(mark === 'X' ? 'O' : 'X');
      }
      return true;
    },
    [commitResult, play],
  );

  useEffect(() => {
    if (!running || mode !== 'ai' || turn !== 'O' || result) return;

    aiTimerRef.current = window.setTimeout(() => {
      const move = chooseAiMove(boardRef.current, difficulty);
      if (move === null) {
        aiTimerRef.current = null;
        return;
      }
      placeMark(move, 'O');
      aiTimerRef.current = null;
    }, TTT.AI_MOVE_DELAY_MS);

    return () => {
      if (aiTimerRef.current) {
        window.clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [running, mode, turn, result, difficulty, placeMark]);

  const handlePlayerMove = useCallback(
    (index: number) => {
      if (!running || result || boardRef.current[index]) return;
      if (mode === 'ai' && turn !== 'X') return;
      placeMark(index, turn);
    },
    [running, result, mode, turn, placeMark],
  );

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

  const winningLine = useMemo(() => (result === 'X' || result === 'O' ? getWinningLine(board) : null), [board, result]);

  const overlay = useMemo(() => {
    if (!result) return null;
    const title = result === 'draw'
      ? 'Draw'
      : mode === 'ai'
        ? result === 'X' ? 'You win' : 'CPU wins'
        : `Player ${result} wins`;
    const subtitle = `Session ${sessionScore.x} - ${sessionScore.o} - ${sessionScore.draw}`;
    return { title, subtitle };
  }, [result, mode, sessionScore]);

  const handleRestart = useCallback(() => {
    play('restart', 0.6);
    resetRound();
  }, [play, resetRound]);

  return (
    <div className={`${styles.host} ${className ?? ''}`}>
      <div className={styles.difficultyRow}>
        <span>Mode</span>
        {(['ai', 'pvp'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.difficultyBtn} ${mode === m ? styles.difficultyBtnActive : ''}`}
            onClick={() => {
              setMode(m);
              resetRound();
            }}
          >
            {m === 'ai' ? 'vs AI' : 'PvP'}
          </button>
        ))}
        {mode === 'ai' && (
          <>
            <span style={{ marginLeft: 8 }}>AI</span>
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.difficultyBtn} ${difficulty === d ? styles.difficultyBtnActive : ''}`}
                onClick={() => {
                  setDifficulty(d);
                  resetRound();
                }}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </>
        )}
        <button type="button" className={styles.audioToggle} onClick={toggleMuted} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
      </div>

      <div className={styles.surface}>
        <div className={styles.tttGrid}>
          {board.map((cell, index) => {
            const markClass = cell === 'X' ? styles.tttMarkX : styles.tttMarkO;
            const isWinning = winningLine?.includes(index);
            const justPlaced = lastPlaced === index;
            return (
              <button
                key={index}
                type="button"
                className={`${styles.tttCell} ${index === cursor ? styles.tttCellActive : ''}`}
                onClick={() => {
                  setCursor(index);
                  handlePlayerMove(index);
                }}
                disabled={!running || Boolean(result) || Boolean(cell)}
                aria-label={`Cell ${index + 1}`}
              >
                <span
                  className={`${markClass} ${justPlaced ? styles.tttMarkEnter : ''}`}
                  style={isWinning ? { textShadow: '0 0 8px currentColor' } : undefined}
                >
                  {cell ?? ''}
                </span>
              </button>
            );
          })}
        </div>

        <GameOverlay
          open={Boolean(overlay)}
          variant={result === 'draw' ? 'game-over' : 'win'}
          title={overlay?.title ?? ''}
          subtitle={overlay?.subtitle}
          stats={[
            { label: 'X Wins', value: lifetimeScore.x, highlight: result === 'X' },
            { label: 'O Wins', value: lifetimeScore.o, highlight: result === 'O' },
            { label: 'Draws', value: lifetimeScore.draw, highlight: result === 'draw' },
          ]}
          actions={[{ label: 'Play Again', onClick: handleRestart, primary: true }]}
        />
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <Stat label="X Wins" value={sessionScore.x} />
        <Stat label="O Wins" value={sessionScore.o} />
        <Stat label="Draws" value={sessionScore.draw} />
      </div>
    </div>
  );
}
