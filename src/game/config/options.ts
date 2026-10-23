import type { Bridge } from '../../lib/bridge';
import type { CharacterId, Settings } from '../../types';

export interface GameOptions {
  bridge: Bridge;
  character: CharacterId;
  settings: Settings;
  bestScore: number;
}