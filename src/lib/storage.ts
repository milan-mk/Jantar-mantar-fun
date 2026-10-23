import type { CharacterId, SaveData, Settings } from '../types';

const KEY = 'democracy-dash:v1';
const MAX_SCORE = 1_000_000_000;
const CHARACTERS: readonly CharacterId[] = [
  'neha',
  'abhijit',
  'nsui',
  'genz',
  'ex_minister',
  'wheelchair',
  'chhota',
  'student',
  'artist',
  'checker',
];

/** Used when localStorage is blocked, so the session still works. */
let memoryFallback: string | null = null;

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function defaultSave(): SaveData {
  return {
    bestScore: 0,
    character: 'neha',
    settings: { sound: true, music: true, reducedMotion: prefersReducedMotion() },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeSettings(value: unknown, fallback: Settings): Settings {
  if (!isRecord(value)) return fallback;
  return {
    sound: typeof value.sound === 'boolean' ? value.sound : fallback.sound,
    music: typeof value.music === 'boolean' ? value.music : fallback.music,
    reducedMotion:
      typeof value.reducedMotion === 'boolean' ? value.reducedMotion : fallback.reducedMotion,
  };
}

/** Rebuild a SaveData from untrusted parsed JSON, field by field. */
export function sanitizeSave(value: unknown): SaveData {
  const base = defaultSave();
  if (!isRecord(value)) return base;

  const best = value.bestScore;
  const bestScore =
    typeof best === 'number' && Number.isFinite(best) && best >= 0
      ? Math.min(Math.floor(best), MAX_SCORE)
      : base.bestScore;

  const character = CHARACTERS.find((c) => c === value.character) ?? base.character;

  return { bestScore, character, settings: sanitizeSettings(value.settings, base.settings) };
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY) ?? memoryFallback;
  } catch {
    return memoryFallback;
  }
}

export function loadSave(): SaveData {
  const raw = readRaw();
  if (!raw) return defaultSave();
  try {
    return sanitizeSave(JSON.parse(raw) as unknown);
  } catch {
    return defaultSave();
  }
}

/** Returns true when data reached localStorage, false when only memory held it. */
export function writeSave(data: SaveData): boolean {
  const raw = JSON.stringify(data);
  memoryFallback = raw;
  try {
    window.localStorage.setItem(KEY, raw);
    return true;
  } catch {
    return false;
  }
}
