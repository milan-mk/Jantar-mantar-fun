import { CHECKPOINTS, LANE_X, VIEW_DIST } from '../config/constants';
import type { EntityKind } from '../config/entities';
import { speedAt, stageAt } from './Difficulty';
import type { World } from './World';

type RowKind =
  | 'wall'
  | 'police_block'
  | 'rickshaw'
  | 'cones'
  | 'puddle'
  | 'paper'
  | 'clerks'
  | 'stampers'
  | 'combo'
  | 'traffic'
  | 'checkpoint';

interface RowDef {
  kind: RowKind;
  minStage: number;
  weight: number;
}

const ROWS: readonly RowDef[] = [
  { kind: 'wall', minStage: 0, weight: 3 },
  { kind: 'police_block', minStage: 0, weight: 4 },
  { kind: 'clerks', minStage: 0, weight: 4 },
  { kind: 'stampers', minStage: 1, weight: 3 },
  { kind: 'rickshaw', minStage: 0, weight: 2 },
  { kind: 'cones', minStage: 0, weight: 1 },
  { kind: 'puddle', minStage: 0, weight: 1 },
  { kind: 'paper', minStage: 1, weight: 1 },
  { kind: 'combo', minStage: 2, weight: 2 },
  { kind: 'traffic', minStage: 1, weight: 2 },
];

const POWER_UPS: readonly EntityKind[] = ['shield', 'community', 'energy'];
const FIRST_ROW_AT = 55;
const FIRST_POWER_AT = 140;

/** Active random source. Swapped per section so seeded (daily) streets stay identical. */
let rng: () => number = Math.random;

/** Small deterministic generator (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Keeps a patrol zone on the road (|x| <= 0.95) while staying centred where it can. */
function patrolZone(center: number, range: number, speed: number): { center: number; range: number; speed: number } {
  const lo = Math.max(-0.95, center - range);
  const hi = Math.min(0.95, center + range);
  return { center: (lo + hi) / 2, range: (hi - lo) / 2, speed };
}

const rand = (min: number, max: number): number => min + rng() * (max - min);
const randInt = (min: number, max: number): number => Math.floor(rand(min, max + 1));

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Places hazards, pickups and roadside scenery by *distance travelled*, so
 * spacing stays fair at every speed. Every hazard row leaves at least one
 * lane open or can be jumped.
 */
export class Spawner {
  private nextRowAt = FIRST_ROW_AT;
  private nextPowerAt = FIRST_POWER_AT;
  private nextTreeAt = 3;
  private nextLampAt = 8;
  private nextBuildingAt = 0;
  private nextSpectatorAt = 12;
  private lastRow: RowKind | null = null;
  private powerBag: EntityKind[] = [];
  private archPlaced = false;
  private checkpointIdx = 0;
  private treeSide = 1;
  private lampSide = 1;
  private buildingSide = 1;

  private rowRng: () => number = Math.random;
  private sceneRng: () => number = Math.random;

  /** Pass a seed for a repeatable street (daily challenge); omit for a random one. */
  constructor(
    private readonly world: World,
    private readonly goal: number,
    private readonly seed: number | null = null,
    /** Rainy streets get many more puddles. */
    private readonly rainy = false,
  ) {
    this.reseed();
  }

  private reseed(): void {
    // Separate streams so scenery (placed by frame timing) never shifts the hazards.
    this.rowRng = this.seed === null ? Math.random : seededRandom(this.seed);
    this.sceneRng = this.seed === null ? Math.random : seededRandom(this.seed ^ 0x9e3779b9);
  }

  reset(): void {
    this.reseed();
    this.nextRowAt = FIRST_ROW_AT;
    this.nextPowerAt = FIRST_POWER_AT;
    this.nextTreeAt = 3;
    this.nextLampAt = 8;
    this.nextBuildingAt = 0;
    this.nextSpectatorAt = 12;
    this.lastRow = null;
    this.powerBag = [];
    this.archPlaced = false;
    this.checkpointIdx = 0;
  }

  update(dist: number): void {
    rng = this.sceneRng;
    this.fillScenery(dist);
    rng = this.rowRng;

    if (!this.archPlaced && dist + VIEW_DIST >= this.goal) {
      this.world.spawn('arch', 0, this.goal - dist);
      this.archPlaced = true;
    }

    while (this.nextRowAt - dist <= VIEW_DIST - 4 && this.nextRowAt < this.goal - 35) {
      const z = this.nextRowAt - dist;
      // Spacing and difficulty depend on the row's position, not on how fast the player runs.
      const progress = this.nextRowAt / this.goal;
      const stage = stageAt(progress);
      const speed = speedAt(progress);
      const isCheckpoint = this.checkpointIdx < CHECKPOINTS.length && this.nextRowAt >= CHECKPOINTS[this.checkpointIdx];
      if (isCheckpoint) this.checkpointIdx += 1;
      const open = isCheckpoint ? this.spawnCheckpoint(z, stage) : this.spawnRow(z, stage);
      this.placeTrail(z, open);
      const gap = speed * (0.68 + rand(0, stage >= 3 ? 0.28 : 0.42)) + 3.8;
      this.nextRowAt += gap;

      if (this.nextRowAt >= this.nextPowerAt && open.length > 0) {
        const lane = open[randInt(0, open.length - 1)];
        this.world.spawn(this.nextPowerUp(), LANE_X[lane], z + gap * 0.5);
        this.nextPowerAt = this.nextRowAt + rand(150, 230);
      }
    }
  }

