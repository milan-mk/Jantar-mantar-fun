export type CharacterId =
  | 'neha'
  | 'abhijit'
  | 'nsui'
  | 'genz'
  | 'ex_minister'
  | 'wheelchair'
  | 'chhota'
  | 'student'
  | 'artist'
  | 'checker';

export type PowerUpKind = 'shield' | 'community' | 'energy';

export type Screen =
  | 'menu'
  | 'select'
  | 'howto'
  | 'settings'
  | 'playing'
  | 'paused'
  | 'gameover';

export interface Settings {
  sound: boolean;
  music: boolean;
  reducedMotion: boolean;
}

export interface SaveData {
  bestScore: number;
  character: CharacterId;
  settings: Settings;
}

/** Final numbers for a finished run. */
export interface RunStats {
  score: number;
  /** Metres run. */
  distance: number;
  items: number;
  timeSec: number;
  /** Remaining stamina, 0-100. */
  life: number;
  /** True when the runner reached the finish line. */
  won: boolean;
  isNewBest: boolean;
}

/** Throttled snapshot the scene sends to the React HUD. */
export interface HudState {
  score: number;
  distance: number;
  goal: number;
  life: number;
  items: number;
  timeSec: number;
  detainedMs: number;
  shieldMs: number;
  communityMs: number;
  energyMs: number;
  fps: number;
}

export interface MoveVector {
  /** -1 (left) .. 1 (right) */
  x: number;
  /** -1 (slow down) .. 1 (sprint) */
  y: number;
}

/** Typed events crossing the React <-> Phaser boundary. */
export interface BridgeEvents {
  // Phaser -> React
  ready: void;
  error: string;
  hud: HudState;
  gameover: RunStats;
  // React -> Phaser
  jump: void;
  move: MoveVector;
  pause: void;
  resume: void;
  restart: void;
}
