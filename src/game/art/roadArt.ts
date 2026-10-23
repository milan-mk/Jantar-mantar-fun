import { CREAM, NAVY, RED, SAFFRON, makeAsset, seeded, type ArtAsset } from './worldArt';

/**
 * Street-level art: obstacles, the (fictional) paperwork officials who chase
 * you, roadside buildings, trees, lamp posts, spectators and the finish arch.
 * Everything is original and generated from code. Shop names and signs are
 * generic, and no real organisation, uniform or logo is depicted.
 */

export const ROAD_TEX = {
  barricade: 'rd-barricade',
  rickshaw: 'rd-rickshaw',
  paper: 'rd-paper',
  cones: 'rd-cones',
  puddle: 'rd-puddle',
  clerk0: 'rd-clerk0',
  clerk1: 'rd-clerk1',
  stamp0: 'rd-stamp0',
  stamp1: 'rd-stamp1',
  tree: 'rd-tree',
  lamp: 'rd-lamp',
  arch: 'rd-arch',
} as const;

export const BUILDING_KEYS = ['rd-bld0', 'rd-bld1', 'rd-bld2', 'rd-bld3'] as const;
export const SPECTATOR_KEYS = ['rd-spec0', 'rd-spec1', 'rd-spec2', 'rd-spec3'] as const;

const FONT = `font-family="Arial, 'Noto Sans Devanagari', 'Nirmala UI', sans-serif"`;

// ---------------------------------------------------------------- obstacles

const barricade = (() => {
  const stripes = Array.from(
    { length: 9 },
    (_, i) => `<polygon points="${i * 22 - 10},50 ${i * 22 + 1},50 ${i * 22 + 21},10 ${i * 22 + 10},10" fill="#1c1c24"/>`,
  ).join('');
  return makeAsset(
    ROAD_TEX.barricade,
    150,
    80,
    `<defs><clipPath id="bc"><rect x="2" y="10" width="146" height="40" rx="5"/></clipPath></defs>` +
      `<rect x="16" y="46" width="9" height="32" rx="2" fill="${NAVY}"/><rect x="125" y="46" width="9" height="32" rx="2" fill="${NAVY}"/>` +
      `<rect x="2" y="10" width="146" height="40" rx="5" fill="#ffd23f"/><g clip-path="url(#bc)">${stripes}</g>` +
      `<rect x="2" y="10" width="146" height="40" rx="5" fill="none" stroke="${NAVY}" stroke-width="3"/>` +
      `<rect x="44" y="19" width="62" height="22" rx="3" fill="#1b3f8f" stroke="${CREAM}" stroke-width="2"/>` +
      `<text x="75" y="35" ${FONT} font-size="13" font-weight="800" fill="${CREAM}" text-anchor="middle">DETOUR</text>`,
  );
})();

const rickshaw = makeAsset(
  ROAD_TEX.rickshaw,
  140,
  130,
  `<rect x="8" y="6" width="124" height="42" rx="18" fill="#f2c230" stroke="${NAVY}" stroke-width="2.5"/>` +
    `<rect x="14" y="40" width="112" height="62" rx="8" fill="#2f8f6b" stroke="${NAVY}" stroke-width="2.5"/>` +
    `<rect x="30" y="48" width="80" height="24" rx="5" fill="#14202e"/>` +
    `<rect x="14" y="78" width="112" height="12" fill="#f2c230"/>` +
    `<text x="70" y="88" ${FONT} font-size="9" font-weight="800" fill="${NAVY}" text-anchor="middle">BLOW HORN</text>` +
    `<rect x="52" y="93" width="36" height="12" rx="2" fill="${CREAM}" stroke="${NAVY}" stroke-width="1.2"/>` +
    `<text x="70" y="102" ${FONT} font-size="6.5" font-weight="700" fill="${NAVY}" text-anchor="middle">XX 00 0000</text>` +
    `<rect x="17" y="64" width="9" height="8" rx="2" fill="${RED}"/><rect x="114" y="64" width="9" height="8" rx="2" fill="${RED}"/>` +
    `<rect x="20" y="100" width="24" height="26" rx="8" fill="#1a1a22"/><rect x="96" y="100" width="24" height="26" rx="8" fill="#1a1a22"/>`,
);

