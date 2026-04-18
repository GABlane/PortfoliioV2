export const GAME_SOUNDS = {
  move: '/sounds/deck_ui_navigation.wav',
  confirm: '/sounds/confirmation_positive.wav',
  deny: '/sounds/confirmation_negative.wav',
  lock: '/sounds/deck_ui_default_activation.wav',
  lineClear: '/sounds/bumper_end.wav',
  tetrisClear: '/sounds/deck_ui_bumper_end_02.wav',
  score: '/sounds/deck_ui_toast.wav',
  paddleHit: '/sounds/deck_ui_default_activation.wav',
  wallBounce: '/sounds/deck_ui_typing.wav',
  win: '/sounds/deck_ui_achievement_toast.wav',
  gameOver: '/sounds/deck_ui_out_of_game_detail.wav',
  start: '/sounds/deck_ui_launch_game.wav',
  pauseIn: '/sounds/deck_ui_side_menu_fly_in.wav',
  pauseOut: '/sounds/deck_ui_side_menu_fly_out.wav',
  eat: '/sounds/deck_ui_misc_10.wav',
  crash: '/sounds/deck_ui_bumper_end_02.wav',
  highScore: '/sounds/deck_ui_achievement_toast.wav',
} as const;

export type GameSoundName = keyof typeof GAME_SOUNDS;
