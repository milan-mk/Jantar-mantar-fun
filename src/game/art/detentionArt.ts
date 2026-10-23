import { CREAM, NAVY, RED, makeAsset, type ArtAsset } from './worldArt';

/** Textures for the "caught" sequence: a fictional patrol van and a news reporter. */
export const DETENTION_TEX = {
  van: 'dt-van',
  reporter0: 'dt-reporter0',
  reporter1: 'dt-reporter1',
} as const;

const FONT = `font-family="Arial, 'Noto Sans Devanagari', 'Nirmala UI', sans-serif"`;

/** Patrol van seen from the front-left, drawn on a 220 x 150 grid. */
const van = makeAsset(
  DETENTION_TEX.van,
  220,
  150,
  // ground shadow
  `<ellipse cx="110" cy="141" rx="98" ry="8" fill="rgba(0,0,0,0.28)"/>` +
    // side panel (receding)
    `<polygon points="150,34 206,22 206,112 150,124" fill="#e3e6ee" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<polygon points="150,84 206,76 206,92 150,100" fill="#1b4fb0"/>` +
    `<polygon points="156,46 168,44 168,70 156,72" fill="#6d7a96" stroke="${NAVY}" stroke-width="1.4"/>` +
    `<polygon points="174,43 186,41 186,66 174,68" fill="#6d7a96" stroke="${NAVY}" stroke-width="1.4"/>` +
    `<polygon points="192,40 202,38 202,62 192,64" fill="#6d7a96" stroke="${NAVY}" stroke-width="1.4"/>` +
    // front face
    `<rect x="18" y="34" width="132" height="90" rx="9" fill="#f4f5fa" stroke="${NAVY}" stroke-width="2.6"/>` +
    `<rect x="28" y="42" width="112" height="38" rx="6" fill="#53627f" stroke="${NAVY}" stroke-width="2"/>` +
    `<path d="M34 46 L90 46 L74 76 L34 76Z" fill="rgba(255,255,255,0.22)"/>` +
    `<rect x="18" y="86" width="132" height="14" fill="#1b4fb0"/>` +
    `<text x="84" y="97" ${FONT} font-size="11" font-weight="900" fill="${CREAM}" text-anchor="middle">PATROL VAN</text>` +
    // grille + lamps + bumper
    `<rect x="52" y="106" width="64" height="9" rx="2" fill="#2b2f3d"/>` +
    `<circle cx="36" cy="110" r="9" fill="#fff0b3" stroke="${NAVY}" stroke-width="2"/><circle cx="132" cy="110" r="9" fill="#fff0b3" stroke="${NAVY}" stroke-width="2"/>` +
    `<rect x="14" y="118" width="140" height="10" rx="4" fill="#9aa2b5" stroke="${NAVY}" stroke-width="2"/>` +
    // light bar
    `<rect x="52" y="22" width="40" height="13" rx="3" fill="${RED}" stroke="${NAVY}" stroke-width="2"/>` +
    `<rect x="92" y="22" width="40" height="13" rx="3" fill="#2f6bff" stroke="${NAVY}" stroke-width="2"/>` +
    // wheels
    `<ellipse cx="44" cy="128" rx="14" ry="10" fill="#15151c" stroke="${NAVY}" stroke-width="2"/>` +
    `<ellipse cx="128" cy="128" rx="14" ry="10" fill="#15151c" stroke="${NAVY}" stroke-width="2"/>` +
    `<ellipse cx="186" cy="118" rx="12" ry="8" fill="#15151c" stroke="${NAVY}" stroke-width="2"/>`,
);

function reporter(key: string, frame: 0 | 1): ArtAsset {
  const liftL = frame === 0 ? 8 : 0;
  const liftR = frame === 0 ? 0 : 8;
  const swing = frame === 0 ? 5 : -5;
  return makeAsset(
    key,
    80,
    150,
    // legs
    `<rect x="26" y="100" width="12" height="${44 - liftL}" rx="4" fill="#25304f" stroke="${NAVY}" stroke-width="1.3"/>` +
      `<rect x="42" y="100" width="12" height="${44 - liftR}" rx="4" fill="#25304f" stroke="${NAVY}" stroke-width="1.3"/>` +
      `<ellipse cx="32" cy="${145 - liftL}" rx="9" ry="4.5" fill="#f4f5fa"/><ellipse cx="48" cy="${145 - liftR}" rx="9" ry="4.5" fill="#f4f5fa"/>` +
      // torso: yellow jacket
      `<rect x="21" y="52" width="38" height="52" rx="9" fill="#ffd23f" stroke="${NAVY}" stroke-width="1.8"/>` +
      `<rect x="26" y="66" width="28" height="12" rx="2" fill="${CREAM}" stroke="${NAVY}" stroke-width="1.1"/>` +
      `<text x="40" y="75.5" ${FONT} font-size="7.5" font-weight="900" fill="${RED}" text-anchor="middle">PRESS</text>` +
      // microphone arm
      `<line x1="22" y1="62" x2="12" y2="${78 + swing}" stroke="#ffd23f" stroke-width="9" stroke-linecap="round"/>` +
      `<rect x="7" y="${60 + swing}" width="9" height="20" rx="4" fill="#2b2f3d" stroke="${NAVY}" stroke-width="1.3"/>` +
      `<circle cx="11.5" cy="${58 + swing}" r="6" fill="${RED}" stroke="${NAVY}" stroke-width="1.3"/>` +
      // camera on the shoulder
      `<line x1="58" y1="62" x2="64" y2="${50 - swing}" stroke="#ffd23f" stroke-width="9" stroke-linecap="round"/>` +
      `<rect x="48" y="${26 - swing}" width="30" height="22" rx="4" fill="#2b2f3d" stroke="${NAVY}" stroke-width="1.8"/>` +
      `<circle cx="72" cy="${37 - swing}" r="6" fill="#53627f" stroke="${NAVY}" stroke-width="1.4"/>` +
      `<circle cx="54" cy="${31 - swing}" r="2.4" fill="${RED}"/>` +
      // head
      `<circle cx="40" cy="34" r="16" fill="#c98e63" stroke="${NAVY}" stroke-width="1.8"/>` +
      `<path d="M24 30 Q25 15 40 15 Q56 15 56 30 Q49 22 40 22 Q31 22 24 30Z" fill="#241512"/>` +
      `<circle cx="34" cy="35" r="2.4" fill="${NAVY}"/><circle cx="46" cy="35" r="2.4" fill="${NAVY}"/>` +
      `<ellipse cx="40" cy="44" rx="5" ry="3.4" fill="#5a2a1f"/>`,
  );
}

export const DETENTION_ASSETS: readonly ArtAsset[] = [
  van,
  reporter(DETENTION_TEX.reporter0, 0),
  reporter(DETENTION_TEX.reporter1, 1),
];