const paper = (() => {
  const sheets = Array.from({ length: 10 }, (_, i) => {
    const x = 8 + ((i * 7) % 5);
    const y = 108 - i * 10;
    const fill = i % 3 === 0 ? '#f3e7c8' : i % 3 === 1 ? CREAM : '#e8d8b0';
    return `<rect x="${x}" y="${y}" width="68" height="11" rx="1.5" fill="${fill}" stroke="${NAVY}" stroke-width="1.6"/>`;
  }).join('');
  return makeAsset(
    ROAD_TEX.paper,
    90,
    120,
    `${sheets}` +
      `<rect x="10" y="64" width="70" height="5" fill="${RED}" opacity="0.85"/>` +
      `<text x="45" y="24" ${FONT} font-size="12" font-weight="800" fill="${RED}" text-anchor="middle" transform="rotate(-8 45 24)">PENDING</text>`,
  );
})();

const cones = (() => {
  const cone = (cx: number): string =>
    `<polygon points="${cx},6 ${cx + 14},48 ${cx - 14},48" fill="#ff7a1a" stroke="${NAVY}" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<polygon points="${cx - 5},22 ${cx + 5},22 ${cx + 8},32 ${cx - 8},32" fill="${CREAM}"/>` +
    `<rect x="${cx - 18}" y="46" width="36" height="8" rx="2" fill="${NAVY}"/>`;
  return makeAsset(ROAD_TEX.cones, 120, 56, `${cone(24)}${cone(60)}${cone(96)}`);
})();

const puddle = makeAsset(
  ROAD_TEX.puddle,
  150,
  30,
  `<ellipse cx="75" cy="17" rx="72" ry="11" fill="#3aa0d8" stroke="#1b5f96" stroke-width="2.5"/>` +
    `<ellipse cx="54" cy="14" rx="20" ry="3.5" fill="#bfe8ff" opacity="0.85"/><ellipse cx="108" cy="19" rx="11" ry="2.4" fill="#bfe8ff" opacity="0.6"/>`,
);

// ----------------------------------------------------------------- chasers

