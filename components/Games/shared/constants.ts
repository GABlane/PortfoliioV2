export const PONG = {
  FIELD_WIDTH: 560,
  FIELD_HEIGHT: 220,
  PADDLE_HEIGHT: 62,
  PADDLE_WIDTH: 8,
  BALL_SIZE: 10,
  LEFT_PADDLE_X: 10,
  PLAYER_SPEED: 305,
  MATCH_POINT: 11,
  BALL_MAX_SPEED: 420,
  BALL_ACCEL_ON_HIT: 18,
  BOUNCE_X_DAMPEN: 0.92,
  BOUNCE_VY_FROM_IMPACT: 0.62,
  SERVE_SPEED_MIN: 205,
  SERVE_SPEED_JITTER: 40,
  SERVE_VY_RANGE: 120,
  AI: {
    easy: { speed: 180, deadzone: 10 },
    medium: { speed: 250, deadzone: 4 },
    hard: { speed: 320, deadzone: 2 },
  },
} as const;

export type PongDifficulty = keyof typeof PONG.AI;

export const TETRIS = {
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  LINE_SCORES: [0, 100, 300, 500, 800] as const,
  LINES_PER_LEVEL: 10,
  MIN_GRAVITY_MS: 90,
  BASE_GRAVITY_MS: 620,
  GRAVITY_STEP_MS: 48,
  LINE_FLASH_MS: 120,
} as const;

export const SNAKE = {
  COLS: 20,
  ROWS: 14,
  START_LENGTH: 3,
  BASE_TICK_MS: 140,
  MIN_TICK_MS: 60,
  TICK_STEP_MS: 6,
  SCORE_PER_APPLE: 10,
  LENGTH_PER_SPEEDUP: 5,
} as const;

export const TTT = {
  AI_MOVE_DELAY_MS: 220,
} as const;

export type TttDifficulty = 'easy' | 'medium' | 'hard';
