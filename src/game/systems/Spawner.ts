import { LANE_X, VIEW_DIST } from '../config/constants';
import type { EntityKind } from '../config/entities';
import type { World } from './World';

type RowKind = 'wall' | 'rickshaw' | 'cones' | 'puddle' | 'paper' | 'clerks' | 'stampers' | 'combo';

interface RowDef {
  kind: RowKind;
  minStage: number;
  weight: number;
}

const ROWS: readonly RowDef[] = [
  { kind: 'wall', minStage: 0, weight: 3 },
  { kind: 'rickshaw', minStage: 0, weight: 3 },
  { kind: 'cones', minStage: 0, weight: 2 },
  { kind: 'puddle', minStage: 0, weight: 2 },
  { kind: 'clerks', minStage: 0, weight: 3 },
  { kind: 'paper', minStage: 1, weight: 2 },
  { kind: 'stampers', minStage: 2, weight: 2 },
  { kind: 'combo', minStage: 2, weight: 2 },
];

const POWER_UPS: readonly EntityKind[] = ['shield', 'community', 'energy'];
const FIRST_ROW_AT = 55;
const FIRST_POWER_AT = 140;

const rand = (min: number, max: number): number => min + Math.random() * (max - min);
const randInt = (min: number, max: number): number => Math.floor(rand(min, max + 1));

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
  private treeSide = 1;
  private lampSide = 1;
  private buildingSide = 1;

  constructor(
    private readonly world: World,
    private readonly goal: number,
  ) {}

  reset(): void {
    this.nextRowAt = FIRST_ROW_AT;
    this.nextPowerAt = FIRST_POWER_AT;
    this.nextTreeAt = 3;
    this.nextLampAt = 8;
    this.nextBuildingAt = 0;
    this.nextSpectatorAt = 12;
    this.lastRow = null;
    this.powerBag = [];
    this.archPlaced = false;
  }

  update(dist: number, speed: number, stage: number): void {
    this.fillScenery(dist);

    if (!this.archPlaced && dist + VIEW_DIST >= this.goal) {
      this.world.spawn('arch', 0, this.goal - dist);
      this.archPlaced = true;
    }

    while (this.nextRowAt - dist <= VIEW_DIST - 4 && this.nextRowAt < this.goal - 35) {
      const z = this.nextRowAt - dist;
      const open = this.spawnRow(z, stage);
      this.placeTrail(z, open);
      const gap = speed * (1.0 + rand(0, stage >= 3 ? 0.45 : 0.7)) + 6;
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
      const side = Math.random() < 0.5 ? -1 : 1;
      this.world.spawn('spectator', side * rand(1.14, 1.26), this.nextSpectatorAt - dist, {
        variant: randInt(0, 3),
      });
      this.nextSpectatorAt += rand(7, 15);
    }
  }

  // ------------------------------------------------------------------- rows

  private pickRow(stage: number): RowKind {
    const afterChasers = this.lastRow === 'clerks' || this.lastRow === 'stampers';
    const pool = ROWS.filter(
      (r) => r.minStage <= stage && r.kind !== this.lastRow && !(afterChasers && r.kind === 'wall'),
    );
    const total = pool.reduce((sum, r) => sum + r.weight, 0);
    let roll = Math.random() * total;
    for (const r of pool) {
      roll -= r.weight;
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
        const gapLanes = stage < 2 || Math.random() < 0.5 ? 1 : 2;
        const start = randInt(0, 4 - gapLanes);
        const gaps: number[] = [];
        for (let lane = 0; lane < 4; lane++) {
          if (lane >= start && lane < start + gapLanes) gaps.push(lane);
          else block(lane, 'barricade');
        }
        const center = (LANE_X[gaps[0]] + LANE_X[gaps[gaps.length - 1]]) / 2;
        const range = 0.28 + 0.25 * gapLanes;
        this.world.spawn('clerk', center, z - 5, {
          patrol: { center, range, speed: 0.55 + stage * 0.12 },
        });
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
      case 'clerks': {
        const count = [1, randInt(1, 2), 2, randInt(2, 3)][stage] ?? 2;
        for (const lane of lanes.slice(0, count)) {
          this.world.spawn('clerk', LANE_X[lane] + rand(-0.1, 0.1), z, { vz: 3, homing: 0.7 });
        }
        return [0, 1, 2, 3];
      }
      case 'stampers': {
        const count = stage >= 3 ? randInt(1, 2) : 1;
        for (const lane of lanes.slice(0, count)) {
          this.world.spawn('stamp', LANE_X[lane], z, { vz: 2.2, homing: 0.5 });
        }
        return [0, 1, 2, 3];
      }
    }
    return [0, 1, 2, 3].filter((l) => !blocked.has(l));
  }

  private pickPickup(): EntityKind {
    const r = Math.random();
    if (r < 0.74) return 'token';
    if (r < 0.84) return 'megaphone';
    if (r < 0.93) return 'placard';
    return 'fact';
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