function clerk(key: string, frame: 0 | 1): ArtAsset {
  const liftL = frame === 0 ? 7 : 0;
  const liftR = frame === 0 ? 0 : 7;
  const swing = frame === 0 ? 6 : -6;
  return makeAsset(
    key,
    80,
    150,
    // alert bubble
    `<circle cx="64" cy="14" r="12" fill="#1b4fb0" stroke="${CREAM}" stroke-width="2.5"/>` +
      `<text x="64" y="20" ${FONT} font-size="17" font-weight="900" fill="${CREAM}" text-anchor="middle">!</text>` +
      // legs
      `<rect x="26" y="100" width="12" height="${44 - liftL}" rx="4" fill="#2b2b3a" stroke="${NAVY}" stroke-width="1.3"/>` +
      `<rect x="42" y="100" width="12" height="${44 - liftR}" rx="4" fill="#2b2b3a" stroke="${NAVY}" stroke-width="1.3"/>` +
      `<ellipse cx="32" cy="${145 - liftL}" rx="9" ry="4.5" fill="#1a1a1a"/><ellipse cx="48" cy="${145 - liftR}" rx="9" ry="4.5" fill="#1a1a1a"/>` +
      // arms behind torso
      `<line x1="58" y1="62" x2="68" y2="${92 - swing}" stroke="#f2ece0" stroke-width="9" stroke-linecap="round"/>` +
      `<circle cx="68" cy="${93 - swing}" r="5" fill="#d9a577" stroke="${NAVY}" stroke-width="1.1"/>` +
      // torso: shirt, vest, tie
      `<rect x="21" y="52" width="38" height="52" rx="9" fill="#f2ece0" stroke="${NAVY}" stroke-width="1.8"/>` +
      `<path d="M21 62 Q21 54 30 54 L38 54 L40 100 L24 100 Q21 100 21 94Z" fill="#8a2b3a"/>` +
      `<path d="M59 62 Q59 54 50 54 L42 54 L40 100 L56 100 Q59 100 59 94Z" fill="#8a2b3a"/>` +
      `<polygon points="40,54 44,60 40,84 36,60" fill="${RED}" stroke="${NAVY}" stroke-width="1"/>` +
      // clipboard arm
      `<line x1="22" y1="62" x2="14" y2="${90 + swing}" stroke="#f2ece0" stroke-width="9" stroke-linecap="round"/>` +
      `<rect x="2" y="${68 + swing}" width="22" height="30" rx="2.5" fill="#8b5a2b" stroke="${NAVY}" stroke-width="1.6"/>` +
      `<rect x="5" y="${72 + swing}" width="16" height="22" fill="${CREAM}"/>` +
      `<line x1="7" y1="${78 + swing}" x2="19" y2="${78 + swing}" stroke="#999" stroke-width="1.2"/><line x1="7" y1="${83 + swing}" x2="19" y2="${83 + swing}" stroke="#999" stroke-width="1.2"/><line x1="7" y1="${88 + swing}" x2="15" y2="${88 + swing}" stroke="#999" stroke-width="1.2"/>` +
      // head
      `<circle cx="40" cy="34" r="17" fill="#d9a577" stroke="${NAVY}" stroke-width="1.8"/>` +
      `<path d="M23 30 Q24 16 40 16 Q56 16 57 30 Q50 22 40 22 Q30 22 23 30Z" fill="#8c8c92"/>` +
      `<circle cx="33" cy="34" r="5.5" fill="rgba(255,255,255,0.4)" stroke="${NAVY}" stroke-width="1.6"/><circle cx="47" cy="34" r="5.5" fill="rgba(255,255,255,0.4)" stroke="${NAVY}" stroke-width="1.6"/>` +
      `<line x1="38.5" y1="34" x2="41.5" y2="34" stroke="${NAVY}" stroke-width="1.5"/>` +
      `<line x1="27" y1="26" x2="37" y2="28" stroke="${NAVY}" stroke-width="2" stroke-linecap="round"/><line x1="53" y1="26" x2="43" y2="28" stroke="${NAVY}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M32 44 Q40 40 48 44 Q40 47 32 44Z" fill="#3b2a1d"/>`,
  );
}