  // ---------------------------------------------------------------- scenery

  private fillScenery(dist: number): void {
    const horizon = VIEW_DIST - 2;
    while (this.nextTreeAt - dist <= horizon) {
      this.world.spawn('tree', 1.22 * this.treeSide, this.nextTreeAt - dist);
      this.treeSide *= -1;
      this.nextTreeAt += 7;
    }
    while (this.nextLampAt - dist <= horizon) {
      this.world.spawn('lamp', 1.1 * this.lampSide, this.nextLampAt - dist);
      this.lampSide *= -1;
      this.nextLampAt += 18;
    }
    while (this.nextBuildingAt - dist <= horizon) {
      const size = rand(0.9, 1.25);
      // Inner edge at 1.34 plus half of the squeezed width (about 1.0 * size).
      this.world.spawn('building', (1.34 + 0.52 * size) * this.buildingSide, this.nextBuildingAt - dist, {
        variant: randInt(0, 3),
        sizeScale: size,
      });
      this.buildingSide *= -1;
      this.nextBuildingAt += 4.5;
    }
    while (this.nextSpectatorAt - dist <= horizon) {
      const zAt = this.nextSpectatorAt - dist;
      // Spawn on Left sidewalk
      const leftRoll = rng();
      if (leftRoll < 0.45) {
        this.world.spawn('spectator', -rand(1.15, 1.28), zAt, { variant: randInt(0, 3) });
      } else if (leftRoll < 0.75) {
        this.world.spawn('reporter', -rand(1.16, 1.26), zAt);
      } else {
        this.world.spawn('cameraman', -rand(1.16, 1.26), zAt);
      }

      // Spawn on Right sidewalk
      const rightRoll = rng();
      if (rightRoll < 0.45) {
        this.world.spawn('spectator', rand(1.15, 1.28), zAt + rand(-0.8, 0.8), { variant: randInt(0, 3) });
      } else if (rightRoll < 0.75) {
        this.world.spawn('cameraman', rand(1.16, 1.26), zAt + rand(-0.8, 0.8));
      } else {
        this.world.spawn('reporter', rand(1.16, 1.26), zAt + rand(-0.8, 0.8));
      }

      this.nextSpectatorAt += rand(4.5, 7.5);
    }
  }

  // ------------------------------------------------------------------- rows

  private pickRow(stage: number): RowKind {
    const afterChasers = this.lastRow === 'clerks' || this.lastRow === 'stampers' || this.lastRow === 'checkpoint';
    const pool = ROWS.filter(
      (r) => r.minStage <= stage && r.kind !== this.lastRow && !(afterChasers && r.kind === 'wall'),
    );
    const weightOf = (r: RowDef): number => (this.rainy && r.kind === 'puddle' ? r.weight * 3 : r.weight);
    const total = pool.reduce((sum, r) => sum + weightOf(r), 0);
    let roll = rng() * total;
    for (const r of pool) {
      roll -= weightOf(r);
      if (roll <= 0) return r.kind;
    }
    return pool[0].kind;
  }

