import { DETENTION_ASSETS } from './detentionArt';
import { GAS_ASSETS } from './gasArt';
import { ROAD_ASSETS } from './roadArt';
import { WORLD_ASSETS, type ArtAsset } from './worldArt';

/** Every texture that is not a character pose. */
export const ALL_ASSETS: readonly ArtAsset[] = [...WORLD_ASSETS, ...ROAD_ASSETS, ...DETENTION_ASSETS, ...GAS_ASSETS];

/** Raster height in pixels per texture key (used to size sprites in world units). */
export const TEXTURE_HEIGHT: ReadonlyMap<string, number> = new Map(ALL_ASSETS.map((a) => [a.key, a.h]));
