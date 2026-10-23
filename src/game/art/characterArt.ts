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
  switch (def.id) {
    case 'neha':
      return (
        `<polygon points="70,${n(handY - 2)} 84,${n(handY - 10)} 84,${n(handY + 6)}" fill="#f8fafc" stroke="${INK}" stroke-width="1.4"/>` +
        `<rect x="66" y="${n(handY - 4)}" width="6" height="8" rx="1.5" fill="${p.accent}" stroke="${INK}" stroke-width="1.2"/>`
      );
    case 'abhijit':
      return (
        `<rect x="14" y="${n(handY - 6)}" width="14" height="18" rx="2" fill="#ffffff" stroke="${INK}" stroke-width="1.2"/>` +
        `<line x1="17" y1="${n(handY - 2)}" x2="25" y2="${n(handY - 2)}" stroke="#3b82f6" stroke-width="1.2"/>` +
        `<line x1="17" y1="${n(handY + 2)}" x2="25" y2="${n(handY + 2)}" stroke="#94a3b8" stroke-width="1"/>`
      );
    case 'nsui':
      return (
        `<line x1="72" y1="${n(handY + 12)}" x2="72" y2="8" stroke="#78350f" stroke-width="2.8" stroke-linecap="round"/>` +
        `<path d="M72 8 Q82 14 92 8 L92 32 Q82 38 72 32 Z" fill="#2563eb" stroke="${INK}" stroke-width="1.2"/>` +
        `<path d="M72 16 Q82 22 92 16 L92 24 Q82 30 72 24 Z" fill="#ffffff"/>`
      );
    case 'genz':
      return (
        `<line x1="68" y1="${n(handY)}" x2="78" y2="28" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>` +
        `<rect x="72" y="14" width="14" height="18" rx="2.5" fill="#0f172a" stroke="#fff" stroke-width="1"/>` +
        `<circle cx="79" cy="23" r="3" fill="#475569" stroke="#fff" stroke-width="0.8"/>`
      );
    case 'ex_minister':
      return (
        `<line x1="68" y1="${n(handY)}" x2="74" y2="${n(handY - 14)}" stroke="#334155" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="75" cy="${n(handY - 16)}" r="5" fill="#475569" stroke="${INK}" stroke-width="1.2"/>`
      );
    case 'wheelchair':
      return (
        `<line x1="68" y1="${n(handY)}" x2="74" y2="${n(handY - 12)}" stroke="${p.skin}" stroke-width="3" stroke-linecap="round"/>` +
        `<line x1="74" y1="${n(handY - 12)}" x2="72" y2="${n(handY - 20)}" stroke="${p.skin}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<line x1="74" y1="${n(handY - 12)}" x2="78" y2="${n(handY - 19)}" stroke="${p.skin}" stroke-width="2.5" stroke-linecap="round"/>`
      );
    case 'student':
      return (
        `<line x1="70" y1="${n(handY)}" x2="72" y2="28" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/>` +
        `<rect x="60" y="8" width="26" height="20" rx="3" fill="#fff4dc" stroke="${INK}" stroke-width="1.8"/>` +
        `<polygon points="73,11 75,17 81,17 76,21 78,26 73,23 68,26 70,21 65,17 71,17" fill="${p.top}"/>`
      );
    case 'artist':
      return (
        `<line x1="26" y1="${n(handY)}" x2="19" y2="52" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="18" cy="48" r="4.5" fill="#d64545" stroke="${INK}" stroke-width="1.2"/>`
      );
    case 'checker':
      return (
        `<line x1="70" y1="${n(handY)}" x2="75" y2="62" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="77" cy="53" r="9" fill="rgba(127,232,226,0.5)" stroke="#fff4dc" stroke-width="3"/>`
      );
    case 'climber':
      return (
        `<circle cx="73" cy="${n(handY - 8)}" r="10" fill="none" stroke="#e8b04a" stroke-width="3.6"/>` +
        `<circle cx="73" cy="${n(handY - 8)}" r="5.2" fill="none" stroke="#e8b04a" stroke-width="3"/>` +
        `<circle cx="73" cy="${n(handY - 8)}" r="10" fill="none" stroke="${INK}" stroke-width="0.8" opacity="0.5"/>`
      );
    default:
      return '';
  }
}

