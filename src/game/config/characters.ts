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
  CHARACTERS.student,
  CHARACTERS.artist,
  CHARACTERS.checker,
];
