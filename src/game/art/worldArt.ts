/**
 * Original, procedurally drawn SVG art shared by every scene: collectibles,
 * power-ups, effect particles and the distant skyline. All of it is generated
 * from code; no third-party images are used. Street-specific art (buildings,
 * obstacles, chasers) lives in roadArt.ts.
 */

export interface ArtAsset {
  key: string;
  svg: string;
  /** Raster size in pixels (already includes the resolution multiplier). */
  w: number;
  h: number;
}

export const RES = 2;

export const TEX = {
  token: 'co-token',
  megaphone: 'co-megaphone',
  placard: 'co-placard',
  fact: 'co-fact',
  shield: 'pu-shield',
  community: 'pu-community',
  energy: 'pu-energy',
  spark: 'fx-spark',
  check: 'fx-check',
  streak: 'fx-streak',
  shadow: 'fx-shadow',
  bubble: 'fx-bubble',
  sky: 'bg-sky',
  far: 'bg-far',
  fog: 'bg-fog',
} as const;

export const NAVY = '#0b1530';
export const CREAM = '#fff4dc';
export const SAFFRON = '#ff9933';
export const TEAL = '#17a5a0';
export const RED = '#d64545';

/** Builds an asset drawn on a w x h grid and rasterised at `res` times that size. */
export function makeAsset(key: string, w: number, h: number, inner: string, res = RES): ArtAsset {
  const pw = w * res;
  const ph = h * res;
  return {
    key,
    w: pw,
    h: ph,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}" viewBox="0 0 ${w} ${h}">${inner}</svg>`,
  };
}

/** Deterministic pseudo-random numbers so art is identical on every run. */
export function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// ------------------------------------------------------------- food collectibles (pizza, burger, biryani)

const token = makeAsset(
  TEX.token,
  40,
  40,
  // Golden crust
  `<path d="M5,10 Q20,4 35,10 Q37,13 35,16 Q20,10 5,16 Q3,13 5,10 Z" fill="#d9822b" stroke="${NAVY}" stroke-width="2"/>` +
    // Melty cheese slice pointing down
    `<polygon points="6,13 34,13 20,38" fill="#ffd034" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>` +
    // Rich red tomato sauce base
    `<path d="M7,14 Q20,9 33,14 L31,18 Q20,13 9,18 Z" fill="#d63031"/>` +
    // Pepperoni slices
    `<circle cx="16" cy="18" r="4" fill="#c0392b" stroke="#782018" stroke-width="1.2"/>` +
    `<circle cx="25" cy="22" r="3.6" fill="#c0392b" stroke="#782018" stroke-width="1.2"/>` +
    `<circle cx="19" cy="28" r="3.2" fill="#c0392b" stroke="#782018" stroke-width="1.2"/>` +
    // Basil herb flecks and cheese gloss
    `<circle cx="14" cy="23" r="1.5" fill="#ffffff" opacity="0.8"/>` +
    `<circle cx="22" cy="15" r="1.3" fill="#27ae60"/>` +
    `<circle cx="15" cy="31" r="1.2" fill="#27ae60"/>` +
    `<circle cx="26" cy="29" r="1.3" fill="#27ae60"/>`,
);

const megaphone = makeAsset(
  TEX.megaphone,
  44,
  40,
  // Top bun with curve
  `<path d="M7,17 Q7,4 22,4 Q37,4 37,17 Z" fill="#e59846" stroke="${NAVY}" stroke-width="2"/>` +
    // White sesame seeds
    `<ellipse cx="15" cy="9" rx="1.5" ry="0.8" fill="#fff5eb" transform="rotate(-15 15 9)"/>` +
    `<ellipse cx="22" cy="7" rx="1.5" ry="0.8" fill="#fff5eb"/>` +
    `<ellipse cx="29" cy="9" rx="1.5" ry="0.8" fill="#fff5eb" transform="rotate(15 29 9)"/>` +
    `<ellipse cx="18" cy="13" rx="1.5" ry="0.8" fill="#fff5eb" transform="rotate(5 18 13)"/>` +
    `<ellipse cx="26" cy="13" rx="1.5" ry="0.8" fill="#fff5eb" transform="rotate(-5 26 13)"/>` +
    // Tomato slice
    `<rect x="6" y="17" width="32" height="4" rx="2" fill="#e74c3c" stroke="${NAVY}" stroke-width="1.4"/>` +
    // Wavy lettuce leaf
    `<path d="M5,21 Q9,19 13,21 Q17,23 22,21 Q27,19 31,21 Q35,23 39,21 L38,24 Q33,26 28,24 Q23,22 18,24 Q13,26 6,24 Z" fill="#2ecc71" stroke="${NAVY}" stroke-width="1.2"/>` +
    // Cheddar cheese drip
    `<polygon points="8,23 36,23 33,29 27,25 21,30 15,25 11,28" fill="#f1c40f" stroke="${NAVY}" stroke-width="1.2"/>` +
    // Grilled burger patty
    `<rect x="6" y="24" width="32" height="7" rx="3.5" fill="#5a3825" stroke="${NAVY}" stroke-width="1.8"/>` +
    // Bottom toasted bun
    `<path d="M8,30 L36,30 Q36,37 22,37 Q8,37 8,30 Z" fill="#d9822b" stroke="${NAVY}" stroke-width="1.8"/>`,
);

