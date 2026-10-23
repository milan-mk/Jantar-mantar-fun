import type { CharacterId } from '../../types';

export interface CharacterPalette {
  skin: string;
  hair: string;
  top: string;
  topShade: string;
  bottom: string;
  shoe: string;
  accent: string;
}

/** Small, fair trade-offs. Nothing here is unlockable or purchasable. */
export interface CharacterStats {
  /** Multiplies forward speed. */
  speed: number;
  /** Multiplies sideways speed. */
  agility: number;
  /** Multiplies Fact Check Shield duration. */
  shield: number;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  trait: string;
  blurb: string;
  stats: CharacterStats;
  /** Bars shown on the character card, 1-5. */
  bars: { speed: number; agility: number; shield: number };
  burstColors: number[];
  palette: CharacterPalette;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  neha: {
    id: 'neha',
    name: 'NEHA',
    trait: 'Loudest Voice',
    blurb: 'Loudest slogan in Delhi.',
    stats: { speed: 1.05, agility: 1.0, shield: 1.1 },
    bars: { speed: 3, agility: 4, shield: 3 },
    burstColors: [0xdca15c, 0xc53030, 0xfff1dc],
    palette: {
      skin: '#c98e63',
      hair: '#1d1410',
      top: '#dca15c',
      topShade: '#bf8036',
      bottom: '#fff1dc',
      shoe: '#5c3218',
      accent: '#c53030',
    },
  },
  abhijit: {
    id: 'abhijit',
    name: 'ABHIJIT',
    trait: 'Carries Receipts',
    blurb: 'Topper. Carries receipts.',
    stats: { speed: 1.02, agility: 1.05, shield: 1.3 },
    bars: { speed: 4, agility: 3, shield: 4 },
    burstColors: [0x3b82f6, 0x1d4ed8, 0xffffff],
    palette: {
      skin: '#8d5a3c',
      hair: '#1b120c',
      top: '#3b82f6',
      topShade: '#1d4ed8',
      bottom: '#374151',
      shoe: '#4a3321',
      accent: '#93c5fd',
    },
  },
  nsui: {
    id: 'nsui',
    name: 'NSUI',
    trait: 'Flag Up',
    blurb: 'Flag up. Voice up.',
    stats: { speed: 1.1, agility: 1.0, shield: 1.0 },
    bars: { speed: 4, agility: 3, shield: 3 },
    burstColors: [0x2563eb, 0xffffff, 0x1e40af],
    palette: {
      skin: '#ba7e54',
      hair: '#151110',
      top: '#f8fafc',
      topShade: '#e2e8f0',
      bottom: '#ffffff',
      shoe: '#3b2518',
      accent: '#2563eb',
    },
  },
  genz: {
    id: 'genz',
    name: 'GENZ',
    trait: 'Going Live',
    blurb: 'Going live. No cap.',
    stats: { speed: 1.18, agility: 1.15, shield: 0.85 },
    bars: { speed: 5, agility: 4, shield: 2 },
    burstColors: [0xf97316, 0xf472b6, 0xa855f7],
    palette: {
      skin: '#d49b72',
      hair: '#a855f7',
      top: '#ea580c',
      topShade: '#c2410c',
      bottom: '#94a3b8',
      shoe: '#ffffff',
      accent: '#f472b6',
    },
  },
  ex_minister: {
    id: 'ex_minister',
    name: 'EX MINISTER',
    trait: 'Netaji',
    blurb: "Lost his convoy. Here to 'clarify'.",
    stats: { speed: 0.88, agility: 0.85, shield: 1.6 },
    bars: { speed: 2, agility: 2, shield: 5 },
    burstColors: [0xf59e0b, 0xeab308, 0xffffff],
    palette: {
      skin: '#b8825a',
      hair: '#e2e8f0',
      top: '#ffffff',
      topShade: '#cbd5e1',
      bottom: '#f1f5f9',
      shoe: '#271911',
      accent: '#f59e0b',
    },
  },
  wheelchair: {
    id: 'wheelchair',
    name: 'WHEELCHAIR WARRIOR',
    trait: 'Unstoppable',
    blurb: 'Ramp ya na ho, aa raha hai.',
    stats: { speed: 1.08, agility: 1.25, shield: 0.95 },
    bars: { speed: 4, agility: 5, shield: 3 },
    burstColors: [0x2563eb, 0x38bdf8, 0x64748b],
    palette: {
      skin: '#9f6943',
      hair: '#201510',
      top: '#2563eb',
      topShade: '#1d4ed8',
      bottom: '#1e293b',
      shoe: '#38bdf8',
      accent: '#64748b',
    },
  },
  chhota: {
    id: 'chhota',
    name: 'CHHOTA BADMOSH',
    trait: 'Chhota Dhamaka',
    blurb: 'Chhota pocket, bada dhamaka.',
    stats: { speed: 1.06, agility: 1.3, shield: 0.8 },
    bars: { speed: 4, agility: 5, shield: 2 },
    burstColors: [0xa855f7, 0xc084fc, 0xffffff],
    palette: {
      skin: '#b07447',
      hair: '#221610',
      top: '#ffffff',
      topShade: '#e2e8f0',
      bottom: '#a855f7',
      shoe: '#ffffff',
      accent: '#c084fc',
    },
  },
  student: {
    id: 'student',
    name: 'Student Runner',
    trait: 'Balanced',
    blurb: 'Saffron tee, bulging backpack and a rolled-up placard. Good at everything, great at nothing.',
    stats: { speed: 1, agility: 1, shield: 1 },
    bars: { speed: 3, agility: 3, shield: 3 },
    burstColors: [0xff9933, 0xfff4dc],
    palette: {
      skin: '#c98e63',
      hair: '#1d1410',
      top: '#ff9933',
      topShade: '#e67e1a',
      bottom: '#2a4a8f',
      shoe: '#fff4dc',
      accent: '#0b1530',
    },
  },
  artist: {
    id: 'artist',
    name: 'Street Artist',
    trait: 'Nimble',
    blurb: 'Beret, paint-splattered overalls and a brush. Sidesteps faster, but a touch slower on the straights.',
    stats: { speed: 0.97, agility: 1.18, shield: 1 },
    bars: { speed: 2, agility: 5, shield: 3 },
    burstColors: [0xd64545, 0x17a5a0, 0xffd23f, 0xff9933],
    palette: {
      skin: '#8d5a3c',
      hair: '#241512',
      top: '#fff4dc',
      topShade: '#e6d8b8',
      bottom: '#17a5a0',
      shoe: '#d64545',
      accent: '#d64545',
    },
  },
  checker: {
    id: 'checker',
    name: 'Fact Checker',
    trait: 'Sparkly',
    blurb: 'Round glasses, a trusty magnifier and a lanyard. Fact Check Shields last 40% longer.',
    stats: { speed: 1, agility: 0.95, shield: 1.4 },
    bars: { speed: 3, agility: 2, shield: 5 },
    burstColors: [0x17a5a0, 0x7fe8e2, 0xfff4dc],
    palette: {
      skin: '#d9a577',
      hair: '#2b1a14',
      top: '#17a5a0',
      topShade: '#128a86',
      bottom: '#1b2f66',
      shoe: '#0b1530',
      accent: '#fff4dc',
    },
  },
};

export const CHARACTER_LIST: CharacterDef[] = [
  CHARACTERS.neha,
  CHARACTERS.abhijit,
  CHARACTERS.nsui,
  CHARACTERS.genz,
  CHARACTERS.ex_minister,
  CHARACTERS.wheelchair,
  CHARACTERS.chhota,
  CHARACTERS.student,
  CHARACTERS.artist,
  CHARACTERS.checker,
];

