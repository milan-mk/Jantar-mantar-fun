import Phaser from 'phaser';
import { audio } from '../../lib/audio';
import type { GhostRun, MoveVector, PowerUpKind, RunStats } from '../../types';
import { TEXTURE_HEIGHT } from '../art';
import { RUN_POSES, FRAME_H, RES, textureKey } from '../art/characterArt';
import { TEX } from '../art/worldArt';
import { CHARACTERS, type CharacterDef } from '../config/characters';
import {
  CAMERA_FOLLOW,
  CHECKPOINTS,
  COLORS,
  DEATH_HOLD_MS,
  DETAIN_MS,
  GAME_HEIGHT,
  GAME_WIDTH,
  GOAL_METERS,
  HORIZON_Y,
  HUD_INTERVAL_MS,
  INVULN_MS,
  MAX_DELTA_MS,
  MAX_LIFE,
  PLAYER_HALF_D,
  PLAYER_HALF_W,
  PLAYER_Y,
  PPM,
  SPLASH_MS,
  STUMBLE_MS,
  STUN_MS,
  ENERGY_SPEED_MULT,
  VIEW_DIST,
  WIN_HOLD_MS,
} from '../config/constants';
import { ITEM_POINTS, type EntityKind } from '../config/entities';
import type { GameOptions } from '../config/options';
import { Runner } from '../entities/Runner';
import { speedAt, stageAt } from '../systems/Difficulty';
import { PowerUpState } from '../systems/PowerUps';
import { drawRoad } from '../systems/Road';
import { scaleAt, xAt, yAt } from '../systems/Projection';
import { ScoreKeeper } from '../systems/Score';
import { DetentionSequence } from '../systems/Detention';
import { GasSystem } from '../systems/Gas';
import { Spawner } from '../systems/Spawner';
import { dailySeed } from '../systems/dailySeed';
import { World, type Entity } from '../systems/World';
import { GAME_SCENE_KEY } from './BootScene';

type RunState = 'running' | 'dying' | 'won' | 'over';
type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;

const POWER_UP_KINDS: readonly EntityKind[] = ['shield', 'community', 'energy'];
const HEAL_FROM_FACT = 6;
const MASH_MS = 350;
const GUARD_SLOW_MS = 5000;
const GUARD_SLOW_FACTOR = 0.45;
const FAST_ESCAPE_MS = 2500;

type Weather = 'clear' | 'dusk';
const TRACE_STEP_MS = 100;
const MAX_TRACE = 3000;

export class GameScene extends Phaser.Scene {
  private def!: CharacterDef;
  private runner!: Runner;
  private world!: World;
  private spawner!: Spawner;
  private roadGfx!: Phaser.GameObjects.Graphics;
  private ringGfx!: Phaser.GameObjects.Graphics;
  private far!: Phaser.GameObjects.Image;
  private bubble!: Phaser.GameObjects.Image;
  private flash!: Phaser.GameObjects.Rectangle;
  private popups!: Phaser.GameObjects.Group;
  private detention!: DetentionSequence;
  private gas!: GasSystem;
  private gasState = { inside: false, firstContact: false };

  private burst!: Emitter;
  private bigBurst!: Emitter;
  private dust!: Emitter;
  private streaks!: Emitter;

  private readonly power = new PowerUpState();
  private readonly score = new ScoreKeeper();

  private runState: RunState = 'running';
  private move: MoveVector = { x: 0, y: 0 };
  private distance = 0;
  private timeMs = 0;
  private camX = 0;
  private endMs = 0;
  private hudMs = 0;
  private dustMs = 0;
  private streakMs = 0;
  private wasDetained = false;
  private closeCombo = 0;
  private closeCalls = 0;
  private timesCaught = 0;
  private barricadeJumps = 0;
  private fastEscapes = 0;
  private detainStartMs = 0;
  private guardSlowMs = 0;
  private nextCheckpoint = 0;
  private weather: Weather = 'clear';
  private weatherTint!: Phaser.GameObjects.Rectangle;
  private rain!: Emitter;
  private readonly passedGuards = new WeakSet<Entity>();
  private ghostImg!: Phaser.GameObjects.Image;
  private ghost: GhostRun | null = null;
  private trace: { d: number[]; x: number[] } = { d: [], x: [] };
  private traceMs = 0;
  private unsubscribers: Array<() => void> = [];

