import { BUILDING_KEYS, ROAD_TEX, SPECTATOR_KEYS } from '../art/roadArt';
import { TEX } from '../art/worldArt';

export type HazardKind = 'barricade' | 'rickshaw' | 'paper' | 'cones' | 'puddle' | 'clerk' | 'stamp';
export type PickupKind = 'token' | 'megaphone' | 'placard' | 'fact' | 'shield' | 'community' | 'energy';
export type SceneryKind = 'tree' | 'lamp' | 'building' | 'spectator' | 'arch';
export type EntityKind = HazardKind | PickupKind | SceneryKind;

export interface EntitySpec {
  /** One texture per variant (scenery) or per animation frame (walkers). */
  frames: readonly string[];
  /** True when `frames` are walk-cycle frames rather than random variants. */
  animated?: boolean;
  /** Height in metres. Width follows the artwork's aspect ratio. */
  heightM: number;
  /** Collision half-width in lateral units, half-depth in metres. */
  halfW: number;
  halfD: number;
  /** Jump height (m) needed to clear it; 0 means it cannot be jumped. */
  clearH: number;
  /** Metres above the road surface the sprite floats. */
  lift: number;
  /** Drawn flat on the road (below everything else). */
  decal?: boolean;
  /** Horizontal squeeze, used to make front-on facades read as side-on. */
  squeezeX?: number;
  /** Remove once this far behind the runner (metres, negative). */
  despawnZ: number;
}

export const SPECS: Record<EntityKind, EntitySpec> = {
  barricade: { frames: [ROAD_TEX.barricade], heightM: 0.8, halfW: 0.25, halfD: 0.35, clearH: 0.75, lift: 0, despawnZ: -3 },
  rickshaw: { frames: [ROAD_TEX.rickshaw], heightM: 1.6, halfW: 0.26, halfD: 0.5, clearH: 0, lift: 0, despawnZ: -3 },
  paper: { frames: [ROAD_TEX.paper], heightM: 1.5, halfW: 0.19, halfD: 0.35, clearH: 0, lift: 0, despawnZ: -3 },
  cones: { frames: [ROAD_TEX.cones], heightM: 0.55, halfW: 0.2, halfD: 0.3, clearH: 0.5, lift: 0, despawnZ: -3 },
  puddle: { frames: [ROAD_TEX.puddle], heightM: 0.24, halfW: 0.25, halfD: 0.5, clearH: 0.12, lift: 0, decal: true, despawnZ: -3 },
  clerk: { frames: [ROAD_TEX.clerk0, ROAD_TEX.clerk1], animated: true, heightM: 1.75, halfW: 0.3, halfD: 0.6, clearH: 0, lift: 0, despawnZ: -3 },
  stamp: { frames: [ROAD_TEX.stamp0, ROAD_TEX.stamp1], animated: true, heightM: 2.1, halfW: 0.24, halfD: 0.4, clearH: 0, lift: 0, despawnZ: -3 },

  token: { frames: [TEX.token], heightM: 0.5, halfW: 0.2, halfD: 0.6, clearH: 0, lift: 0.5, despawnZ: -3 },
  megaphone: { frames: [TEX.megaphone], heightM: 0.55, halfW: 0.2, halfD: 0.6, clearH: 0, lift: 0.5, despawnZ: -3 },
  placard: { frames: [TEX.placard], heightM: 0.7, halfW: 0.2, halfD: 0.6, clearH: 0, lift: 0.5, despawnZ: -3 },
  fact: { frames: [TEX.fact], heightM: 0.55, halfW: 0.2, halfD: 0.6, clearH: 0, lift: 0.5, despawnZ: -3 },
  shield: { frames: [TEX.shield], heightM: 0.75, halfW: 0.22, halfD: 0.6, clearH: 0, lift: 0.5, despawnZ: -3 },
  community: { frames: [TEX.community], heightM: 0.75, halfW: 0.22, halfD: 0.6, clearH: 0, lift: 0.5, despawnZ: -3 },
  energy: { frames: [TEX.energy], heightM: 0.75, halfW: 0.22, halfD: 0.6, clearH: 0, lift: 0.5, despawnZ: -3 },

  tree: { frames: [ROAD_TEX.tree], heightM: 4.0, halfW: 0, halfD: 0, clearH: 0, lift: 0, despawnZ: -6 },
  lamp: { frames: [ROAD_TEX.lamp], heightM: 5.0, halfW: 0, halfD: 0, clearH: 0, lift: 0, despawnZ: -6 },
  building: { frames: BUILDING_KEYS, heightM: 7, halfW: 0, halfD: 0, clearH: 0, lift: 0, squeezeX: 0.55, despawnZ: -8 },
  spectator: { frames: SPECTATOR_KEYS, heightM: 1.65, halfW: 0, halfD: 0, clearH: 0, lift: 0, despawnZ: -4 },
  arch: { frames: [ROAD_TEX.arch], heightM: 3.4, halfW: 0, halfD: 0, clearH: 0, lift: 0, despawnZ: -8 },
};

export const HAZARD_KINDS: readonly EntityKind[] = ['barricade', 'rickshaw', 'paper', 'cones', 'puddle', 'clerk', 'stamp'];
export const PICKUP_KINDS: readonly EntityKind[] = ['token', 'megaphone', 'placard', 'fact', 'shield', 'community', 'energy'];

export const ITEM_POINTS = {
  token: 10,
  megaphone: 25,
  placard: 40,
  fact: 60,
} as const;
