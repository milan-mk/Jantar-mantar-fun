import type { CharacterDef } from '../config/characters';

/**
 * Original procedural SVG characters. Gameplay uses a back view (the camera
 * follows the runner); the menus use a front view. Frames are drawn on a
 * 96x128 grid and rasterised at 2x so they stay crisp when scaled up.
 */

export type Pose = 'run0' | 'run1' | 'run2' | 'run3' | 'jump' | 'hurt' | 'front';

export const RUN_POSES: readonly Pose[] = ['run0', 'run1', 'run2', 'run3'];
export const ALL_POSES: readonly Pose[] = [...RUN_POSES, 'jump', 'hurt', 'front'];

export const FRAME_W = 96;
export const FRAME_H = 128;
export const RES = 2;

const INK = '#0b1530';
const CX = 48;
const GROUND = 122;

interface Gait {
  /** Leg lift 0 (planted) .. 1 (kicked up), left then right. */
  lift: readonly [number, number];
  /** Arm swing -1 .. 1, left then right. */
  swing: readonly [number, number];
  armsUp?: boolean;
  tilt?: number;
}

const GAITS: Record<Exclude<Pose, 'front'>, Gait> = {
  run0: { lift: [1, 0], swing: [-1, 1] },
  run1: { lift: [0.45, 0.15], swing: [-0.3, 0.3] },
  run2: { lift: [0, 1], swing: [1, -1] },
  run3: { lift: [0.15, 0.45], swing: [0.3, -0.3] },
  jump: { lift: [0.9, 0.7], swing: [0, 0], armsUp: true },
  hurt: { lift: [0.3, 0.7], swing: [0, 0], armsUp: true, tilt: -9 },
};

const n = (v: number): string => v.toFixed(1);