const placard = makeAsset(
  TEX.placard,
  44,
  44,
  // Rising steam
  `<path d="M16,9 Q14,5 18,3" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="M22,8 Q24,4 21,2" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M28,9 Q30,5 26,3" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.8" stroke-linecap="round"/>` +
    // Clay Matka/Handi pot
    `<path d="M8,22 Q5,36 14,41 Q22,43 30,41 Q39,36 36,22 Z" fill="#a0522d" stroke="${NAVY}" stroke-width="2.2"/>` +
    `<ellipse cx="22" cy="22" rx="15" ry="4.5" fill="#8b4513" stroke="${NAVY}" stroke-width="2"/>` +
    // Steaming aromatic biryani rice
    `<ellipse cx="22" cy="20" rx="13" ry="7" fill="#f39c12"/>` +
    `<ellipse cx="22" cy="18" rx="10" ry="5.5" fill="#f1c40f"/>` +
    // Roasted meat / chicken drumstick piece
    `<path d="M22,12 Q29,11 32,16 Q27,19 22,14 Z" fill="#783510" stroke="${NAVY}" stroke-width="1.2"/>` +
    `<circle cx="33" cy="17" r="2.2" fill="#fff5eb" stroke="${NAVY}" stroke-width="1"/>` +
    // Saffron rice, fried onions & mint garnish
    `<circle cx="16" cy="17" r="1.3" fill="#e74c3c"/>` +
    `<circle cx="20" cy="15" r="1.2" fill="#27ae60"/>` +
    `<circle cx="26" cy="18" r="1.3" fill="#27ae60"/>` +
    `<circle cx="15" cy="20" r="1.2" fill="#d35400"/>` +
    `<circle cx="27" cy="21" r="1.2" fill="#e67e22"/>` +
    // Handi decorative golden neck band
    `<path d="M10,25 Q22,29 34,25" fill="none" stroke="#ffd23f" stroke-width="1.8"/>`,
);

const fact = makeAsset(
  TEX.fact,
  42,
  42,
  // Golden platter plate
  `<ellipse cx="21" cy="24" rx="20" ry="14" fill="#ffd700" stroke="${NAVY}" stroke-width="2"/>` +
    `<ellipse cx="21" cy="23" rx="16" ry="10.5" fill="#fff9e6" stroke="${NAVY}" stroke-width="1.2"/>` +
    // Hot samosas
    `<polygon points="14,14 8,24 20,24" fill="#e69530" stroke="${NAVY}" stroke-width="1.4"/>` +
    `<polygon points="26,14 20,24 32,24" fill="#d68220" stroke="${NAVY}" stroke-width="1.4"/>` +
    // Sweet gulab jamun & green mint chutney
    `<circle cx="21" cy="26" r="4.2" fill="#5a220d" stroke="${NAVY}" stroke-width="1.2"/>` +
    `<circle cx="14" cy="26" r="3" fill="#27ae60"/>` +
    `<circle cx="28" cy="26" r="3" fill="#c0392b"/>`,
);

// ---------------------------------------------------------------- power-ups

const shield = makeAsset(
  TEX.shield,
  56,
  56,
  `<circle cx="28" cy="28" r="25" fill="${NAVY}" stroke="${TEAL}" stroke-width="4"/>` +
    `<path d="M28 10 L43 16 V28 Q43 40 28 46 Q13 40 13 28 V16Z" fill="${TEAL}" stroke="${CREAM}" stroke-width="2"/>` +
    `<path d="M21 28 L26.5 33.5 L36 22" fill="none" stroke="${CREAM}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`,
);

const community = makeAsset(
  TEX.community,
  56,
  56,
  `<circle cx="28" cy="28" r="25" fill="${NAVY}" stroke="${SAFFRON}" stroke-width="4"/>` +
    `<circle cx="18" cy="21" r="4.5" fill="${SAFFRON}"/><circle cx="28" cy="17" r="5" fill="${CREAM}"/><circle cx="38" cy="21" r="4.5" fill="${SAFFRON}"/>` +
    `<path d="M10 33 Q18 25 26 33Z M30 33 Q38 25 46 33Z" fill="${SAFFRON}"/><path d="M19 34 Q28 22 37 34Z" fill="${CREAM}"/>` +
    `<text x="28" y="48" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${CREAM}" text-anchor="middle">x2</text>`,
);