function backFigure(def: CharacterDef, pose: Exclude<Pose, 'front'>): string {
  const p = def.palette;
  const g = GAITS[pose];
  const out: string[] = [];
  const isChhota = def.id === 'chhota';
  const isWheelchair = def.id === 'wheelchair';

  if (isWheelchair) {
    const bounce = pose === 'run0' || pose === 'run2' ? 2 : 0;
    out.push(
      `<ellipse cx="22" cy="${100 - bounce}" rx="6" ry="22" fill="#334155" stroke="${INK}" stroke-width="1.8"/>`,
      `<ellipse cx="74" cy="${100 - bounce}" rx="6" ry="22" fill="#334155" stroke="${INK}" stroke-width="1.8"/>`,
      `<rect x="28" y="${74 - bounce}" width="40" height="30" rx="4" fill="#0f172a" stroke="${INK}" stroke-width="1.6"/>`,
      `<line x1="28" y1="${68 - bounce}" x2="28" y2="${76 - bounce}" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>`,
      `<line x1="68" y1="${68 - bounce}" x2="68" y2="${76 - bounce}" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="28" cy="${66 - bounce}" r="3" fill="#1e293b"/>`,
      `<circle cx="68" cy="${66 - bounce}" r="3" fill="#1e293b"/>`,
    );
  } else {
    const legTop = isChhota ? 86 : 78;
    const legWidth = isChhota ? 10 : 12;
    for (const [i, sx] of [CX - 8, CX + 8].entries()) {
      const lift = g.lift[i];
      const footY = (isChhota ? GROUND - 2 : GROUND) - lift * (isChhota ? 10 : 13);
      out.push(
        `<rect x="${n(sx - legWidth / 2)}" y="${legTop}" width="${legWidth}" height="${n(footY - legTop)}" rx="5" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
        shoe(sx, footY, p.shoe),
      );
    }
  }

  const torsoY = isChhota ? 52 : 46;
  const torsoH = isChhota ? 36 : 38;
  const torsoW = isChhota ? 30 : 32;
  const torsoX = CX - torsoW / 2;

  out.push(
    `<rect x="${torsoX}" y="${torsoY}" width="${torsoW}" height="${torsoH}" rx="10" fill="${p.top}" stroke="${INK}" stroke-width="1.6"/>`,
    `<rect x="${torsoX}" y="${torsoY + torsoH - 14}" width="${torsoW}" height="14" rx="7" fill="${p.topShade}"/>`,
  );

  if (def.id === 'neha') {
    out.push(
      `<path d="M34 50 Q48 64 62 76" fill="none" stroke="${p.accent}" stroke-width="6" stroke-linecap="round"/>`,
      `<path d="M34 50 Q48 64 62 76" fill="none" stroke="#ffd700" stroke-width="1.2" stroke-linecap="round"/>`,
    );
  } else if (def.id === 'abhijit') {
    out.push(
      `<rect x="35" y="49" width="26" height="26" rx="7" fill="#1e3a8a" stroke="${INK}" stroke-width="1.2"/>`,
      `<rect x="38" y="62" width="20" height="10" rx="3" fill="#2563eb"/>`,
      `<line x1="48" y1="50" x2="48" y2="60" stroke="#93c5fd" stroke-width="2"/>`,
      `<rect x="42" y="46" width="12" height="6" rx="1" fill="#ffffff" stroke="${INK}" stroke-width="0.8"/>`,
    );
  } else if (def.id === 'nsui') {
    out.push(
      `<line x1="36" y1="48" x2="60" y2="80" stroke="${p.accent}" stroke-width="6" stroke-linecap="round"/>`,
    );
  } else if (def.id === 'genz') {
    out.push(
      `<ellipse cx="48" cy="52" rx="12" ry="7" fill="${p.topShade}" stroke="${INK}" stroke-width="1.2"/>`,
      `<path d="M42 56 Q48 64 54 56" fill="none" stroke="#fff" stroke-width="1.5"/>`,
    );
  } else if (def.id === 'ex_minister') {
    out.push(
      `<circle cx="40" cy="46" r="3.5" fill="#f59e0b"/>`,
      `<circle cx="48" cy="48" r="3.5" fill="#eab308"/>`,
      `<circle cx="56" cy="46" r="3.5" fill="#f59e0b"/>`,
    );
  } else if (def.id === 'student') {
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
  } else if (def.id === 'checker') {
    out.push(
      `<path d="M38 47 Q48 60 58 47" fill="none" stroke="${p.accent}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<rect x="55" y="72" width="8" height="10" rx="1.5" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
    );
  } else if (def.id === 'climber') {
    out.push(
      `<path d="M36 48 L60 80" stroke="#e8b04a" stroke-width="3.4" stroke-linecap="round"/>`,
      `<rect x="40" y="76" width="16" height="11" rx="5" fill="${p.accent}" stroke="${INK}" stroke-width="1.2"/>`,
      `<line x1="43" y1="79" x2="53" y2="79" stroke="${INK}" stroke-width="1"/>`,
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
      `<line x1="${n(sx)}" y1="${isChhota ? 58 : 55}" x2="${n(endX)}" y2="${n(endY)}" stroke="${p.top}" stroke-width="10" stroke-linecap="round"/>`,
      `<circle cx="${n(endX)}" cy="${n(endY)}" r="5.2" fill="${p.skin}" stroke="${INK}" stroke-width="1.2"/>`,
    );
  }

  // Head from behind
  const headY = isChhota ? 34 : 29;
  const headR = isChhota ? 17 : 16;
  out.push(
    `<rect x="43" y="${isChhota ? 43 : 40}" width="10" height="9" fill="${p.skin}"/>`,
    `<circle cx="${CX - 15}" cy="${headY + 3}" r="4" fill="${p.skin}" stroke="${INK}" stroke-width="1"/>`,
    `<circle cx="${CX + 15}" cy="${headY + 3}" r="4" fill="${p.skin}" stroke="${INK}" stroke-width="1"/>`,
    `<circle cx="${CX}" cy="${headY}" r="${headR}" fill="${p.hair}" stroke="${INK}" stroke-width="1.6"/>`,
  );

  // Hair & hats from behind
  if (def.id === 'neha') {
    out.push(
      `<line x1="48" y1="36" x2="48" y2="72" stroke="#1d1410" stroke-width="5.5" stroke-linecap="round"/>`,
      `<circle cx="48" cy="73" r="3" fill="#c53030"/>`,
    );
  } else if (def.id === 'abhijit') {
    out.push(
      `<circle cx="36" cy="24" r="8" fill="#1b120c"/>`,
      `<circle cx="60" cy="24" r="8" fill="#1b120c"/>`,
      `<circle cx="48" cy="14" r="8" fill="#1b120c"/>`,
    );
  } else if (def.id === 'genz') {
    out.push(
      `<ellipse cx="48" cy="22" rx="19" ry="7" fill="#f472b6" stroke="${INK}" stroke-width="1.4"/>`,
      `<path d="M34 22 L37 13 L59 13 L62 22 Z" fill="#f472b6" stroke="${INK}" stroke-width="1.4"/>`,
    );
  } else if (def.id === 'ex_minister') {
    out.push(
      `<circle cx="${CX}" cy="27" r="14" fill="${p.skin}"/>`,
      `<path d="M33 32 Q32 20 48 18 Q64 20 63 32 Q56 22 48 22 Q40 22 33 32Z" fill="#e2e8f0"/>`,
    );
  } else if (def.id === 'artist') {
    out.push(
      `<path d="M44 40 Q38 58 46 66 Q50 56 52 42Z" fill="${p.hair}" stroke="${INK}" stroke-width="1"/>`,
      `<ellipse cx="46" cy="15" rx="19" ry="7.5" fill="${p.accent}" stroke="${INK}" stroke-width="1.4"/>`,
      `<circle cx="46" cy="8" r="2.8" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
    );
  } else if (def.id === 'checker') {
    out.push(
      `<circle cx="${CX}" cy="11" r="7.5" fill="${p.hair}" stroke="${INK}" stroke-width="1.4"/>`,
      `<path d="M33 30 L28 28 M63 30 L68 28" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
    );
  } else if (def.id === 'climber') {
    out.push(
      `<path d="M31 27 Q31 8 48 8 Q65 8 65 27 Z" fill="${p.accent}" stroke="${INK}" stroke-width="1.5"/>`,
      `<rect x="30" y="23" width="36" height="7" rx="3" fill="#e0b21c" stroke="${INK}" stroke-width="1.2"/>`,
      `<circle cx="48" cy="7" r="3" fill="${p.top}" stroke="${INK}" stroke-width="1"/>`,
    );
  } else if (def.id === 'student') {
    out.push(`<path d="M33 28 Q48 38 63 28" fill="none" stroke="${p.top}" stroke-width="4" stroke-linecap="round"/>`);
  }

  out.push(backProp(def, handY));
  const tilt = g.tilt ?? 0;
  return tilt ? `<g transform="rotate(${tilt} ${CX} 100)">${out.join('')}</g>` : out.join('');
}

function frontFigure(def: CharacterDef): string {
  const p = def.palette;
  const out: string[] = [];
  const isChhota = def.id === 'chhota';
  const isWheelchair = def.id === 'wheelchair';

  if (isWheelchair) {
    out.push(
      `<ellipse cx="23" cy="96" rx="7.5" ry="24" fill="#334155" stroke="${INK}" stroke-width="1.8"/>`,
      `<ellipse cx="73" cy="96" rx="7.5" ry="24" fill="#334155" stroke="${INK}" stroke-width="1.8"/>`,
      `<ellipse cx="21" cy="96" rx="5" ry="20" fill="none" stroke="#94a3b8" stroke-width="1.4"/>`,
      `<ellipse cx="75" cy="96" rx="5" ry="20" fill="none" stroke="#94a3b8" stroke-width="1.4"/>`,
      `<rect x="30" y="90" width="36" height="24" rx="4" fill="#0284c7" stroke="${INK}" stroke-width="1.5"/>`,
      `<rect x="34" y="110" width="28" height="5" rx="2" fill="#0f172a" stroke="${INK}" stroke-width="1.2"/>`,
      `<rect x="34" y="80" width="12" height="30" rx="4" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
      `<rect x="50" y="80" width="12" height="30" rx="4" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
      shoe(40, 114, p.shoe),
      shoe(56, 114, p.shoe),
    );
  } else {
    const legTop = isChhota ? 86 : 82;
    const legH = isChhota ? 28 : 34;
    const legW = isChhota ? 10 : 12;
    const footY = isChhota ? 116 : 119;
    out.push(
      `<rect x="${CX - 13}" y="${legTop}" width="${legW}" height="${legH}" rx="5" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
      `<rect x="${CX + 1}" y="${legTop}" width="${legW}" height="${legH}" rx="5" fill="${p.bottom}" stroke="${INK}" stroke-width="1.4"/>`,
      shoe(CX - 7, footY, p.shoe),
      shoe(CX + 7, footY, p.shoe),
    );
  }

  const torsoY = isChhota ? 48 : 44;
  const torsoW = isChhota ? 32 : 34;
  const torsoH = isChhota ? 40 : 42;
  const torsoX = CX - torsoW / 2;

  out.push(
    `<rect x="${torsoX}" y="${torsoY}" width="${torsoW}" height="${torsoH}" rx="11" fill="${p.top}" stroke="${INK}" stroke-width="1.6"/>`,
    `<rect x="${torsoX}" y="${torsoY + torsoH - 14}" width="${torsoW}" height="14" rx="7" fill="${p.topShade}"/>`,
  );

  if (def.id === 'neha') {
    out.push(
      `<polygon points="48,84 46,72 50,72" fill="${p.bottom}"/>`,
      `<path d="M33 46 Q48 64 64 82" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/>`,
      `<path d="M33 46 Q48 64 64 82" fill="none" stroke="#ffd700" stroke-width="1.4" stroke-linecap="round"/>`,
    );
  } else if (def.id === 'abhijit') {
    out.push(
      `<line x1="39" y1="46" x2="39" y2="82" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>`,
      `<line x1="57" y1="46" x2="57" y2="82" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>`,
      `<line x1="33" y1="58" x2="63" y2="58" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>`,
      `<line x1="33" y1="70" x2="63" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>`,
      `<path d="M44 44 L48 54 L52 44" fill="none" stroke="${INK}" stroke-width="1.5"/>`,
    );
  } else if (def.id === 'nsui') {
    out.push(
      `<line x1="34" y1="48" x2="62" y2="82" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/>`,
      `<circle cx="48" cy="52" r="1.5" fill="${INK}"/><circle cx="48" cy="62" r="1.5" fill="${INK}"/>`,
    );
  } else if (def.id === 'genz') {
    out.push(
      `<rect x="36" y="66" width="24" height="14" rx="4" fill="${p.topShade}" stroke="${INK}" stroke-width="1.2"/>`,
      `<line x1="44" y1="46" x2="44" y2="58" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`,
      `<line x1="52" y1="46" x2="52" y2="58" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`,
    );
  } else if (def.id === 'ex_minister') {
    out.push(
      `<circle cx="36" cy="48" r="3.4" fill="#f59e0b"/>`,
      `<circle cx="40" cy="54" r="3.4" fill="#eab308"/>`,
      `<circle cx="44" cy="60" r="3.6" fill="#f97316"/>`,
      `<circle cx="48" cy="64" r="4.0" fill="#f59e0b"/>`,
      `<circle cx="52" cy="60" r="3.6" fill="#f97316"/>`,
      `<circle cx="56" cy="54" r="3.4" fill="#eab308"/>`,
      `<circle cx="60" cy="48" r="3.4" fill="#f59e0b"/>`,
    );
  } else if (def.id === 'student') {
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
  } else if (def.id === 'climber') {
    out.push(
      `<path d="M36 47 L62 82" stroke="#e8b04a" stroke-width="3.6" stroke-linecap="round"/>`,
      `<rect x="38" y="72" width="16" height="12" rx="5" fill="${p.accent}" stroke="${INK}" stroke-width="1.2"/>`,
    );
  } else {
    out.push(
      `<path d="M42 46 L48 70 L54 46" fill="none" stroke="${p.accent}" stroke-width="2.2" stroke-linejoin="round"/>`,
      `<rect x="44" y="68" width="9" height="12" rx="1.5" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
    );
  }

  // Arms and props in front view
  if (def.id === 'wheelchair') {
    out.push(
      `<line x1="30" y1="52" x2="23" y2="80" stroke="${p.top}" stroke-width="9" stroke-linecap="round"/>`,
      `<circle cx="23" cy="82" r="5" fill="${p.skin}" stroke="${INK}" stroke-width="1.2"/>`,
      `<line x1="64" y1="52" x2="74" y2="44" stroke="${p.top}" stroke-width="9" stroke-linecap="round"/>`,
      `<line x1="74" y1="44" x2="80" y2="34" stroke="${p.skin}" stroke-width="6" stroke-linecap="round"/>`,
      `<line x1="80" y1="34" x2="78" y2="22" stroke="${p.skin}" stroke-width="3" stroke-linecap="round"/>`,
      `<line x1="80" y1="34" x2="84" y2="23" stroke="${p.skin}" stroke-width="3" stroke-linecap="round"/>`,
    );
  } else {
    out.push(
      `<line x1="30" y1="52" x2="25" y2="80" stroke="${p.top}" stroke-width="10" stroke-linecap="round"/>`,
      `<circle cx="25" cy="82" r="5.2" fill="${p.skin}" stroke="${INK}" stroke-width="1.2"/>`,
      `<line x1="66" y1="52" x2="71" y2="80" stroke="${p.top}" stroke-width="10" stroke-linecap="round"/>`,
      `<circle cx="71" cy="82" r="5.2" fill="${p.skin}" stroke="${INK}" stroke-width="1.2"/>`,
    );
  }

  // Head
  const headY = isChhota ? 32 : 28;
  const headR = isChhota ? 17 : 16;
  out.push(
    `<rect x="43" y="${isChhota ? 40 : 38}" width="10" height="10" fill="${p.skin}"/>`,
    `<circle cx="${CX}" cy="${headY}" r="${headR}" fill="${p.skin}" stroke="${INK}" stroke-width="1.6"/>`,
  );

  // Hair & face features
  if (def.id === 'neha') {
    out.push(
      `<path d="M32 26 A16 16 0 0 1 64 26 Q56 16 48 17 Q40 16 32 26Z" fill="${p.hair}"/>`,
      `<circle cx="48" cy="23" r="1.3" fill="#c53030"/>`,
      `<circle cx="42" cy="28" r="2.2" fill="${INK}"/><circle cx="54" cy="28" r="2.2" fill="${INK}"/>`,
      `<ellipse cx="48" cy="35" rx="3.5" ry="4.5" fill="#501212" stroke="${INK}" stroke-width="1"/>`,
      `<rect x="46" y="32" width="4" height="2" fill="#fff"/>`,
      `<path d="M58 26 Q65 42 61 62 Q59 70 61 78" fill="none" stroke="${p.hair}" stroke-width="5" stroke-linecap="round"/>`,
      `<circle cx="61" cy="78" r="3" fill="#c53030"/>`,
      `<polygon points="20,74 10,68 10,84" fill="#f8fafc" stroke="${INK}" stroke-width="1.4"/>`,
      `<rect x="18" y="73" width="7" height="6" rx="1.5" fill="${p.accent}" stroke="${INK}" stroke-width="1.2"/>`,
    );
  } else if (def.id === 'abhijit') {
    out.push(
      `<circle cx="48" cy="20" r="16" fill="${p.hair}"/>`,
      `<circle cx="35" cy="23" r="8" fill="${p.hair}"/>`,
      `<circle cx="61" cy="23" r="8" fill="${p.hair}"/>`,
      `<circle cx="42" cy="14" r="7" fill="${p.hair}"/>`,
      `<circle cx="54" cy="14" r="7" fill="${p.hair}"/>`,
      `<circle cx="42" cy="28" r="5.2" fill="rgba(255,255,255,0.4)" stroke="${INK}" stroke-width="1.8"/>`,
      `<circle cx="54" cy="28" r="5.2" fill="rgba(255,255,255,0.4)" stroke="${INK}" stroke-width="1.8"/>`,
      `<line x1="47.2" y1="28" x2="48.8" y2="28" stroke="${INK}" stroke-width="2"/>`,
      `<circle cx="42" cy="28" r="1.8" fill="${INK}"/><circle cx="54" cy="28" r="1.8" fill="${INK}"/>`,
      `<path d="M44 36 Q48 39 52 36" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<rect x="64" y="66" width="16" height="20" rx="2" fill="#ffffff" stroke="${INK}" stroke-width="1.2"/>`,
      `<line x1="67" y1="71" x2="76" y2="71" stroke="#3b82f6" stroke-width="1.5"/>`,
      `<line x1="67" y1="75" x2="76" y2="75" stroke="#94a3b8" stroke-width="1"/>`,
      `<line x1="67" y1="79" x2="73" y2="79" stroke="#94a3b8" stroke-width="1"/>`,
    );
  } else if (def.id === 'nsui') {
    out.push(
      `<path d="M32 26 A16 16 0 0 1 64 26 Q58 18 48 18 Q38 18 32 26Z" fill="${p.hair}"/>`,
      `<circle cx="42" cy="29" r="2.2" fill="${INK}"/><circle cx="54" cy="29" r="2.2" fill="${INK}"/>`,
      `<path d="M43 36 Q48 40 53 36" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<line x1="72" y1="92" x2="72" y2="8" stroke="#78350f" stroke-width="2.8" stroke-linecap="round"/>`,
      `<path d="M72 8 Q82 14 92 8 L92 32 Q82 38 72 32 Z" fill="#2563eb" stroke="${INK}" stroke-width="1.2"/>`,
      `<path d="M72 16 Q82 22 92 16 L92 24 Q82 30 72 24 Z" fill="#ffffff"/>`,
    );
  } else if (def.id === 'genz') {
    out.push(
      `<path d="M34 26 Q42 32 46 26 Q50 32 58 26 Q52 18 42 19 Z" fill="${p.hair}"/>`,
      `<ellipse cx="48" cy="20" rx="19" ry="6.5" fill="#f472b6" stroke="${INK}" stroke-width="1.4"/>`,
      `<path d="M35 20 L38 11 L58 11 L61 20 Z" fill="#f472b6" stroke="${INK}" stroke-width="1.4"/>`,
      `<path d="M36 41 Q48 47 60 41" fill="none" stroke="#334155" stroke-width="4.5" stroke-linecap="round"/>`,
      `<circle cx="34" cy="40" r="4.5" fill="#1e293b"/><circle cx="62" cy="40" r="4.5" fill="#1e293b"/>`,
      `<rect x="37" y="26" width="9" height="5.5" rx="1.5" fill="#1e1b4b"/>`,
      `<rect x="50" y="26" width="9" height="5.5" rx="1.5" fill="#1e1b4b"/>`,
      `<line x1="46" y1="28" x2="50" y2="28" stroke="#1e1b4b" stroke-width="1"/>`,
      `<path d="M44 36 Q48 39 52 36" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<line x1="68" y1="80" x2="80" y2="28" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>`,
      `<rect x="73" y="14" width="15" height="20" rx="3" fill="#0f172a" stroke="#fff" stroke-width="1.2"/>`,
      `<rect x="75" y="16" width="11" height="16" rx="1.5" fill="#1e293b"/>`,
      `<circle cx="78" cy="20" r="2" fill="#ef4444"/>`,
      `<rect x="81" y="19" width="3.5" height="2" rx="0.5" fill="#ffffff"/>`,
    );
  } else if (def.id === 'ex_minister') {
    out.push(
      `<path d="M32 28 Q31 19 48 18 Q65 19 64 28 Q57 23 48 23 Q39 23 32 28Z" fill="#e2e8f0"/>`,
      `<circle cx="42" cy="28" r="4.5" fill="none" stroke="${INK}" stroke-width="1.4"/>`,
      `<circle cx="54" cy="28" r="4.5" fill="none" stroke="${INK}" stroke-width="1.4"/>`,
      `<line x1="46.5" y1="28" x2="49.5" y2="28" stroke="${INK}" stroke-width="1.4"/>`,
      `<circle cx="42" cy="28" r="1.8" fill="${INK}"/><circle cx="54" cy="28" r="1.8" fill="${INK}"/>`,
      `<path d="M40 34 Q48 37 48 33 Q48 37 56 34 Q52 40 48 37 Q44 40 40 34Z" fill="#ffffff" stroke="${INK}" stroke-width="1"/>`,
      `<line x1="68" y1="80" x2="74" y2="68" stroke="#334155" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="75" cy="65" r="5" fill="#475569" stroke="${INK}" stroke-width="1.2"/>`,
    );
  } else if (def.id === 'wheelchair') {
    out.push(
      `<path d="M34 25 L38 18 L43 23 L48 16 L53 23 L58 18 L62 25 Z" fill="${p.hair}"/>`,
      `<circle cx="42" cy="28" r="2.2" fill="${INK}"/><circle cx="54" cy="28" r="2.2" fill="${INK}"/>`,
      `<path d="M42 35 Q48 41 54 35" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M38 34 Q48 44 58 34" fill="none" stroke="#714529" stroke-width="1.5" stroke-dasharray="2,2"/>`,
    );
  } else if (def.id === 'chhota') {
    out.push(
      `<path d="M30 29 Q36 15 48 16 Q60 15 66 29 Q58 20 48 22 Q38 20 30 29Z" fill="${p.hair}"/>`,
      `<path d="M38 20 L40 14 L44 20 L48 13 L52 20 Z" fill="${p.hair}"/>`,
      `<circle cx="42" cy="30" r="2.5" fill="${INK}"/>`,
      `<path d="M52 30 Q55 28 58 30" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M42 36 Q48 43 54 36" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`,
    );
  } else if (def.id === 'artist') {
    out.push(
      `<path d="M32 26 A16 16 0 0 1 64 26 Q56 17 48 18 Q40 17 32 26Z" fill="${p.hair}"/>`,
      `<circle cx="42" cy="29" r="2.2" fill="${INK}"/><circle cx="54" cy="29" r="2.2" fill="${INK}"/>`,
      `<path d="M42 36 Q48 41 54 36" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<ellipse cx="46" cy="13" rx="19" ry="7.5" fill="${p.accent}" stroke="${INK}" stroke-width="1.4"/>`,
      `<circle cx="46" cy="6" r="2.8" fill="${p.accent}" stroke="${INK}" stroke-width="1"/>`,
      `<line x1="25" y1="82" x2="19" y2="60" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="18" cy="56" r="4.5" fill="#d64545" stroke="${INK}" stroke-width="1.2"/>`,
    );
  } else if (def.id === 'checker') {
    out.push(
      `<path d="M32 26 A16 16 0 0 1 64 26 Q56 17 48 18 Q40 17 32 26Z" fill="${p.hair}"/>`,
      `<circle cx="42" cy="29" r="2.2" fill="${INK}"/><circle cx="54" cy="29" r="2.2" fill="${INK}"/>`,
      `<path d="M42 36 Q48 41 54 36" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<circle cx="42" cy="29" r="6" fill="rgba(255,255,255,0.35)" stroke="${INK}" stroke-width="1.8"/>`,
      `<circle cx="54" cy="29" r="6" fill="rgba(255,255,255,0.35)" stroke="${INK}" stroke-width="1.8"/>`,
      `<line x1="48" y1="29" x2="48" y2="29" stroke="${INK}" stroke-width="2"/>`,
      `<line x1="71" y1="82" x2="75" y2="68" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="77" cy="60" r="9" fill="rgba(127,232,226,0.5)" stroke="#fff4dc" stroke-width="3"/>`,
    );
  } else if (def.id === 'climber') {
    out.push(
      `<path d="M31 25 Q31 5 48 5 Q65 5 65 25 Z" fill="${p.accent}" stroke="${INK}" stroke-width="1.5"/>`,
      `<rect x="30" y="21" width="36" height="7" rx="3" fill="#e0b21c" stroke="${INK}" stroke-width="1.2"/>`,
      `<circle cx="48" cy="4" r="3" fill="${p.top}" stroke="${INK}" stroke-width="1"/>`,
      `<circle cx="76" cy="66" r="10" fill="none" stroke="#e8b04a" stroke-width="3.6"/>`,
      `<circle cx="76" cy="66" r="5" fill="none" stroke="#e8b04a" stroke-width="3"/>`,
    );
  } else {
    out.push(
      `<path d="M32 26 A16 16 0 0 1 64 26 Q56 17 48 18 Q40 17 32 26Z" fill="${p.hair}"/>`,
      `<circle cx="42" cy="29" r="2.2" fill="${INK}"/><circle cx="54" cy="29" r="2.2" fill="${INK}"/>`,
      `<path d="M42 36 Q48 41 54 36" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
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
