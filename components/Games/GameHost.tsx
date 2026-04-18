'use client';

import type { GameId } from '@/types/portfolio';
import TicTacToeGame from './TicTacToeGame';
import TetrisGame from './TetrisGame';
import PongGame from './PongGame';
import SnakeGame from './SnakeGame';

interface Props {
  gameId: GameId;
  running: boolean;
  restartToken: number;
  className?: string;
}

export default function GameHost({ gameId, running, restartToken, className }: Props) {
  if (gameId === 'tic-tac-toe') {
    return <TicTacToeGame running={running} restartToken={restartToken} className={className} />;
  }

  if (gameId === 'tetris') {
    return <TetrisGame running={running} restartToken={restartToken} className={className} />;
  }

  if (gameId === 'snake') {
    return <SnakeGame running={running} restartToken={restartToken} className={className} />;
  }

  return <PongGame running={running} restartToken={restartToken} className={className} />;
}