function shoe(x: number, y: number, color: string): string {
  return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="8.5" ry="5" fill="${color}" stroke="${INK}" stroke-width="1.4"/>`;
}

function backProp(def: CharacterDef, handY: number): string {
  const p = def.palette;
  if (def.id === 'student') {
    return (
      `<line x1="70" y1="${n(handY)}" x2="72" y2="28" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/>` +
      `<rect x="60" y="8" width="26" height="20" rx="3" fill="#fff4dc" stroke="${INK}" stroke-width="1.8"/>` +
      `<polygon points="73,11 75,17 81,17 76,21 78,26 73,23 68,26 70,21 65,17 71,17" fill="${p.top}"/>`
    );
  }
  if (def.id === 'artist') {
    return (
      `<line x1="26" y1="${n(handY)}" x2="19" y2="52" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="18" cy="48" r="4.5" fill="#d64545" stroke="${INK}" stroke-width="1.2"/>`
    );
  }
  return (
    `<line x1="70" y1="${n(handY)}" x2="75" y2="62" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="77" cy="53" r="9" fill="rgba(127,232,226,0.5)" stroke="#fff4dc" stroke-width="3"/>`
  );
}

function backFigure(def: CharacterDef, pose: Exclude<Pose, 'front'>): string {
  const p = def.palette;
  const g = GAITS[pose];
  const out: string[] = [];

  // Legs (left, right)
  for (const [i, sx] of [CX - 8, CX + 8].entries()) {
    const lift = g.lift[i];
    const footY = GROUND - lift * 13;
    out.push(
      `<rect x="${n(sx - 6)}" y="78" width="12" height="${n(footY - 78)}" rx="5" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
      shoe(sx, footY, p.shoe),
    );
  }

  // Backpack sits behind the arms but over the torso
  out.push(
    `<rect x="32" y="46" width="32" height="38" rx="10" fill="${p.top}" stroke="${INK}" stroke-width="1.6"/>`,
    `<rect x="32" y="70" width="32" height="14" rx="7" fill="${p.topShade}"/>`,
  );
  if (def.id === 'student') {
    out.push(
      `<rect x="35" y="49" width="26" height="26" rx="7" fill="${p.accent}" stroke="#000" stroke-width="1" opacity="0.95"/>`,
      `<rect x="40" y="62" width="16" height="9" rx="3" fill="#2a4a8f"/>`,
      `<line x1="48" y1="50" x2="48" y2="58" stroke="${p.shoe}" stroke-width="2"/>`,
    );
  } else if (def.id === 'artist') {
    out.push(
      `<rect x="34" y="64" width="28" height="20" rx="6" fill="${p.bottom}" stroke="${INK}" stroke-width="1.2"/>`,
      `<line x1="38" y1="48" x2="42" y2="66" stroke="${p.bottom}" stroke-width="4"/>`,
      `<line x1="58" y1="48" x2="54" y2="66" stroke="${p.bottom}" stroke-width="4"/>`,
      `<circle cx="40" cy="58" r="3.4" fill="#ffd23f"/><circle cx="55" cy="72" r="3" fill="#d64545"/><circle cx="46" cy="76" r="2.4" fill="#ff9933"/>`,
    );
  } else {
    out.push(
      `<path d="M38 47 Q48 60 58 47" fill="none" stroke="${p.accent}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<rect x="55" y="72" width="8" height="10" rx="1.5" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
    );
  }

  // Arms
  let handY = 80;
  for (const [i, sx] of [CX - 19, CX + 19].entries()) {
    const dir = i === 0 ? -1 : 1;
    const endY = g.armsUp ? 34 : 80 - g.swing[i] * 8;
    const endX = sx + dir * (g.armsUp ? 9 : 5);
    if (i === 1 && !g.armsUp) handY = endY;
    out.push(
      `<line x1="${n(sx)}" y1="55" x2="${n(endX)}" y2="${n(endY)}" stroke="${p.top}" stroke-width="10" stroke-linecap="round"/>`,
      `<circle cx="${n(endX)}" cy="${n(endY)}" r="5.2" fill="${p.skin}" stroke="${INK}" stroke-width="1.2"/>`,
    );
  }

  // Head from behind
  out.push(`<rect x="43" y="40" width="10" height="9" fill="${p.skin}"/>`);
  if (def.id === 'artist') {
    out.push(`<path d="M44 40 Q38 58 46 66 Q50 56 52 42Z" fill="${p.hair}" stroke="${INK}" stroke-width="1"/>`);
  }
  out.push(
    `<circle cx="${CX - 15}" cy="32" r="4" fill="${p.skin}" stroke="${INK}" stroke-width="1"/>`,
    `<circle cx="${CX + 15}" cy="32" r="4" fill="${p.skin}" stroke="${INK}" stroke-width="1"/>`,
    `<circle cx="${CX}" cy="29" r="16" fill="${p.hair}" stroke="${INK}" stroke-width="1.6"/>`,
    `<path d="M38 20 Q48 14 58 21" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round"/>`,
  );
  if (def.id === 'artist') {
    out.push(
      `<ellipse cx="46" cy="15" rx="19" ry="7.5" fill="${p.accent}" stroke="${INK}" stroke-width="1.4"/>`,
      `<circle cx="46" cy="8" r="2.8" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
    );
  } else if (def.id === 'checker') {
    out.push(
      `<circle cx="${CX}" cy="11" r="7.5" fill="${p.hair}" stroke="${INK}" stroke-width="1.4"/>`,
      `<path d="M33 30 L28 28 M63 30 L68 28" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
    );
  } else {
    out.push(`<path d="M33 28 Q48 38 63 28" fill="none" stroke="${p.top}" stroke-width="4" stroke-linecap="round"/>`);
  }

  out.push(backProp(def, handY));
  const tilt = g.tilt ?? 0;
  return tilt ? `<g transform="rotate(${tilt} ${CX} 100)">${out.join('')}</g>` : out.join('');
}

