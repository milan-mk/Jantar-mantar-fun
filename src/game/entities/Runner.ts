import Phaser from 'phaser';
import type { MoveVector } from '../../types';
import { FRAME_H, RES, RUN_POSES, textureKey, type Pose } from '../art/characterArt';
import type { CharacterDef } from '../config/characters';
import {
  ENERGY_JUMP_VELOCITY,
  GRAVITY,
  JUMP_VELOCITY,
  LATERAL_SPEED,
  MAX_LIFE,
  PLAYER_Y,
  PPM,
  X_LIMIT,
} from '../config/constants';
import { xAt } from '../systems/Projection';

const HEIGHT_M = 1.75;
const JUMP_BUFFER_MS = 130;

/** The runner: lateral movement, speed, jumping and pose animation (no physics engine needed). */
export class Runner {
  x = 0;
  jumpH = 0;
  speed = 0;
  life = MAX_LIFE;
  detainedMs = 0;
  stumbleMs = 0;
  stunMs = 0;
  splashMs = 0;
  dead = false;
  /** Cut-scene hooks: sideways pixel offset and opacity (see systems/Detention.ts). */
  offsetX = 0;
  fade = 1;
  /** Screen position after the last render(), for effects. */
  screenX = 0;
  screenY = PLAYER_Y;

  readonly image: Phaser.GameObjects.Image;
  readonly shadow: Phaser.GameObjects.Image;

  private vy = 0;
  private stepPhase = 0;
  private jumpBufferMs = 0;
  private pose: Pose = 'run1';
  private jumpedFlag = false;
  private landedFlag = false;

  constructor(
    scene: Phaser.Scene,
    private readonly def: CharacterDef,
    shadowKey: string,
  ) {
    this.shadow = scene.add.image(0, PLAYER_Y, shadowKey).setDepth(995);
    this.image = scene.add.image(0, PLAYER_Y, textureKey(def, 'run1')).setOrigin(0.5, 1).setDepth(1000);
    this.image.setScale((HEIGHT_M * PPM) / (FRAME_H * RES));
  }

  reset(): void {
    this.x = 0;
    this.jumpH = 0;
    this.vy = 0;
    this.speed = 0;
    this.life = MAX_LIFE;
    this.detainedMs = 0;
    this.stumbleMs = 0;
    this.stunMs = 0;
    this.splashMs = 0;
    this.dead = false;
    this.offsetX = 0;
    this.fade = 1;
    this.stepPhase = 0;
    this.jumpBufferMs = 0;
    this.jumpedFlag = false;
    this.landedFlag = false;
    this.pose = 'run1';
    this.image.setTexture(textureKey(this.def, 'run1')).setAlpha(1).setAngle(0);
  }

  get airborne(): boolean {
    return this.jumpH > 0.001;
  }

  get hurting(): boolean {
    return this.dead || this.stumbleMs > 0 || this.stunMs > 0;
  }

  requestJump(): void {
    this.jumpBufferMs = JUMP_BUFFER_MS;
  }

  consumeJumped(): boolean {
    const v = this.jumpedFlag;
    this.jumpedFlag = false;
    return v;
  }

  consumeLanded(): boolean {
    const v = this.landedFlag;
    this.landedFlag = false;
    return v;
  }

  /** Advances movement. `cruise` is the base forward speed in m/s. */
  step(dtMs: number, move: MoveVector, cruise: number, energy: boolean): void {
    const dt = dtMs / 1000;
    this.detainedMs = Math.max(0, this.detainedMs - dtMs);
    this.stumbleMs = Math.max(0, this.stumbleMs - dtMs);
    this.stunMs = Math.max(0, this.stunMs - dtMs);
    this.splashMs = Math.max(0, this.splashMs - dtMs);
    this.jumpBufferMs = Math.max(0, this.jumpBufferMs - dtMs);

    const frozen = this.detainedMs > 0 || this.dead;

    if (!frozen) {
      const lateral = this.def.stats.agility * LATERAL_SPEED * (this.stunMs > 0 ? 0.4 : 1);
      this.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, this.x + move.x * lateral * dt));
    }

    // Forward speed: the runner only moves while Up is held; release to stop.
    let target = move.y > 0 ? cruise : 0;
    if (this.stumbleMs > 0 || this.splashMs > 0) target *= energy ? 0.8 : 0.5;
    if (this.stunMs > 0) target *= 0.3;
    if (frozen) target = 0;
    const accel = frozen ? 70 : target > this.speed ? 20 : 40;
    const delta = target - this.speed;
    this.speed += Math.max(-accel * dt, Math.min(accel * dt, delta));

    // Jump
    if (!frozen && this.jumpBufferMs > 0 && !this.airborne) {
      this.vy = (energy ? ENERGY_JUMP_VELOCITY : JUMP_VELOCITY) * this.def.stats.jump;
      this.jumpH = 0.002;
      this.jumpBufferMs = 0;
      this.jumpedFlag = true;
    }
    if (this.airborne) {
      this.vy -= GRAVITY * dt;
      this.jumpH += this.vy * dt;
      if (this.jumpH <= 0) {
        this.jumpH = 0;
        this.vy = 0;
        this.landedFlag = true;
      }
    }

    this.stepPhase += this.speed * dt * 0.9;
  }

  /** Marks the run as lost: the runner tumbles and stops. */
  kill(): void {
    this.dead = true;
    this.speed = 0;
  }

  render(camX: number, reduced: boolean): void {
    let next: Pose;
    if (this.hurting) next = 'hurt';
    else if (this.airborne) next = 'jump';
    else if (this.detainedMs > 0 || this.speed < 0.5) next = 'run1';
    else next = RUN_POSES[Math.floor(this.stepPhase) % RUN_POSES.length];
    if (next !== this.pose) {
      this.pose = next;
      this.image.setTexture(textureKey(this.def, next));
    }

    const bob = this.airborne || reduced ? 0 : Math.abs(Math.sin(this.stepPhase * Math.PI * 0.5)) * 4;
    this.screenX = xAt(this.x, 0, camX) + this.offsetX;
    this.screenY = PLAYER_Y - this.jumpH * PPM - bob;
    this.image.setPosition(this.screenX, this.screenY).setAlpha(this.dead ? 1 : this.fade);

    const shadowScale = Math.max(0.55, 1 - this.jumpH * 0.28);
    this.shadow.setPosition(this.screenX, PLAYER_Y + 1).setDisplaySize(96 * shadowScale, 22 * shadowScale).setAlpha(this.fade);
  }
}