function stamper(key: string, frame: 0 | 1): ArtAsset {
  const liftL = frame === 0 ? 8 : 0;
  const liftR = frame === 0 ? 0 : 8;
  const swing = frame === 0 ? 5 : -5;
  return makeAsset(
    key,
    120,
    170,
    `<circle cx="16" cy="16" r="13" fill="${RED}" stroke="${CREAM}" stroke-width="2.5"/>` +
      `<text x="16" y="22" ${FONT} font-size="18" font-weight="900" fill="${CREAM}" text-anchor="middle">!!</text>` +
      // legs
      `<rect x="34" y="112" width="18" height="${52 - liftL}" rx="5" fill="#3d1722" stroke="${NAVY}" stroke-width="1.4"/>` +
      `<rect x="62" y="112" width="18" height="${52 - liftR}" rx="5" fill="#3d1722" stroke="${NAVY}" stroke-width="1.4"/>` +
      `<ellipse cx="43" cy="${165 - liftL}" rx="12" ry="5.5" fill="#141414"/><ellipse cx="71" cy="${165 - liftR}" rx="12" ry="5.5" fill="#141414"/>` +
      // raised stamp arm
      `<line x1="92" y1="76" x2="104" y2="${50 + swing}" stroke="#5a1f2d" stroke-width="13" stroke-linecap="round"/>` +
      `<circle cx="105" cy="${48 + swing}" r="7" fill="#c98e63" stroke="${NAVY}" stroke-width="1.3"/>` +
      `<rect x="100" y="${22 + swing}" width="10" height="22" rx="3" fill="#7a4b24" stroke="${NAVY}" stroke-width="1.3"/>` +
      `<rect x="90" y="${14 + swing}" width="30" height="12" rx="3" fill="${RED}" stroke="${NAVY}" stroke-width="1.5"/>` +
      // torso
      `<rect x="20" y="62" width="76" height="58" rx="14" fill="#5a1f2d" stroke="${NAVY}" stroke-width="2"/>` +
      `<polygon points="48,62 68,62 58,96" fill="#f2ece0"/><polygon points="58,64 62,70 58,100 54,70" fill="${RED}"/>` +
      // sheet arm
      `<line x1="24" y1="76" x2="14" y2="${98 - swing}" stroke="#5a1f2d" stroke-width="13" stroke-linecap="round"/>` +
      `<rect x="2" y="${84 - swing}" width="36" height="30" rx="2" fill="${CREAM}" stroke="${NAVY}" stroke-width="1.6" transform="rotate(-6 20 100)"/>` +
      `<text x="20" y="${103 - swing}" ${FONT} font-size="6.2" font-weight="900" fill="${RED}" text-anchor="middle" transform="rotate(-14 20 100)">REJECTED</text>` +
      // head and bowler hat
      `<circle cx="58" cy="42" r="21" fill="#c98e63" stroke="${NAVY}" stroke-width="2"/>` +
      `<ellipse cx="58" cy="26" rx="27" ry="6.5" fill="#15151c" stroke="${NAVY}" stroke-width="1.2"/>` +
      `<path d="M38 26 Q38 6 58 6 Q78 6 78 26Z" fill="#1c1c26" stroke="${NAVY}" stroke-width="1.5"/>` +
      `<rect x="40" y="19" width="36" height="5" fill="${RED}"/>` +
      `<circle cx="49" cy="43" r="2.6" fill="${NAVY}"/><circle cx="67" cy="43" r="2.6" fill="${NAVY}"/>` +
      `<line x1="42" y1="36" x2="53" y2="39" stroke="${NAVY}" stroke-width="3" stroke-linecap="round"/><line x1="74" y1="36" x2="63" y2="39" stroke="${NAVY}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M48 54 Q58 49 68 54" fill="none" stroke="${NAVY}" stroke-width="2.4" stroke-linecap="round"/>`,
  );
}

// ---------------------------------------------------------------- scenery

const SIGNS = ['CHAI  &amp;  SAMOSA', 'BOOK DEPOT', 'PHOTOSTAT', 'छोले भटूरे'];
const FACADES: ReadonlyArray<{ wall: string; trim: string; awnA: string; awnB: string }> = [
  { wall: '#d9946a', trim: '#b8714a', awnA: '#2f8f8b', awnB: '#fff4dc' },
  { wall: '#e6c36a', trim: '#c49a3c', awnA: '#8a2b3a', awnB: '#fff4dc' },
  { wall: '#c9b8a6', trim: '#a08f7d', awnA: '#d6663a', awnB: '#fff4dc' },
  { wall: '#b98aa8', trim: '#946a86', awnA: '#2a4a8f', awnB: '#fff4dc' },
];

