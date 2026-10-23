/** Logical game resolution. Phaser scales this to fit the screen (FIT mode). */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// ---- Perspective -----------------------------------------------------------
// The street is a flat plane seen from behind the runner. A point `z` metres
// ahead of the runner has scale s = Z_CAM / (Z_CAM + z): 1 at the runner,
// smaller the further away, and larger than 1 once it has passed.
export const HORIZON_Y = 165;
export const PLAYER_Y = 468;
export const CENTER_X = 480;
/** Half the road width in pixels at scale 1. One lateral unit = this many px. */
export const ROAD_HALF_PX = 300;
export const Z_CAM = 9;
export const VIEW_DIST = 115;
/** Pixels per metre of height at scale 1. */
export const PPM = 100;
/** How much the camera slides sideways with the runner (0 = fixed). */
export const CAMERA_FOLLOW = 0.5;

// ---- Run -------------------------------------------------------------------
export const GOAL_METERS = 1200;
/** Distances (m) where a tougher checkpoint with a guard line appears. */
export const CHECKPOINTS: readonly number[] = [400, 800, 1100];
export const BASE_SPEED = 11; // m/s
export const MAX_SPEED = 17;
export const SPRINT_MULT = 1.3;
export const SLOW_MULT = 0.55;
export const ENERGY_SPEED_MULT = 1.25;

/** Lateral speed in road-half-widths per second. */
export const LATERAL_SPEED = 1.9;
export const X_LIMIT = 0.94;
/** Four lane centres. */
export const LANE_X: readonly number[] = [-0.75, -0.25, 0.25, 0.75];

// ---- Jump (metres, seconds) -----------------------------------------------
export const GRAVITY = 24;
export const JUMP_VELOCITY = 8.4;
export const ENERGY_JUMP_VELOCITY = 9.2;

// ---- Collision -------------------------------------------------------------
export const PLAYER_HALF_W = 0.13;
export const PLAYER_HALF_D = 0.4;

// ---- Life and penalties ----------------------------------------------------
export const MAX_LIFE = 100;
export const DETAIN_MS = 5000;
export const INVULN_MS = 1600;
export const STUMBLE_MS = 900;
export const STUN_MS = 800;
export const SPLASH_MS = 1200;
export const DEATH_HOLD_MS = 900;
export const WIN_HOLD_MS = 700;

// ---- Power-ups -------------------------------------------------------------
export const SHIELD_MS = 12000;
export const COMMUNITY_MS = 10000;
export const ENERGY_MS = 7000;

// ---- Loop ------------------------------------------------------------------
export const MAX_DELTA_MS = 50;
export const HUD_INTERVAL_MS = 100;

export const COLORS = {
  navy: 0x0b1530,
  cream: 0xfff4dc,
  saffron: 0xff9933,
  teal: 0x17a5a0,
  red: 0xd64545,
  gold: 0xffd23f,
} as const;
