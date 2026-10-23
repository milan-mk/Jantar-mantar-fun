import Phaser from 'phaser';
import { audio } from '../../lib/audio';
import type { MoveVector, PowerUpKind, RunStats } from '../../types';
import { TEXTURE_HEIGHT } from '../art';
import { TEX } from '../art/worldArt';
import { CHARACTERS, type CharacterDef } from '../config/characters';
import {
  CAMERA_FOLLOW,
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
import { Spawner } from '../systems/Spawner';
import { World, type Entity } from '../systems/World';
import { GAME_SCENE_KEY } from './BootScene';

type RunState = 'running' | 'dying' | 'won' | 'over';
type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;

const POWER_UP_KINDS: readonly EntityKind[] = ['shield', 'community', 'energy'];
const HEAL_FROM_FACT = 8;

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
    this.power.reset();
    this.score.reset();

    this.buildBackdrop();
    this.world = new World(this, TEXTURE_HEIGHT);
    this.spawner = new Spawner(this.world, GOAL_METERS);
    this.runner = new Runner(this, this.def, TEX.shadow);
    this.ringGfx = this.add.graphics().setDepth(990);
    this.bubble = this.add.image(0, 0, TEX.bubble).setDepth(1001).setVisible(false);
    this.popups = this.add.group();
    this.buildEffects();
    this.bindBridge();

    this.spawner.update(0, speedAt(0), 0);

    const cleanup = (): void => this.cleanup();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    this.opts.bridge.emit('ready');
    this.emitHud();
  }

  private cleanup(): void {
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
        if (this.runState === 'running') this.runner.requestJump();
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
    this.spawner.reset();
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
    this.flash.setAlpha(0);
    this.bubble.setVisible(false);
    this.spawner.update(0, speedAt(0), 0);
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

    this.spawner.update(this.distance, this.runner.speed, stageAt(progress));
    this.world.update(dt, this.runner.speed, this.runner.x);
    this.handleCollisions();
    this.handleDetentionEnd();

    if (this.runState === 'running' && this.distance >= GOAL_METERS) this.startWin();

    this.renderFrame(dt);

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
        this.damage(50, 'REJECTED!');
        break;
      case 'cones':
        e.used = true;
        r.stumbleMs = 400;
        this.damage(6, 'Oops!');
        break;
      case 'paper':
        e.used = true;
        r.stumbleMs = STUMBLE_MS;
        this.damage(15, 'PENDING...');
        break;
      case 'rickshaw':
        e.used = true;
        r.stumbleMs = STUMBLE_MS;
        this.damage(20, 'BLOW HORN!');
        break;
      default:
        e.used = true;
        r.stumbleMs = STUMBLE_MS;
        this.damage(15, 'DHAPP!');
        break;
    }
  }

  private damage(amount: number, shout: string): void {
    const r = this.runner;
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
    this.wasDetained = true;
    this.power.grantInvulnerability(DETAIN_MS + 2000);
    audio.detain();
    this.shake(140, 0.006);
    // The officials who escorted you step aside for a while.
    for (let i = this.world.entities.length - 1; i >= 0; i--) {
      const e = this.world.entities[i];
      if ((e.kind === 'clerk' || e.kind === 'stamp') && e.z < 40) this.world.remove(e);
    }
  }

  private handleDetentionEnd(): void {
    if (this.wasDetained && this.runner.detainedMs <= 0) {
      this.wasDetained = false;
      audio.powerUp();
      this.popupAt('Released! Run!', this.runner.screenX, this.runner.screenY - 170, '#fff4dc');
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
    this.burst.explode(this.reduced ? 3 : 9, x, y);
    this.popupAt(`+${points}`, x, y - 24, this.power.multiplier > 1 ? '#ffd23f' : '#fff4dc');
    if (itemKind === 'fact' && this.runner.life < MAX_LIFE) {
      this.runner.life = Math.min(MAX_LIFE, this.runner.life + HEAL_FROM_FACT);
      this.popupAt(`+${HEAL_FROM_FACT} stamina`, x, y - 52, '#7fe8e2');
    }
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
