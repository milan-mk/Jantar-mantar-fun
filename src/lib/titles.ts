import type { RunStats } from '../types';

const TITLES: ReadonlyArray<{ min: number; title: string }> = [
  { min: 0, title: 'Enthusiastic Warm-Up Walker' },
  { min: 300, title: 'Sidewalk Sprinter' },
  { min: 700, title: 'Placard Prodigy' },
  { min: 1200, title: 'Megaphone Maestro' },
  { min: 1800, title: 'Civic Cheetah' },
  { min: 2600, title: 'Fact-Checking Phenom' },
  { min: 3600, title: 'Legend of the Crossroads' },
];

export function getResultTitle(stats: Pick<RunStats, 'score' | 'won'>): string {
  let result = TITLES[0].title;
  for (const entry of TITLES) {
    if (stats.score >= entry.min) result = entry.title;
  }
  return stats.won ? `${result}, Finisher` : result;
}

export function buildShareText(stats: RunStats): string {
  const outcome = stats.won
    ? `reached Jantar Mantar in ${stats.timeSec}s`
    : `ran ${stats.distance.toLocaleString()} m before the red tape caught up`;
  return [
    `I ${outcome} in Democracy Dash and scored ${stats.score.toLocaleString()} (${getResultTitle(stats)})!`,
    `${stats.items} items collected.`,
    'Run for your voice. Play for the people.',
    '(A fictional, satirical arcade game: all characters and events are made up.)',
  ].join('\n');
}
