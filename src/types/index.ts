export type CharacterId = 'student' | 'artist' | 'checker' | 'climber';

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

export type RunMode = 'free' | 'daily';

/** A recorded run, sampled every 100 ms, replayed as the "best run" ghost. */
export interface GhostRun {
  score: number;
  /** Distance in decimetres at each sample. */
  d: number[];
  /** Lateral position x 100 at each sample. */
  x: number[];
}

/** Long-term progress: streak, daily missions, achievements and unlocks. */
export interface Progress {
  streak: { last: string; count: number };
  /** Missions completed on `date` (ids), so each day starts fresh. */
  missionsDone: { date: string; ids: string[] };
  missionsTotal: number;
  achievements: string[];
  totalItems: number;
  totalRuns: number;
  unlocked: CharacterId[];
}

export interface SaveData {
  progress: Progress;
  bestScore: number;
  /** Best runs by key: 'free' or 'daily-YYYY-MM-DD'. */
  ghosts: Record<string, GhostRun>;
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
  mode: RunMode;
  /** YYYY-MM-DD for daily runs, empty otherwise. */
  dailyKey: string;
  closeCalls: number;
  timesCaught: number;
  barricadeJumps: number;
  /** Times the runner escaped the van in under 2.5 s by mashing. */
  fastEscapes: number;
  trace: GhostRun;
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