function building(index: number): ArtAsset {
  const f = FACADES[index % FACADES.length];
  const rnd = seeded(100 + index * 17);
  const parts: string[] = [];
  parts.push(
    `<rect x="0" y="20" width="240" height="280" fill="${f.wall}"/>`,
    `<rect x="0" y="8" width="240" height="16" fill="${f.trim}"/>`,
    `<rect x="0" y="0" width="240" height="8" fill="#7a5a48"/>`,
  );
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 22 + col * 70;
      const y = 40 + row * 50;
      const lit = rnd() > 0.55;
      parts.push(
        `<rect x="${x}" y="${y}" width="36" height="34" rx="2" fill="${lit ? '#ffd98a' : '#2b3550'}" stroke="${NAVY}" stroke-width="2"/>`,
        `<rect x="${x - 8}" y="${y}" width="8" height="34" fill="${f.trim}" stroke="${NAVY}" stroke-width="1"/>`,
        `<rect x="${x + 36}" y="${y}" width="8" height="34" fill="${f.trim}" stroke="${NAVY}" stroke-width="1"/>`,
      );
      if (row === 1) parts.push(`<rect x="${x - 6}" y="${y + 28}" width="48" height="6" fill="${NAVY}" opacity="0.8"/>`);
    }
  }
  // shop front
  parts.push(
    `<rect x="14" y="196" width="212" height="104" fill="#3a2b2b"/>`,
    `<rect x="20" y="184" width="200" height="26" rx="3" fill="#fff4dc" stroke="${NAVY}" stroke-width="2.4"/>`,
    `<text x="120" y="203" ${FONT} font-size="17" font-weight="800" fill="${NAVY}" text-anchor="middle">${SIGNS[index % SIGNS.length]}</text>`,
  );
  for (let i = 0; i < 8; i++) {
    parts.push(`<polygon points="${14 + i * 26.5},212 ${40.5 + i * 26.5},212 ${38 + i * 26.5},236 ${16.5 + i * 26.5},236" fill="${i % 2 ? f.awnB : f.awnA}"/>`);
  }
  for (let i = 0; i < 9; i++) {
    const colors = ['#d6663a', '#2f8f8b', '#ffd23f', '#8a2b3a', '#2a4a8f'];
    parts.push(`<rect x="${24 + i * 22}" y="${248 + (i % 3) * 8}" width="16" height="${26 - (i % 3) * 6}" fill="${colors[i % colors.length]}" opacity="0.9"/>`);
  }
  parts.push(`<rect x="0" y="292" width="240" height="8" fill="#5b4a44"/>`);
  return makeAsset(BUILDING_KEYS[index], 240, 300, parts.join(''), 1);
}

const tree = makeAsset(
  ROAD_TEX.tree,
  120,
  200,
  `<rect x="53" y="104" width="14" height="92" fill="#5b3a24"/>` +
    `<rect x="49" y="182" width="22" height="18" fill="${CREAM}" stroke="${NAVY}" stroke-width="1.4"/><rect x="49" y="182" width="22" height="5" fill="${RED}"/>` +
    `<circle cx="60" cy="70" r="44" fill="#2e7d4f"/><circle cx="32" cy="96" r="29" fill="#27704a"/><circle cx="90" cy="96" r="31" fill="#27704a"/>` +
    `<circle cx="60" cy="38" r="29" fill="#36955c"/><circle cx="48" cy="60" r="16" fill="#3fa468" opacity="0.8"/>`,
  1,
);

const lamp = makeAsset(
  ROAD_TEX.lamp,
  44,
  220,
  `<rect x="18" y="26" width="6" height="188" fill="#2a2f3d"/>` +
    `<path d="M21 28 Q21 12 38 12" fill="none" stroke="#2a2f3d" stroke-width="5" stroke-linecap="round"/>` +
    `<ellipse cx="38" cy="16" rx="8" ry="5" fill="#ffe2a0" stroke="#2a2f3d" stroke-width="2"/>` +
    `<rect x="12" y="206" width="18" height="14" fill="#2a2f3d"/>`,
  1,
);

const RES_SMALL = 3;

const SPECTATORS: ReadonlyArray<{ shirt: string; skin: string; sign: string }> = [
  { shirt: '#f2b134', skin: '#8d5a3c', sign: 'LISTEN' },
  { shirt: '#d64545', skin: '#c98e63', sign: 'PEACE' },
  { shirt: '#17a5a0', skin: '#d9a577', sign: 'CLEAN AIR' },
  { shirt: '#7a5ac8', skin: '#a8714a', sign: 'FAIR EXAMS' },
];