function frontFigure(def: CharacterDef): string {
  const p = def.palette;
  const out: string[] = [];

  // Legs and shoes
  out.push(
    `<rect x="35" y="82" width="12" height="34" rx="5" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
    `<rect x="49" y="82" width="12" height="34" rx="5" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
    shoe(41, 119, p.shoe),
    shoe(55, 119, p.shoe),
  );

  // Torso
  out.push(
    `<rect x="31" y="44" width="34" height="42" rx="11" fill="${p.top}" stroke="${INK}" stroke-width="1.6"/>`,
    `<rect x="31" y="72" width="34" height="14" rx="7" fill="${p.topShade}"/>`,
  );
  if (def.id === 'student') {
    out.push(
      `<line x1="39" y1="46" x2="39" y2="82" stroke="${p.accent}" stroke-width="3.5"/>`,
      `<line x1="57" y1="46" x2="57" y2="82" stroke="${p.accent}" stroke-width="3.5"/>`,
    );
  } else if (def.id === 'artist') {
    out.push(
      `<rect x="36" y="62" width="24" height="24" rx="6" fill="${p.bottom}" stroke="${INK}" stroke-width="1.2"/>`,
      `<line x1="39" y1="46" x2="40" y2="62" stroke="${p.bottom}" stroke-width="4"/>`,
      `<line x1="57" y1="46" x2="56" y2="62" stroke="${p.bottom}" stroke-width="4"/>`,
      `<circle cx="44" cy="72" r="3" fill="#ffd23f"/><circle cx="53" cy="78" r="2.6" fill="#d64545"/>`,
    );
  } else {
    out.push(
      `<path d="M42 46 L48 70 L54 46" fill="none" stroke="${p.accent}" stroke-width="2.2" stroke-linejoin="round"/>`,
      `<rect x="44" y="68" width="9" height="12" rx="1.5" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
    );
  }

  // Arms (outer sleeves + hands)
  out.push(
    `<line x1="30" y1="52" x2="25" y2="80" stroke="${p.top}" stroke-width="10" stroke-linecap="round"/>`,
    `<circle cx="25" cy="82" r="5.2" fill="${p.skin}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="66" y1="52" x2="71" y2="80" stroke="${p.top}" stroke-width="10" stroke-linecap="round"/>`,
    `<circle cx="71" cy="82" r="5.2" fill="${p.skin}" stroke="${INK}" stroke-width="1.2"/>`,
  );

  // Head
  out.push(
    `<rect x="43" y="38" width="10" height="10" fill="${p.skin}"/>`,
    `<circle cx="${CX}" cy="28" r="16" fill="${p.skin}" stroke="${INK}" stroke-width="1.6"/>`,
    `<path d="M32 26 A16 16 0 0 1 64 26 Q56 17 48 18 Q40 17 32 26Z" fill="${p.hair}"/>`,
    `<circle cx="42" cy="29" r="2.2" fill="${INK}"/><circle cx="54" cy="29" r="2.2" fill="${INK}"/>`,
    `<path d="M42 36 Q48 41 54 36" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
  );
  if (def.id === 'artist') {
    out.push(
      `<ellipse cx="46" cy="13" rx="19" ry="7.5" fill="${p.accent}" stroke="${INK}" stroke-width="1.4"/>`,
      `<circle cx="46" cy="6" r="2.8" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
      `<line x1="25" y1="82" x2="19" y2="60" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="18" cy="56" r="4.5" fill="#d64545" stroke="${INK}" stroke-width="1.2"/>`,
    );
  } else if (def.id === 'checker') {
    out.push(
      `<circle cx="42" cy="29" r="6" fill="rgba(255,255,255,0.35)" stroke="${INK}" stroke-width="1.8"/>`,
      `<circle cx="54" cy="29" r="6" fill="rgba(255,255,255,0.35)" stroke="${INK}" stroke-width="1.8"/>`,
      `<line x1="48" y1="29" x2="48" y2="29" stroke="${INK}" stroke-width="2"/>`,
      `<line x1="71" y1="82" x2="75" y2="68" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="77" cy="60" r="9" fill="rgba(127,232,226,0.5)" stroke="#fff4dc" stroke-width="3"/>`,
    );
  } else {
    out.push(
      `<path d="M33 24 Q48 14 63 24" fill="none" stroke="${p.accent}" stroke-width="3.4" stroke-linecap="round"/>`,
      `<line x1="71" y1="82" x2="73" y2="32" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/>`,
      `<rect x="62" y="12" width="26" height="20" rx="3" fill="#fff4dc" stroke="${INK}" stroke-width="1.8"/>`,
      `<polygon points="75,15 77,21 83,21 78,25 80,30 75,27 70,30 72,25 67,21 73,21" fill="${p.top}"/>`,
    );
  }
  return out.join('');
}

export function characterSvg(def: CharacterDef, pose: Pose): string {
  const body = pose === 'front' ? frontFigure(def) : backFigure(def, pose);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FRAME_W * RES}" height="${FRAME_H * RES}" viewBox="0 0 ${FRAME_W} ${FRAME_H}">${body}</svg>`;
}

export function characterDataUri(def: CharacterDef, pose: Pose): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(characterSvg(def, pose))}`;
}

export function textureKey(def: CharacterDef, pose: Pose): string {
  return `char-${def.id}-${pose}`;
}
