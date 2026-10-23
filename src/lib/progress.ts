import { dailySeed } from '../game/systems/dailySeed';
import type { CharacterId, Progress, RunStats } from '../types';

/** Characters everyone starts with. */
export const STARTER_CHARACTERS: readonly CharacterId[] = [
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

/** Missions to complete (across all days) before a locked character opens. */
export const UNLOCK_MISSIONS: Partial<Record<CharacterId, number>> = { climber: 3 };

export interface Mission {
  id: string;
  text: string;
  done: (s: RunStats) => boolean;
}

export interface Achievement {
  id: string;
  title: string;
  text: string;
  earned: (s: RunStats, p: Progress) => boolean;
}

export const MISSIONS: readonly Mission[] = [
  { id: 'finish', text: 'Reach Jantar Mantar', done: (s) => s.won },
  { id: 'clean', text: 'Finish without being caught', done: (s) => s.won && s.timesCaught === 0 },
  { id: 'items', text: 'Collect 25 items in one run', done: (s) => s.items >= 25 },
  { id: 'close', text: 'Pull off 4 close calls', done: (s) => s.closeCalls >= 4 },
  { id: 'jumps', text: 'Jump over 5 barricades', done: (s) => s.barricadeJumps >= 5 },
  { id: 'score', text: 'Score 2,000 points', done: (s) => s.score >= 2000 },
  { id: 'fast', text: 'Finish in under 100 seconds', done: (s) => s.won && s.timeSec < 100 },
  { id: 'far', text: 'Run at least 800 m', done: (s) => s.distance >= 800 },
  { id: 'escape', text: 'Wriggle out of the van in under 2.5 s', done: (s) => s.fastEscapes >= 1 },
  { id: 'fresh', text: 'Finish with 50% stamina or more', done: (s) => s.won && s.life >= 50 },
];

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first-finish', title: 'First Finish', text: 'Reach Jantar Mantar once', earned: (s) => s.won },
  { id: 'untouchable', title: 'Untouchable', text: 'Finish without being caught', earned: (s) => s.won && s.timesCaught === 0 },
  { id: 'escape-artist', title: 'Escape Artist', text: 'Escape the van in under 2.5 s', earned: (s) => s.fastEscapes >= 1 },
  { id: 'daredevil', title: 'Daredevil', text: '8 close calls in one run', earned: (s) => s.closeCalls >= 8 },
  { id: 'streak-3', title: 'Regular', text: 'Play 3 days in a row', earned: (_s, p) => p.streak.count >= 3 },
  { id: 'hoarder', title: 'Token Hoarder', text: 'Collect 200 items in total', earned: (_s, p) => p.totalItems >= 200 },
];

export function defaultProgress(): Progress {
  return {
    streak: { last: '', count: 0 },
    missionsDone: { date: '', ids: [] },
    missionsTotal: 0,
    achievements: [],
    totalItems: 0,
    totalRuns: 0,
    unlocked: [...STARTER_CHARACTERS],
  };
}

/** Three missions for a given day: the same for everyone, different every day. */
export function missionsForDay(dateKey: string): Mission[] {
  const picked: Mission[] = [];
  let salt = 0;
  while (picked.length < 3 && salt < 60) {
    const m = MISSIONS[dailySeed(`${dateKey}#${salt}`) % MISSIONS.length];
    if (!picked.includes(m)) picked.push(m);
    salt += 1;
  }
  return picked;
}

function dayBefore(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d - 1);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export interface RunSummary {
  missionsCompleted: Mission[];
  achievements: Achievement[];
  unlocked: CharacterId[];
  streak: number;
}

/** Applies one finished run to the long-term progress. Pure: returns a new object. */
export function applyRun(prev: Progress, stats: RunStats, today: string): { progress: Progress; summary: RunSummary } {
  const progress: Progress = {
    ...prev,
    streak: { ...prev.streak },
    missionsDone: prev.missionsDone.date === today ? { date: today, ids: [...prev.missionsDone.ids] } : { date: today, ids: [] },
    achievements: [...prev.achievements],
    unlocked: [...prev.unlocked],
  };

  // Streak: a run today counts the day; consecutive days extend it.
  if (progress.streak.last !== today) {
    progress.streak = {
      last: today,
      count: progress.streak.last === dayBefore(today) ? progress.streak.count + 1 : 1,
    };
  }

  progress.totalRuns += 1;
  progress.totalItems += stats.items;

  const missionsCompleted: Mission[] = [];
  for (const m of missionsForDay(today)) {
    if (!progress.missionsDone.ids.includes(m.id) && m.done(stats)) {
      progress.missionsDone.ids.push(m.id);
      progress.missionsTotal += 1;
      missionsCompleted.push(m);
    }
  }

  const achievements: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!progress.achievements.includes(a.id) && a.earned(stats, progress)) {
      progress.achievements.push(a.id);
      achievements.push(a);
    }
  }

  const unlocked: CharacterId[] = [];
  for (const [id, needed] of Object.entries(UNLOCK_MISSIONS) as Array<[CharacterId, number]>) {
    if (!progress.unlocked.includes(id) && progress.missionsTotal >= needed) {
      progress.unlocked.push(id);
      unlocked.push(id);
    }
  }

  return { progress, summary: { missionsCompleted, achievements, unlocked, streak: progress.streak.count } };
}
