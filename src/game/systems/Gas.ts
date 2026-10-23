import Phaser from 'phaser';
import { GAS_TEX } from '../art/gasArt';
import { PPM, ROAD_HALF_PX, X_LIMIT } from '../config/constants';
import { scaleAt, xAt, yAt } from './Projection';

/**
 * Tear-gas grenades. An officer throws a canister towards where the runner
 * is heading. A red ring marks the landing spot for the whole flight, then a
 * cloud sits there for a few seconds. Steer (or stop) to keep out of it.
 *
 * Positions are kept in absolute road metres (`abs`), so everything scrolls
 * correctly whatever speed the runner has.
 */

const FLIGHT_MS = 1000;
const CLOUD_MS = 4200;
const CLOUD_FADE_MS = 700;
const ARC_HEIGHT_M = 3.2;
/** Half-width / half-depth of the cloud's danger zone. */
const ZONE_HALF_W = 0.5;
const ZONE_HALF_D = 1.8;
/** A jump higher than this clears the (low) cloud. */
const CLOUD_HEIGHT_M = 1.0;

interface Grenade {
  x: number;
  landAbs: number;
  fromX: number;
  fromAbs: number;
  ageMs: number;
  landed: boolean;
  /** Set once the runner has been hurt by this cloud. */
  hurt: boolean;
  can: Phaser.GameObjects.Image;
  cloud: Phaser.GameObjects.Image;
}

export interface GasCallbacks {
  /** Throw started: play a sound. */
  onThrow: () => void;
  /** Canister landed and burst. */
  onBurst: (screenX: number, screenY: number) => void;
}

export class GasSystem {
  private grenades: Grenade[] = [];
  private readonly ring: Phaser.GameObjects.Graphics;
  private cooldownMs = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly cb: GasCallbacks,
  ) {
    this.ring = scene.add.graphics().setDepth(13);
  }

  reset(): void {
    for (const g of this.grenades) this.destroy(g);
    this.grenades = [];
    this.cooldownMs = 3000;
    this.ring.clear();
  }

  /**
   * Time between throws by stage (0 warm-up .. 3 hardest). Stage 0 never throws.
   * Returns ms, or 0 for "do not throw".
   */
  static intervalFor(stage: number): number {
    return [0, 5600, 4000, 2900][stage] ?? 0;
  }

  /** Spawns a grenade from an officer at `fromX`/`fromAbs`, aimed to land where the runner is heading. */
  throwFrom(fromX: number, fromAbs: number, aimX: number, landAbs: number, extra = 0): void {
    const spread = extra === 0 ? 0 : extra;
    const x = Phaser.Math.Clamp(aimX + spread, -X_LIMIT, X_LIMIT);
    const can = this.scene.add.image(0, 0, GAS_TEX.can).setOrigin(0.5, 0.5).setVisible(false);
    const cloud = this.scene.add.image(0, 0, GAS_TEX.cloud).setOrigin(0.5, 0.78).setVisible(false);
    this.grenades.push({ x, landAbs, fromX, fromAbs, ageMs: 0, landed: false, hurt: false, can, cloud });
    this.cb.onThrow();
  }

  /** True when the cooldown has run out and the stage allows another grenade. */
  canThrow(dtMs: number, stage: number): boolean {
    if (GasSystem.intervalFor(stage) === 0) return false;
    this.cooldownMs -= dtMs;
    return this.cooldownMs <= 0;
  }

  /** Restarts the cooldown after a throw. */
  rearm(stage: number): void {
    this.cooldownMs = GasSystem.intervalFor(stage) * (0.8 + Math.random() * 0.5);
  }

  /**
   * Advances grenades. Returns true when the runner is standing in a cloud
   * (the scene applies the damage / slow-down), and `firstContact` when this
   * is the first frame of contact with that cloud.
   */
  update(
    dtMs: number,
    distance: number,
    runnerX: number,
    runnerJumpH: number,
    camX: number,
    reduced: boolean,
  ): { inside: boolean; firstContact: boolean } {
    let inside = false;
    let firstContact = false;
    const gfx = this.ring;
    gfx.clear();

    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.ageMs += dtMs;
      const zLand = g.landAbs - distance;

      if (!g.landed) {
        const p = Math.min(1, g.ageMs / FLIGHT_MS);
        // Telegraph: a pulsing red ring on the road where it will land.
        const s = scaleAt(zLand);
        const w = ZONE_HALF_W * 2 * ROAD_HALF_PX * s * 1.1;
        const pulse = reduced ? 1 : 1 + 0.12 * Math.sin(g.ageMs * 0.02);
        gfx.lineStyle(Math.max(2, 4 * s), 0xff4040, 0.35 + 0.5 * p);
        gfx.strokeEllipse(xAt(g.x, zLand, camX), yAt(zLand), w * pulse, w * 0.3 * pulse);
        gfx.fillStyle(0xff4040, 0.12 + 0.12 * p);
        gfx.fillEllipse(xAt(g.x, zLand, camX), yAt(zLand), w * pulse, w * 0.3 * pulse);

        // Canister in flight along an arc.
        const abs = g.fromAbs + (g.landAbs - g.fromAbs) * p;
        const x = g.fromX + (g.x - g.fromX) * p;
        const z = abs - distance;
        const lift = Math.sin(Math.PI * p) * ARC_HEIGHT_M;
        const sc = scaleAt(Math.max(z, -1));
        g.can
          .setVisible(z > -1.5)
          .setPosition(xAt(x, z, camX), yAt(z) - (lift + 0.4) * PPM * sc)
          .setScale(sc * 0.55)
          .setRotation(reduced ? 0 : g.ageMs * 0.012)
          .setDepth(1000 - z * 4 + 5);
        if (p >= 1) {
          g.landed = true;
          g.ageMs = 0;
          g.can.setVisible(false);
          this.cb.onBurst(xAt(g.x, zLand, camX), yAt(zLand));
        }
        continue;
      }

      // Cloud phase.
      if (g.ageMs >= CLOUD_MS + CLOUD_FADE_MS || zLand < -ZONE_HALF_D - 6) {
        this.destroy(g);
        this.grenades.splice(i, 1);
        continue;
      }
      const grow = Math.min(1, g.ageMs / 350);
      const fade = g.ageMs > CLOUD_MS ? 1 - (g.ageMs - CLOUD_MS) / CLOUD_FADE_MS : 1;
      const s = scaleAt(zLand);
      const wobble = reduced ? 0 : Math.sin(g.ageMs * 0.006) * 0.04;
      g.cloud
        .setVisible(zLand > -8)
        .setPosition(xAt(g.x, zLand, camX), yAt(zLand))
        .setScale(s * (0.55 + 0.45 * grow + wobble) * 1.35)
        .setAlpha(0.92 * fade)
        .setDepth(1000 - zLand * 4 + 8);

      const live = g.ageMs < CLOUD_MS + CLOUD_FADE_MS * 0.5;
      if (live && runnerJumpH < CLOUD_HEIGHT_M && Math.abs(zLand) < ZONE_HALF_D && Math.abs(g.x - runnerX) < ZONE_HALF_W) {
        inside = true;
        if (!g.hurt) {
          g.hurt = true;
          firstContact = true;
        }
      }
    }
    return { inside, firstContact };
  }

  private destroy(g: Grenade): void {
    g.can.destroy();
    g.cloud.destroy();
  }

  dispose(): void {
    this.reset();
    this.ring.destroy();
  }
}
