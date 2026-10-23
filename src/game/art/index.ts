import type { ArtAsset } from './worldArt';
import { ROAD_ASSETS } from './roadArt';
import { WORLD_ASSETS } from './worldArt';

export const ALL_ASSETS: readonly ArtAsset[] = [
  ...ROAD_ASSETS,
  ...WORLD_ASSETS,
];

export const TEXTURE_HEIGHT = new Map<string, number>(
  ALL_ASSETS.map((asset) => [asset.key, asset.h]),
);