function spectator(index: number): ArtAsset {
  const s = SPECTATORS[index];
  return makeAsset(
    SPECTATOR_KEYS[index],
    60,
    110,
    `<line x1="40" y1="52" x2="40" y2="22" stroke="#7a4b24" stroke-width="2.6"/>` +
      `<rect x="6" y="2" width="52" height="22" rx="2.5" fill="${CREAM}" stroke="${NAVY}" stroke-width="1.8"/>` +
      `<text x="32" y="17" ${FONT} font-size="9.5" font-weight="800" fill="${NAVY}" text-anchor="middle">${s.sign}</text>` +
      `<rect x="21" y="70" width="8" height="36" rx="3" fill="#2b3550"/><rect x="31" y="70" width="8" height="36" rx="3" fill="#2b3550"/>` +
      `<rect x="16" y="46" width="28" height="30" rx="8" fill="${s.shirt}" stroke="${NAVY}" stroke-width="1.4"/>` +
      `<line x1="40" y1="50" x2="40" y2="40" stroke="${s.shirt}" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="37" r="4" fill="${s.skin}"/>` +
      `<line x1="18" y1="52" x2="14" y2="72" stroke="${s.shirt}" stroke-width="7" stroke-linecap="round"/>` +
      `<circle cx="30" cy="34" r="11" fill="${s.skin}" stroke="${NAVY}" stroke-width="1.4"/><path d="M19 32 Q30 18 41 32 Q30 26 19 32Z" fill="#1d1410"/>` +
      `<circle cx="26" cy="35" r="1.5" fill="${NAVY}"/><circle cx="34" cy="35" r="1.5" fill="${NAVY}"/><path d="M26 40 Q30 43 34 40" fill="none" stroke="${NAVY}" stroke-width="1.3"/>`,
    RES_SMALL,
  );
}


const arch = (() => {
  const garlands = Array.from(
    { length: 28 },
    (_, i) => `<circle cx="${22 + i * 27}" cy="${118 + Math.sin(i * 0.9) * 4}" r="7" fill="${i % 2 ? SAFFRON : '#ffd23f'}" stroke="${NAVY}" stroke-width="1.2"/>`,
  ).join('');
  const checks = Array.from(
    { length: 38 },
    (_, i) => `<rect x="${i * 20}" y="${i % 2 ? 30 : 38}" width="20" height="8" fill="${i % 2 ? NAVY : CREAM}"/>`,
  ).join('');
  return makeAsset(
    ROAD_TEX.arch,
    760,
    300,
    `<rect x="14" y="70" width="52" height="230" fill="#b8714a" stroke="${NAVY}" stroke-width="3"/>` +
      `<rect x="694" y="70" width="52" height="230" fill="#b8714a" stroke="${NAVY}" stroke-width="3"/>` +
      `<rect x="0" y="30" width="760" height="94" rx="10" fill="#b72b2b" stroke="${NAVY}" stroke-width="3.5"/>${checks}` +
      `<text x="380" y="82" ${FONT} font-size="44" font-weight="900" fill="${CREAM}" text-anchor="middle">जंतर मंतर</text>` +
      `<text x="380" y="106" ${FONT} font-size="17" font-weight="800" fill="#ffd23f" text-anchor="middle" letter-spacing="3">FINISH LINE</text>${garlands}`,
    1,
  );
})();

/** Everything the street view needs. */
export const ROAD_ASSETS: readonly ArtAsset[] = [
  barricade,
  rickshaw,
  paper,
  cones,
  puddle,
  clerk(ROAD_TEX.clerk0, 0),
  clerk(ROAD_TEX.clerk1, 1),
  stamper(ROAD_TEX.stamp0, 0),
  stamper(ROAD_TEX.stamp1, 1),
  building(0),
  building(1),
  building(2),
  building(3),
  spectator(0),
  spectator(1),
  spectator(2),
  spectator(3),
  tree,
  lamp,
  arch,
];

