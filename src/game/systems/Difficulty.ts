import { BASE_SPEED, MAX_SPEED } from '../config/constants';

/** Cruising speed (m/s) at a given progress (0-1) through the course. */
export function speedAt(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * p;
}

/**
 * Hazard complexity stage:
 * 0 warm-up (single hazards, lone officers), 1 pairs, crossing traffic, tear gas and the stick squad,
 * 2 groups of officers and faster grenades, 3 denser rows with double grenades.
 */
export function stageAt(progress: number): 0 | 1 | 2 | 3 {
  if (progress < 0.12) return 0;
  if (progress < 0.35) return 1;
  if (progress < 0.65) return 2;
  return 3;
}