const energy = makeAsset(
  TEX.energy,
  56,
  56,
  `<circle cx="28" cy="28" r="25" fill="${NAVY}" stroke="#ffd23f" stroke-width="4"/>` +
    `<polygon points="31,8 15,31 26,31 22,48 41,24 29,24" fill="#ffd23f" stroke="${CREAM}" stroke-width="1.6" stroke-linejoin="round"/>`,
);

// -------------------------------------------------------------- effect bits

const spark = makeAsset(TEX.spark, 12, 12, `<circle cx="6" cy="6" r="5" fill="#ffffff"/>`);
const check = makeAsset(
  TEX.check,
  18,
  18,
  `<path d="M3 9.5 L7.5 14 L15 4.5" fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
);
const streak = makeAsset(TEX.streak, 64, 5, `<rect x="0" y="0" width="64" height="5" rx="2.5" fill="#ffffff"/>`);
const shadow = makeAsset(TEX.shadow, 90, 20, `<ellipse cx="45" cy="10" rx="43" ry="9" fill="#000000" opacity="0.38"/>`);
const bubble = makeAsset(
  TEX.bubble,
  150,
  150,
  `<circle cx="75" cy="75" r="70" fill="rgba(23,165,160,0.2)" stroke="#7fe8e2" stroke-width="4"/>` +
    `<path d="M32 52 A48 48 0 0 1 62 28" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`,
);

// -------------------------------------------------------------- backgrounds

const sky = (() => {
  const rnd = seeded(7);
  const clouds = Array.from({ length: 7 }, () => {
    const x = Math.floor(rnd() * 900);
    const y = 20 + Math.floor(rnd() * 90);
    const w = 70 + Math.floor(rnd() * 90);
    return `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${(w / 6).toFixed(0)}" fill="#ffe3bd" opacity="0.5"/>`;
  }).join('');
  return makeAsset(
    TEX.sky,
    960,
    540,
    `<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#5f6fb0"/><stop offset="0.2" stop-color="#e29a78"/>` +
      `<stop offset="0.32" stop-color="#f7c58a"/><stop offset="0.5" stop-color="#c9a27e"/><stop offset="1" stop-color="#6b5a58"/></linearGradient></defs>` +
      `<rect width="960" height="540" fill="url(#sg)"/>${clouds}`,
    1,
  );
})();

const FAR = '#8f6f78';
const FAR_DARK = '#7d5f69';

const far = makeAsset(
  TEX.far,
  960,
  200,
  // Loose, decorative shapes (arch, stepped stone instruments, tower, dome); not a depiction of any real site.
  `<path d="M60 40 H230 V200 H60Z M96 200 V132 A49 49 0 0 1 194 132 V200Z" fill="${FAR}" fill-rule="evenodd"/>` +
    `<path d="M300 200 V70 L432 200Z" fill="${FAR}"/>` +
    Array.from({ length: 8 }, (_, i) => `<rect x="${300 + i * 14}" y="${74 + i * 16}" width="12" height="5" fill="${FAR_DARK}"/>`).join('') +
    `<path d="M442 200 A60 60 0 0 1 502 140 V200Z" fill="${FAR_DARK}"/>` +
    `<polygon points="600,200 614,24 636,24 650,200" fill="${FAR}"/>` +
    `<rect x="607" y="64" width="36" height="5" fill="${FAR_DARK}"/><rect x="603" y="120" width="44" height="5" fill="${FAR_DARK}"/>` +
    `<rect x="720" y="150" width="190" height="50" fill="${FAR}"/>` +
    `<path d="M762 150 A53 53 0 0 1 868 150Z" fill="${FAR_DARK}"/><line x1="815" y1="97" x2="815" y2="80" stroke="${FAR_DARK}" stroke-width="4"/>` +
    `<rect x="520" y="150" width="60" height="50" fill="${FAR_DARK}"/><rect x="660" y="130" width="46" height="70" fill="${FAR_DARK}"/>`,
  1,
);

const fog = makeAsset(
  TEX.fog,
  960,
  110,
  `<defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#f7c58a" stop-opacity="0"/><stop offset="0.3" stop-color="#f7c58a" stop-opacity="0.8"/>` +
    `<stop offset="0.55" stop-color="#e9b384" stop-opacity="0.55"/><stop offset="1" stop-color="#e9b384" stop-opacity="0"/></linearGradient></defs>` +
    `<rect width="960" height="110" fill="url(#fg)"/>`,
  1,
);

/** Pickups, effects and backdrops. */
export const WORLD_ASSETS: readonly ArtAsset[] = [
  token,
  megaphone,
  placard,
  fact,
  shield,
  community,
  energy,
  spark,
  check,
  streak,
  shadow,
  bubble,
  sky,
  far,
  fog,
];