  /** Spawns one row of hazards and returns the lane indices left open. */
  private spawnRow(z: number, stage: number): number[] {
    const kind = this.pickRow(stage);
    this.lastRow = kind;
    const lanes = shuffled([0, 1, 2, 3]);
    const blocked = new Set<number>();
    const block = (lane: number, hazard: EntityKind): void => {
      blocked.add(lane);
      this.world.spawn(hazard, LANE_X[lane], z);
    };

    switch (kind) {
      case 'wall': {
        // Barricade line with 1-2 adjacent gaps; a guard patrols in front of the gap.
        const gapLanes = stage < 2 || rng() < 0.5 ? 1 : 2;
        const start = randInt(0, 4 - gapLanes);
        const gaps: number[] = [];
        for (let lane = 0; lane < 4; lane++) {
          if (lane >= start && lane < start + gapLanes) gaps.push(lane);
          else block(lane, 'barricade');
        }
        const center = (LANE_X[gaps[0]] + LANE_X[gaps[gaps.length - 1]]) / 2;
        const range = 0.28 + 0.25 * gapLanes;
        const zone = patrolZone(center, range, 0.7 + stage * 0.15);
        this.world.spawn('clerk', zone.center, z - 2, { patrol: zone });
        // Reward a jump over the barricades with a high token.
        const jumpLane = [0, 1, 2, 3].find((l) => !gaps.includes(l)) ?? 0;
        this.world.spawn('token', LANE_X[jumpLane], z, { lift: 1.9 });
        return gaps;
      }
      case 'rickshaw':
        for (const lane of lanes.slice(0, stage < 1 ? 1 : randInt(1, 2))) block(lane, 'rickshaw');
        break;
      case 'paper':
        for (const lane of lanes.slice(0, randInt(1, 2))) block(lane, 'paper');
        break;
      case 'cones':
        for (const lane of lanes.slice(0, randInt(2, 3))) block(lane, 'cones');
        break;
      case 'puddle':
        for (const lane of lanes.slice(0, 2)) block(lane, 'puddle');
        break;
      case 'combo': {
        const a = lanes[0];
        const b = lanes.find((l) => Math.abs(l - a) >= 2) ?? lanes[1];
        block(a, 'rickshaw');
        block(b, 'paper');
        break;
      }
      case 'traffic': {
        // Rickshaws crossing the road side to side: time your run, or wait.
        const count = stage >= 2 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          this.world.spawn('rickshaw', rand(-0.6, 0.6), z + i * 1.8, {
            patrol: { center: 0, range: 0.78, speed: 0.9 + stage * 0.14 + i * 0.25 },
          });
        }
        return [0, 1, 2, 3];
      }
      case 'police_block': {
        // Police van parked on the road blocking lanes, with officers standing beside it!
        const vanLeft = rng() < 0.5;
        const vanX = vanLeft ? -0.42 : 0.42;
        this.world.spawn('van', vanX, z);
        if (vanLeft) {
          blocked.add(0);
          blocked.add(1);
          // Police officer standing guard on the road next to the van
          const guard = patrolZone(LANE_X[2], 0.22, 0.75 + stage * 0.18);
          this.world.spawn('clerk', guard.center, z - 1.2, { patrol: guard });
          blocked.add(2);
        } else {
          blocked.add(2);
          blocked.add(3);
          const guard = patrolZone(LANE_X[1], 0.22, 0.75 + stage * 0.18);
          this.world.spawn('clerk', guard.center, z - 1.2, { patrol: guard });
          blocked.add(1);
        }
        return [0, 1, 2, 3].filter((l) => !blocked.has(l));
      }
      case 'clerks': {
        const count = [2, 2, 3, 3][stage] ?? 2;
        for (const lane of lanes.slice(0, count)) {
          this.world.spawn('clerk', LANE_X[lane] + rand(-0.08, 0.08), z + 6, { vz: 2.4 + stage * 0.25, homing: 0.6 });
        }
        return [0, 1, 2, 3];
      }
      case 'stampers': {
        const count = stage >= 2 ? 2 : 1;
        for (const lane of lanes.slice(0, count)) {
          this.world.spawn('stamp', LANE_X[lane], z + 8, { vz: 2.0 + stage * 0.2, homing: 0.5 });
        }
        return [0, 1, 2, 3];
      }
    }
    return [0, 1, 2, 3].filter((l) => !blocked.has(l));
  }

  /** A tougher barricade line with Police Van, fast guards, and rewards. */
  private spawnCheckpoint(z: number, stage: number): number[] {
    this.lastRow = 'checkpoint';
    const openLane = randInt(0, 3);
    const vanLeft = openLane >= 2;
    const vanX = vanLeft ? -0.42 : 0.42;
    this.world.spawn('van', vanX, z);

    for (let lane = 0; lane < 4; lane++) {
      if (lane !== openLane && (vanLeft ? lane >= 2 : lane < 2)) {
        this.world.spawn('barricade', LANE_X[lane], z);
      }
    }
    const center = LANE_X[openLane];
    const speed = 1.1 + stage * 0.15;
    const a = patrolZone(center, 0.5, speed);
    const b = patrolZone(center, 0.6, speed * 1.2);
    this.world.spawn('clerk', a.center, z - 1.5, { patrol: a });
    this.world.spawn('stamp', b.center, z - 3.5, { patrol: b });
    // Reward for getting through.
    this.world.spawn('megaphone', center, z + 3);
    this.world.spawn('fact', center, z + 4.6);
    return [openLane];
  }

  private pickPickup(): EntityKind {
    const r = rng();
    if (r < 0.45) return 'token'; // Pizza slice
    if (r < 0.75) return 'megaphone'; // Burger
    if (r < 0.93) return 'placard'; // Biryani Handi
    return 'fact'; // Samosa Treat platter
  }

  /** A line of pickups in an open lane just beyond the row. */
  private placeTrail(z: number, open: number[]): void {
    if (open.length === 0) return;
    const lane = open[randInt(0, open.length - 1)];
    for (let i = 0; i < 5; i++) {
      this.world.spawn(this.pickPickup(), LANE_X[lane], z + 6 + i * 2.2);
    }
  }

  private nextPowerUp(): EntityKind {
    if (this.powerBag.length === 0) this.powerBag = shuffled(POWER_UPS);
    return this.powerBag.pop() ?? 'shield';
  }
}