  constructor(private readonly opts: GameOptions) {
    super(GAME_SCENE_KEY);
  }

  // ------------------------------------------------------------ lifecycle

  create(): void {
    this.def = CHARACTERS[this.opts.character];
    this.runState = 'running';
    this.move = { x: 0, y: 0 };
    this.distance = 0;
    this.timeMs = 0;
    this.camX = 0;
    this.endMs = 0;
    this.hudMs = 0;
    this.wasDetained = false;
    this.resetRunCounters();
    this.resetTrace();
    this.power.reset();
    this.score.reset();

    this.buildBackdrop();
    this.world = new World(this, TEXTURE_HEIGHT);
    this.weatherTint = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0).setOrigin(0, 0).setDepth(1450);
    this.runner = new Runner(this, this.def, TEX.shadow);
    this.ghostImg = this.add
      .image(0, 0, textureKey(this.def, 'run1'))
      .setOrigin(0.5, 1)
      .setTint(0x8fe9ff)
      .setAlpha(0.4)
      .setVisible(false);
    this.ringGfx = this.add.graphics().setDepth(990);
    this.bubble = this.add.image(0, 0, TEX.bubble).setDepth(1001).setVisible(false);
    this.popups = this.add.group();
    this.detention = new DetentionSequence(this, this.runner, () => this.reduced);
    this.gas = new GasSystem(this, {
      onThrow: () => audio.gasThrow(),
      onBurst: (x, y) => {
        audio.gasBurst();
        this.shake(110, 0.004);
        this.burst.explode(this.reduced ? 3 : 10, x, y - 20);
      },
    });
    this.buildEffects();
    this.applyWeather();
    this.bindBridge();

    this.spawner.update(0);

