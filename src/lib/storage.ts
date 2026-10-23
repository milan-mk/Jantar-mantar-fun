import type { CharacterId, GhostRun, Progress, SaveData, Settings } from '../types';
import { defaultProgress, STARTER_CHARACTERS } from './progress';

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
  'climber',
];
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

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
    ghosts: {},
    progress: defaultProgress(),
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

const GHOST_KEY = /^(free|daily-\d{4}-\d{2}-\d{2})$/;
const MAX_SAMPLES = 3000;

function sanitizeNumbers(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length > MAX_SAMPLES) return null;
  const out: number[] = [];
  for (const n of value) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return null;
    out.push(Math.round(n));
  }
  return out;
}

function sanitizeGhosts(value: unknown): Record<string, GhostRun> {
  const out: Record<string, GhostRun> = {};
  if (!isRecord(value)) return out;
  for (const key of Object.keys(value).slice(0, 8)) {
    const g = value[key];
    if (!GHOST_KEY.test(key) || !isRecord(g)) continue;
    const d = sanitizeNumbers(g.d);
    const x = sanitizeNumbers(g.x);
    const score = g.score;
    if (!d || !x || d.length !== x.length || d.length < 2) continue;
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) continue;
    out[key] = { score: Math.min(Math.floor(score), MAX_SCORE), d, x };
  }
  return out;
}

function count(value: unknown, max = 1_000_000): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.min(Math.floor(value), max) : 0;
}

function dateOrEmpty(value: unknown): string {
  return typeof value === 'string' && DATE_KEY.test(value) ? value : '';
}

function stringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v.length <= 40).slice(0, max);
}

function sanitizeProgress(value: unknown): Progress {
  const base = defaultProgress();
  if (!isRecord(value)) return base;
  const streak = isRecord(value.streak) ? value.streak : {};
  const done = isRecord(value.missionsDone) ? value.missionsDone : {};
  const unlocked = stringList(value.unlocked, 8).filter((c): c is CharacterId =>
    CHARACTERS.includes(c as CharacterId),
  );
  return {
    streak: { last: dateOrEmpty(streak.last), count: count(streak.count, 100000) },
    missionsDone: { date: dateOrEmpty(done.date), ids: stringList(done.ids, 10) },
    missionsTotal: count(value.missionsTotal),
    achievements: stringList(value.achievements, 40),
    totalItems: count(value.totalItems, 100_000_000),
    totalRuns: count(value.totalRuns, 100_000_000),
    unlocked: Array.from(new Set<CharacterId>([...STARTER_CHARACTERS, ...unlocked])),
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

  const progress = sanitizeProgress(value.progress);
  const wanted = CHARACTERS.find((c) => c === value.character);
  // A locked character can never be selected, even if the save file says so.
  const character = wanted && progress.unlocked.includes(wanted) ? wanted : base.character;

  return {
    bestScore,
    ghosts: sanitizeGhosts(value.ghosts),
    progress,
    character,
    settings: sanitizeSettings(value.settings, base.settings),
  };
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
