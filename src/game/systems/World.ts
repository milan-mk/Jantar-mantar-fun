import Phaser from 'phaser';
import { PPM, VIEW_DIST } from '../config/constants';
import { SPECS, type EntityKind, type EntitySpec } from '../config/entities';
import { scaleAt, xAt, yAt } from './Projection';

export interface Entity {
  kind: EntityKind;
  spec: EntitySpec;
  image: Phaser.GameObjects.Image;
  /** Lateral position (-1..1 road edges). */
  x: number;
  /** Metres ahead of the runner. */
  z: number;
  /** Extra approach speed (m/s) on top of the world scrolling toward you. */
  vz: number;
  /** Lateral homing speed (units/s) while still far enough to dodge. */
  homing: number;
  /** Side-to-side patrol inside a fixed zone (guards in front of barricade gaps). */
  patrol: { center: number; range: number; speed: number; dir: number } | null;
  variant: number;
  walk: number;
  lift: number;
  /** Set once it has hurt or been collected so it cannot trigger twice. */
  used: boolean;
  /** World-unit height multiplier (buildings vary). */
  sizeScale: number;
}

export interface SpawnOptions {
  variant?: number;
  vz?: number;
  homing?: number;
  patrol?: { center: number; range: number; speed: number };
  lift?: number;
  sizeScale?: number;
}

/**
 * Owns every object on the street: spawning, scrolling toward the camera,
 * perspective placement and recycling. Images are pooled, so a long run
 * allocates nothing new once it is warmed up.
 */
export class World {
  readonly entities: Entity[] = [];
  private readonly free: Phaser.GameObjects.Image[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly textureHeight: ReadonlyMap<string, number>,
  ) {}

  spawn(kind: EntityKind, x: number, z: number, opts: SpawnOptions = {}): Entity {
    const spec = SPECS[kind];
    const image = this.free.pop() ?? this.scene.add.image(0, 0, spec.frames[0]);
    const variant = opts.variant ?? 0;
    const frame = spec.animated ? 0 : variant % spec.frames.length;
    image.setTexture(spec.frames[frame]).setOrigin(0.5, 1).setVisible(true).setActive(true);
    const entity: Entity = {
      kind,
      spec,
      image,
      x,
      z,
      vz: opts.vz ?? 0,
      homing: opts.homing ?? 0,
      patrol: opts.patrol ? { ...opts.patrol, dir: Math.random() < 0.5 ? -1 : 1 } : null,
      variant,
      walk: Math.random() * 2,
      lift: opts.lift ?? spec.lift,
      used: false,
      sizeScale: opts.sizeScale ?? 1,
    };
    this.entities.push(entity);
    return entity;
  }

  remove(entity: Entity): void {
    entity.used = true;
    entity.image.setVisible(false).setActive(false);
    this.free.push(entity.image);
    const index = this.entities.indexOf(entity);
    if (index >= 0) {
      this.entities[index] = this.entities[this.entities.length - 1];
      this.entities.pop();
    }
  }

  clear(): void {
    while (this.entities.length > 0) this.remove(this.entities[this.entities.length - 1]);
  }

  /** Scroll everything toward the camera. `speed` is the runner's forward speed (m/s). */
  update(dtSec: number, speed: number, targetX: number): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      e.z -= (speed + e.vz) * dtSec;
      if (e.spec.animated) e.walk += dtSec * (3 + (speed + e.vz) * 0.35);
      if (e.homing > 0 && e.z > 2.6) {
        const dx = targetX - e.x;
        const step = e.homing * dtSec;
        e.x += Math.max(-step, Math.min(step, dx));
      }
      const p = e.patrol;
      if (p) {
        e.x += p.dir * p.speed * dtSec;
        const lo = p.center - p.range;
        const hi = p.center + p.range;
        if (e.x <= lo) {
          e.x = lo;
          p.dir = 1;
        } else if (e.x >= hi) {
          e.x = hi;
          p.dir = -1;
        }
      }
      if (e.z < e.spec.despawnZ) this.remove(e);
    }
  }

  render(camX: number): void {
    for (const e of this.entities) {
      const s = scaleAt(e.z);
      const img = e.image;
      if (e.spec.animated) {
        const key = e.spec.frames[Math.floor(e.walk) % e.spec.frames.length];
        if (img.texture.key !== key) img.setTexture(key);
      }
      const texH = this.textureHeight.get(img.texture.key) ?? 100;
      const unit = (e.spec.heightM * e.sizeScale * PPM) / texH;
      const squeeze = e.spec.squeezeX ?? 1;
      img.setPosition(xAt(e.x, e.z, camX), yAt(e.z) - e.lift * PPM * s);
      img.setScale(s * unit * squeeze, s * unit);
      img.setDepth(e.spec.decal ? 12 : 1000 - e.z * 4);
      img.setAlpha(Math.max(0, Math.min(1, (VIEW_DIST - e.z) / 22)));
    }
  }
}
