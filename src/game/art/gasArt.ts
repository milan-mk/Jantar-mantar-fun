import { NAVY, makeAsset, type ArtAsset } from './worldArt';

/** Tear-gas canister (in flight) and the cloud it leaves. Cartoon style, no realistic detail. */
export const GAS_TEX = {
  can: 'gas-can',
  cloud: 'gas-cloud',
} as const;

const can = makeAsset(
  GAS_TEX.can,
  40,
  56,
  // smoke trail
  `<circle cx="20" cy="50" r="7" fill="rgba(225,232,220,0.6)"/><circle cx="14" cy="44" r="5" fill="rgba(225,232,220,0.5)"/>` +
    // canister body
    `<rect x="11" y="8" width="18" height="34" rx="6" fill="#7d8798" stroke="${NAVY}" stroke-width="2"/>` +
    `<rect x="11" y="18" width="18" height="7" fill="#d64545"/>` +
    `<rect x="14" y="3" width="12" height="7" rx="2" fill="#4a5163" stroke="${NAVY}" stroke-width="1.6"/>` +
    `<path d="M15 12 L15 38" stroke="rgba(255,255,255,0.45)" stroke-width="2.4" stroke-linecap="round"/>`,
);

/** A soft, rolling cloud of grey-green puffs, 240 x 150. */
function cloudSvg(): string {
  const puffs: Array<[number, number, number, number]> = [
    [120, 80, 62, 0.55],
    [70, 90, 46, 0.5],
    [170, 92, 48, 0.5],
    [100, 52, 44, 0.5],
    [146, 56, 46, 0.5],
    [120, 100, 54, 0.45],
    [48, 104, 30, 0.4],
    [194, 106, 32, 0.4],
  ];
  return puffs
    .map(([x, y, r, a]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(214,226,200,${a})"/>`)
    .join('') +
    `<circle cx="120" cy="76" r="34" fill="rgba(240,246,230,0.35)"/>`;
}

const cloud = makeAsset(GAS_TEX.cloud, 240, 150, cloudSvg());

export const GAS_ASSETS: readonly ArtAsset[] = [can, cloud];
