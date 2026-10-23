import type { Bridge } from '../../lib/bridge';
import type { CharacterId, GhostRun, RunMode, Settings } from '../../types';

/**
 * Mutable options object shared between the React wrapper and the scenes.
 * React updates the fields; the scenes read them when a run (re)starts or
 * when they need a setting, so no React state is touched from the game loop.
 */
export interface GameOptions {
  bridge: Bridge;
  character: CharacterId;
  settings: Settings;
  /** Best score for the current mode (free or today's daily). */
  bestScore: number;
  mode: RunMode;
  /** YYYY-MM-DD, used to seed the daily street. */
  dailyKey: string;
  /** The run to replay as a ghost, if any. */
  ghost: GhostRun | null;
}