    const cleanup = (): void => this.cleanup();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    this.opts.bridge.emit('ready');
    this.emitHud();
  }

  private cleanup(): void {
    this.detention?.stop();
    for (const off of this.unsubscribers) off();
    this.unsubscribers = [];
  }

  private buildBackdrop(): void {
    this.add.image(0, 0, TEX.sky).setOrigin(0, 0).setDepth(0);
    this.far = this.add
      .image(GAME_WIDTH / 2, HORIZON_Y + 8, TEX.far)
      .setOrigin(0.5, 1)
      .setScale(1.15)
      .setDepth(2);
    this.add
      .image(0, HORIZON_Y - 38, TEX.fog)
      .setOrigin(0, 0)
      .setDepth(700);
    this.roadGfx = this.add.graphics().setDepth(10);
    this.flash = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.red, 0.35)
      .setOrigin(0, 0)
      .setDepth(2000)
      .setAlpha(0);
  }

  private buildEffects(): void {
    this.burst = this.add
      .particles(0, 0, TEX.spark, {
        lifespan: 450,
        speed: { min: 80, max: 260 },
        scale: { start: 0.9, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: 400,
        tint: this.def.burstColors,
        emitting: false,
      })
      .setDepth(1500);
    this.bigBurst = this.add
      .particles(0, 0, TEX.spark, {
        lifespan: 700,
        speed: { min: 120, max: 380 },
        scale: { start: 1.3, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: 300,
        tint: [0xffd23f, 0xfff4dc, 0x17a5a0, 0xff9933],
        emitting: false,
      })
      .setDepth(1500);
    this.dust = this.add
      .particles(0, 0, this.def.id === 'checker' ? TEX.check : TEX.spark, {
        lifespan: 380,
        speedX: { min: -90, max: 90 },
        speedY: { min: 40, max: 130 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: this.def.burstColors,
        emitting: false,
      })
      .setDepth(998);
    this.rain = this.add
      .particles(0, 0, TEX.streak, {
        x: { min: -40, max: GAME_WIDTH + 40 },
        y: -10,
        lifespan: 650,
        speedY: { min: 850, max: 1100 },
        speedX: -120,
        rotate: 80,
        scale: { start: 0.55, end: 0.45 },
        alpha: { start: 0.45, end: 0.25 },
        tint: 0xbfd8ff,
        frequency: 25,
        emitting: false,
      })
      .setDepth(1440);
    this.streaks = this.add
      .particles(0, 0, TEX.streak, {
        lifespan: 360,
        speedY: { min: 900, max: 1300 },
        rotate: 90,
        scale: { start: 1, end: 0.4 },
        alpha: { start: 0.5, end: 0 },
        tint: 0xffd23f,
        emitting: false,
      })
      .setDepth(1400);
  }

  private bindBridge(): void {
    const { bridge } = this.opts;
    this.unsubscribers.push(
      bridge.on('move', (v) => {
        this.move = { x: v.x, y: v.y };
      }),
      bridge.on('jump', () => {
        if (this.runState !== 'running') return;
        if (this.runner.detainedMs > 0) this.mashEscape();
        else this.runner.requestJump();
      }),
      bridge.on('pause', () => {
        if (this.runState === 'running' && this.scene.isActive(GAME_SCENE_KEY)) this.scene.pause();
      }),
      bridge.on('resume', () => {
        if (this.scene.isPaused(GAME_SCENE_KEY)) this.scene.resume();
      }),
      bridge.on('restart', () => {
        if (this.scene.isPaused(GAME_SCENE_KEY)) this.scene.resume();
        this.restartRun();
      }),
    );
  }

  // ----------------------------------------------------------- run control

  private restartRun(): void {
    this.tweens.killAll();
    this.popups.clear(true, true);
    this.world.clear();
    this.applyWeather(); // also builds a fresh spawner
    this.runner.reset();
    this.power.reset();
    this.score.reset();
    this.runState = 'running';
    this.distance = 0;
    this.timeMs = 0;
    this.camX = 0;
    this.endMs = 0;
    this.hudMs = 0;
    this.wasDetained = false;
    this.resetRunCounters();
    this.resetTrace();
    this.gas.reset();
    this.detention.stop();
    this.flash.setAlpha(0);
    this.bubble.setVisible(false);
    this.spawner.update(0);
    this.emitHud();
  }

  private get reduced(): boolean {
    return this.opts.settings.reducedMotion;
  }

  // ----------------------------------------------------------------- update

  update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, MAX_DELTA_MS);
    const dt = dtMs / 1000;

    if (this.runState === 'over') return;

    if (this.runState === 'dying') {
      this.endMs += dtMs;
      this.renderFrame(dt);
      if (this.endMs >= DEATH_HOLD_MS) this.finishRun(false);
      return;
    }

    if (this.runState === 'won') {
      this.endMs += dtMs;
      this.runner.step(dtMs, { x: 0, y: 0 }, 0, false);
      this.world.update(dt, this.runner.speed, this.runner.x);
      this.renderFrame(dt);
      if (this.endMs >= WIN_HOLD_MS) this.finishRun(true);
      return;
    }

    this.timeMs += dtMs;
    this.power.update(dtMs);

    const progress = Math.min(1, this.distance / GOAL_METERS);
    const energy = this.power.energyActive;
    const cruise = speedAt(progress) * this.def.stats.speed * (energy ? ENERGY_SPEED_MULT : 1);
    this.runner.step(dtMs, this.move, cruise, energy);

    const meters = this.runner.speed * dt;
    this.distance += meters;
    this.score.addDistance(meters, energy);

    this.guardSlowMs = Math.max(0, this.guardSlowMs - dtMs);
    this.world.guardSlow = this.guardSlowMs > 0 ? GUARD_SLOW_FACTOR : 1;
    this.announceCheckpoint();
    this.spawner.update(this.distance);
    this.world.update(dt, this.runner.speed, this.runner.x);
    this.handleCollisions();
    this.handleCloseCalls();
    this.recordTrace(dtMs);
    this.detention.update();
    this.handleDetentionEnd();

    if (this.runState === 'running' && this.distance >= GOAL_METERS) this.startWin();

    this.updateGasThrows(dtMs, progress);
    this.renderFrame(dt);
    this.applyGas();

    this.hudMs += dtMs;
    if (this.hudMs >= HUD_INTERVAL_MS) {
      this.hudMs = 0;
      this.emitHud();
    }
  }

  private renderFrame(dt: number): void {
    const target = this.runner.x * CAMERA_FOLLOW;
    this.camX += (target - this.camX) * Math.min(1, dt * 8);

    drawRoad(this.roadGfx, this.distance, this.camX);
    this.far.setX(GAME_WIDTH / 2 - this.camX * 28);
    this.world.render(this.camX);
    this.runner.render(this.camX, this.reduced);
    this.gasState = this.gas.update(dt * 1000, this.distance, this.runner.x, this.runner.jumpH, this.camX, this.reduced);
    this.renderGhost();
    this.drawRing();
    this.updateEffects(dt * 1000);
  }

  private drawRing(): void {
    const g = this.ringGfx;
    g.clear();
    if (this.runState === 'dying') return;
    const pulse = this.reduced ? 0 : Math.sin(this.time.now * 0.008) * 2;
    g.lineStyle(4, COLORS.gold, this.power.invulnerable ? 0.45 : 0.95);
    g.strokeEllipse(this.runner.screenX, PLAYER_Y + 4, 84 + pulse, 24 + pulse * 0.3);
  }

  private updateEffects(dtMs: number): void {
    const r = this.runner;
    if (this.power.hasShield) {
      const ending = this.power.shieldMs < 2000;
      const pulse = ending ? 0.45 + 0.4 * Math.abs(Math.sin(this.time.now * 0.012)) : 0.95;
      this.bubble
        .setVisible(true)
        .setPosition(r.screenX, r.screenY - 85)
        .setAlpha(pulse)
        .setScale(1.25);
    } else {
      this.bubble.setVisible(false);
    }
    r.image.setAlpha(this.power.invulnerable && this.runState === 'running' ? 0.55 + 0.35 * Math.sin(this.time.now * 0.04) : 1);

    if (r.consumeJumped()) audio.jump();
    if (r.consumeLanded() && !this.reduced) this.burst.explode(5, r.screenX, PLAYER_Y);

    this.dustMs += dtMs;
    if (this.dustMs >= 80) {
      this.dustMs = 0;
      if (!r.airborne && r.speed > 3 && !this.reduced) this.dust.emitParticleAt(r.screenX, PLAYER_Y - 2, 1);
    }
    if (this.power.energyActive && !this.reduced) {
      this.streakMs += dtMs;
      if (this.streakMs >= 40) {
        this.streakMs = 0;
        this.streaks.emitParticleAt(Phaser.Math.Between(0, GAME_WIDTH), HORIZON_Y + 20, 1);
      }
    }
  }

  // ------------------------------------------------------------- collisions

  private handleCollisions(): void {
    const list = this.world.entities;
    const r = this.runner;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (e.used || e.spec.halfD === 0) continue;
      if (Math.abs(e.z) > e.spec.halfD + PLAYER_HALF_D) continue;
      if (Math.abs(e.x - r.x) > e.spec.halfW + PLAYER_HALF_W) continue;

      if (this.isPickup(e.kind)) {
        // Vertical overlap, so floating items need a jump.
        if (r.jumpH < e.lift + e.spec.heightM && r.jumpH + 1.75 > e.lift) this.collect(e);
        continue;
      }
      if (r.dead) continue;
      this.touchHazard(e);
    }
  }

  private isPickup(kind: EntityKind): boolean {
    return kind === 'token' || kind === 'megaphone' || kind === 'placard' || kind === 'fact' || POWER_UP_KINDS.includes(kind);
  }

  private touchHazard(e: Entity): void {
    const r = this.runner;
    const clears = e.kind === 'puddle' ? r.jumpH > 0.12 : e.spec.clearH > 0 && r.jumpH >= e.spec.clearH;
    if (clears) {
      e.used = true;
      if (e.kind === 'barricade' || e.kind === 'cones') {
        if (e.kind === 'barricade') this.barricadeJumps += 1;
        this.score.addBonus(5);
        this.popup('Nice jump!', e, '#7fe8e2', 34);
      }
      return;
    }
    if (this.power.invulnerable) return;

    if (this.power.hasShield) {
      this.power.consumeShield();
      audio.shieldPop();
      this.world.remove(e);
      this.bigBurst.explode(this.reduced ? 8 : 22, r.screenX, r.screenY - 80);
      this.shake(120, 0.005);
      this.popupAt('Fact-Check Shield!', r.screenX, r.screenY - 170, '#7fe8e2');
      return;
    }

    switch (e.kind) {
      case 'barricade':
        e.used = true;
        r.stumbleMs = STUMBLE_MS;
        this.damage(45, 'CRASH!');
        break;
      case 'puddle':
        e.used = true;
        r.splashMs = SPLASH_MS;
        audio.splash();
        this.popup('Splash!', e, '#8fd3ff', 50);
        break;
      case 'clerk':
        this.world.remove(e);
        this.detain();
        break;
      case 'stamp':
        this.world.remove(e);
        r.stunMs = STUN_MS;
        this.damage(50, 'THWACK!');
        break;
      case 'cones':
        e.used = true;
        r.stumbleMs = 400;
        this.damage(8, 'Oops!');
        break;
      case 'paper':
        e.used = true;
        r.stumbleMs = STUMBLE_MS;
        this.damage(18, 'PENDING...');
        break;
      case 'rickshaw':
        e.used = true;
        r.stumbleMs = STUMBLE_MS;
        this.damage(25, 'BLOW HORN!');
        break;
      default:
        e.used = true;
        r.stumbleMs = STUMBLE_MS;
        this.damage(18, 'DHAPP!');
        break;
    }
  }

  private damage(amount: number, shout: string): void {
    const r = this.runner;
    this.closeCombo = 0;
    r.life = Math.max(0, r.life - amount);
    this.power.grantInvulnerability(INVULN_MS);
    audio.hit();
    this.shake(180, 0.01);
    this.flashRed();
    this.burst.explode(this.reduced ? 5 : 14, r.screenX, r.screenY - 70);
    this.popupAt(`${shout}  -${amount}`, r.screenX, r.screenY - 170, '#ffd23f');
    if (r.life <= 0) this.startDying();
  }

  private detain(): void {
    const r = this.runner;
    r.detainedMs = DETAIN_MS;
    this.timesCaught += 1;
    this.detainStartMs = this.timeMs;
    this.closeCombo = 0;
    this.wasDetained = true;
    this.power.grantInvulnerability(DETAIN_MS + 2000);
    audio.detain();
    this.shake(140, 0.006);
    // Render once so the cut-scene starts from the runner's current screen position.
    this.detention.start();
    // The officers who escorted you step aside for a while.
    for (let i = this.world.entities.length - 1; i >= 0; i--) {
      const e = this.world.entities[i];
      if ((e.kind === 'clerk' || e.kind === 'stamp') && e.z < 40) this.world.remove(e);
    }
  }

  private handleDetentionEnd(): void {
    if (this.wasDetained && this.runner.detainedMs <= 0) {
      this.wasDetained = false;
      audio.powerUp();
      const quick = this.timeMs - this.detainStartMs < FAST_ESCAPE_MS;
      if (quick) this.fastEscapes += 1;
      this.popupAt(quick ? 'ESCAPED! Run!' : 'Released! Run!', this.runner.screenX, this.runner.screenY - 170, '#fff4dc');
    }
  }

  private collect(e: Entity): void {
    const x = xAt(e.x, e.z, this.camX);
    const s = scaleAt(e.z);
    const y = yAt(e.z) - (e.lift + e.spec.heightM / 2) * PPM * s;
    const kind = e.kind;
    this.world.remove(e);

    if (POWER_UP_KINDS.includes(kind)) {
      const power = kind as PowerUpKind;
      this.power.activate(power, this.def.stats.shield);
      audio.powerUp();
      this.bigBurst.explode(this.reduced ? 8 : 24, x, y);
      const label: Record<PowerUpKind, string> = {
        shield: 'Fact Check Shield!',
        community: 'Community Boost x2!',
        energy: 'Energy Boost!',
      };
      this.popupAt(label[power], x, y - 40, '#ffd23f');
      this.score.addBonus(15);
      return;
    }

    const itemKind = kind as keyof typeof ITEM_POINTS;
    const points = ITEM_POINTS[itemKind] * this.power.multiplier;
    this.score.addItem(points);
    const tier = itemKind === 'token' ? 0 : itemKind === 'megaphone' ? 1 : itemKind === 'placard' ? 2 : 3;
    audio.collect(tier);
    if (itemKind === 'megaphone') {
      this.guardSlowMs = GUARD_SLOW_MS;
      this.popupAt('Burger Power! Guards slow down', GAME_WIDTH / 2, 150, '#ffd23f');
    }
    const foodName =
      itemKind === 'token'
        ? `+${points} Pizza! 🍕`
        : itemKind === 'megaphone'
          ? `+${points} Burger! 🍔`
          : itemKind === 'placard'
            ? `+${points} Biryani! 🍲`
            : `+${points} Samosas! 🥟`;
    this.burst.explode(this.reduced ? 3 : 9, x, y);
    this.popupAt(foodName, x, y - 24, this.power.multiplier > 1 ? '#ffd23f' : '#fff4dc');
    if (itemKind === 'fact' && this.runner.life < MAX_LIFE) {
      this.runner.life = Math.min(MAX_LIFE, this.runner.life + HEAL_FROM_FACT);
      this.popupAt(`+${HEAL_FROM_FACT} stamina`, x, y - 52, '#7fe8e2');
    }
  }

  // ------------------------------------------------------ new in this patch

  /** Each jump press while detained shortens the van ride. */
  private mashEscape(): void {
    const r = this.runner;
    r.detainedMs = Math.max(0, r.detainedMs - MASH_MS);
    audio.click();
    this.popupAt('Push!', r.screenX + Phaser.Math.Between(-60, 60), r.screenY - 120, '#7fe8e2');
  }

  /** Slipping past a patrolling guard without being caught earns a growing bonus. */
  private handleCloseCalls(): void {
    const r = this.runner;
    for (const e of this.world.entities) {
      if (e.kind !== 'clerk' || !e.patrol || e.used || this.passedGuards.has(e)) continue;
      if (e.z > -(e.spec.halfD + PLAYER_HALF_D) - 0.1) continue;
      this.passedGuards.add(e);
      if (r.dead || this.wasDetained) continue;
      const gap = Math.abs(e.x - r.x);
      if (gap > 0.95) continue;
      this.closeCombo += 1;
      this.closeCalls += 1;
      const bonus = 15 * Math.min(this.closeCombo, 6) * this.def.stats.risk;
      this.score.addBonus(bonus);
      audio.collect(Math.min(3, this.closeCombo - 1));
      const tag = this.closeCombo > 1 ? `x${this.closeCombo} CLOSE CALL!` : 'PHEW! CLOSE CALL!';
      this.popupAt(`${tag}  +${bonus}`, r.screenX, r.screenY - 190, '#ffd23f');
    }
  }

  /** An officer ahead throws a canister at where the runner is heading. */
  private updateGasThrows(dtMs: number, progress: number): void {
    const stage = stageAt(progress);
    if (this.wasDetained || this.runner.dead || this.distance > GOAL_METERS - 40) return;
    if (!this.gas.canThrow(dtMs, stage)) return;
    const throwers = this.world.entities.filter(
      (e) => (e.kind === 'clerk' || e.kind === 'stamp') && !e.used && e.z > 18 && e.z < 75,
    );
    if (throwers.length === 0) return;
    const src = throwers[Math.floor(Math.random() * throwers.length)];
    const r = this.runner;
    // Aim where the runner will be: ahead by about one flight time, and a bit sideways if steering.
    const landAbs = this.distance + Math.max(r.speed, 7) + 2;
    const aimX = Phaser.Math.Clamp(r.x + this.move.x * 0.4, -0.9, 0.9);
    this.gas.throwFrom(src.x, this.distance + src.z, aimX, landAbs);
    if (stage >= 3 && Math.random() < 0.5) {
      this.gas.throwFrom(src.x, this.distance + src.z, aimX, landAbs + 3, aimX > 0 ? -0.6 : 0.6);
    }
    this.gas.rearm(stage);
  }

  /** Standing in a cloud slows you; the first touch also costs stamina. */
  private applyGas(): void {
    const r = this.runner;
    if (!this.gasState.inside || r.dead || this.wasDetained) return;
    r.stumbleMs = Math.max(r.stumbleMs, 450);
    if (!this.gasState.firstContact || this.power.invulnerable) return;
    if (this.power.hasShield) {
      this.power.consumeShield();
      audio.shieldPop();
      this.popupAt('Fact-Check Shield!', r.screenX, r.screenY - 170, '#7fe8e2');
      return;
    }
    audio.cough();
    r.stumbleMs = 1500;
    this.damage(35, 'TEAR GAS!');
  }

  private resetRunCounters(): void {
    this.closeCombo = 0;
    this.closeCalls = 0;
    this.timesCaught = 0;
    this.barricadeJumps = 0;
    this.fastEscapes = 0;
    this.detainStartMs = 0;
    this.guardSlowMs = 0;
    this.nextCheckpoint = 0;
  }

  /** Picks the day's weather (seeded for the daily challenge), restyles the scene and builds a fresh spawner. */
  private applyWeather(): void {
    const daily = this.opts.mode === 'daily';
    const seed = daily ? dailySeed(this.opts.dailyKey) : null;
    if (seed !== null) {
      this.weather = (['clear', 'dusk'] as const)[seed % 2];
    } else {
      const roll = Math.random();
      this.weather = roll < 0.5 ? 'dusk' : 'clear';
    }
    const tint = this.weatherTint;
    if (this.weather === 'dusk') tint.setFillStyle(0xff7a3d, 0.13);
    else tint.setFillStyle(0xffffff, 0);
    this.rain.stop();
    this.spawner = new Spawner(this.world, GOAL_METERS, seed, false);
    if (this.weather === 'dusk') this.popupAt('Sunset run!', GAME_WIDTH / 2, 120, '#ffd9a0');
  }

  private announceCheckpoint(): void {
    if (this.nextCheckpoint >= CHECKPOINTS.length) return;
    if (this.distance < CHECKPOINTS[this.nextCheckpoint] - 100) return;
    this.nextCheckpoint += 1;
    audio.powerUp();
    this.shake(160, 0.004);
    this.popupAt('CHECKPOINT AHEAD!', GAME_WIDTH / 2, 150, '#ff6b6b');
  }

  private resetTrace(): void {
    this.trace = { d: [], x: [] };
    this.traceMs = 0;
    this.ghost = this.opts.ghost;
    if (this.ghostImg) this.ghostImg.setVisible(false);
  }

  /** Samples distance and lane every 100 ms so the best run can be replayed. */
  private recordTrace(dtMs: number): void {
    this.traceMs += dtMs;
    while (this.traceMs >= TRACE_STEP_MS && this.trace.d.length < MAX_TRACE) {
      this.traceMs -= TRACE_STEP_MS;
      this.trace.d.push(Math.round(this.distance * 10));
      this.trace.x.push(Math.round(this.runner.x * 100));
    }
  }

  private renderGhost(): void {
    const g = this.ghost;
    const img = this.ghostImg;
    if (!g || this.runState === 'over') {
      img.setVisible(false);
      return;
    }
    const f = this.timeMs / TRACE_STEP_MS;
    const i = Math.floor(f);
    if (i + 1 >= g.d.length) {
      img.setVisible(false); // the old run has finished
      return;
    }
    const k = f - i;
    const dist = (g.d[i] + (g.d[i + 1] - g.d[i]) * k) / 10;
    const gx = (g.x[i] + (g.x[i + 1] - g.x[i]) * k) / 100;
    const z = dist - this.distance;
    if (z < -1.5 || z > VIEW_DIST - 10) {
      img.setVisible(false);
      return;
    }
    const s = scaleAt(z);
    const pose = RUN_POSES[Math.floor(this.timeMs / 130) % RUN_POSES.length];
    img
      .setTexture(textureKey(this.def, pose))
      .setPosition(xAt(gx, z, this.camX), yAt(z))
      .setScale((s * 1.75 * PPM) / (FRAME_H * RES))
      .setDepth(999 - z * 4)
      .setVisible(true);
  }

  // ------------------------------------------------------------ run endings

  private startDying(): void {
    this.runState = 'dying';
    this.endMs = 0;
    this.runner.kill();
    this.bubble.setVisible(false);
    this.runner.image.setAlpha(1);
    this.flashRed();
  }

  private startWin(): void {
    this.runState = 'won';
    this.endMs = 0;
    this.power.grantInvulnerability(10000);
    audio.win();
    this.bigBurst.explode(this.reduced ? 12 : 60, GAME_WIDTH / 2, HORIZON_Y + 140);
    this.popupAt('JANTAR MANTAR REACHED!', GAME_WIDTH / 2, 150, '#ffd23f');
  }

  private finishRun(won: boolean): void {
    this.runState = 'over';
    const timeSec = Math.round(this.timeMs / 100) / 10;
    const life = Math.round(this.runner.life);
    if (won) {
      this.score.addBonus(500 + life * 4 + Math.max(0, Math.round(150 - timeSec)) * 5);
    } else {
      audio.gameOver();
    }
    const score = this.score.score;
    const stats: RunStats = {
      score,
      distance: Math.min(GOAL_METERS, Math.floor(this.distance)),
      items: this.score.items,
      timeSec,
      life,
      won,
      isNewBest: score > 0 && score > this.opts.bestScore,
      mode: this.opts.mode,
      dailyKey: this.opts.mode === 'daily' ? this.opts.dailyKey : '',
      closeCalls: this.closeCalls,
      timesCaught: this.timesCaught,
      barricadeJumps: this.barricadeJumps,
      fastEscapes: this.fastEscapes,
      trace: { score, d: [...this.trace.d], x: [...this.trace.x] },
    };
    this.emitHud();
    this.opts.bridge.emit('gameover', stats);
  }

  // ------------------------------------------------------------------ misc

  private shake(ms: number, intensity: number): void {
    if (!this.reduced) this.cameras.main.shake(ms, intensity);
  }

  private flashRed(): void {
    if (this.reduced) return;
    this.flash.setAlpha(1);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 380 });
  }

  private popup(text: string, e: Entity, color: string, lift: number): void {
    const x = xAt(e.x, e.z, this.camX);
    this.popupAt(text, x, yAt(e.z) - lift - 60 * scaleAt(e.z), color);
  }

  private popupAt(text: string, x: number, y: number, color: string): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
        fontSize: text.length > 10 ? '24px' : '22px',
        fontStyle: 'bold',
        color,
        stroke: '#0b1530',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(1600);
    this.popups.add(label);
    this.tweens.add({
      targets: label,
      y: y - (this.reduced ? 10 : 40),
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private emitHud(): void {
    this.opts.bridge.emit('hud', {
      score: this.score.score,
      distance: Math.min(GOAL_METERS, Math.floor(this.distance)),
      goal: GOAL_METERS,
      life: Math.round(this.runner.life),
      items: this.score.items,
      timeSec: Math.round(this.timeMs / 100) / 10,
      detainedMs: this.runner.detainedMs,
      shieldMs: this.power.shieldMs,
      communityMs: this.power.communityMs,
      energyMs: this.power.energyMs,
      fps: Math.round(this.game.loop.actualFps),
    });
  }
}
