import Phaser from 'phaser';
import { DETENTION_TEX } from '../art/detentionArt';
import { ROAD_TEX } from '../art/roadArt';
import { DETAIN_MS, GAME_WIDTH, PLAYER_Y } from '../config/constants';
import type { Runner } from '../entities/Runner';

/**
 * The "caught" cut-scene, played while the runner is frozen: a patrol van
 * slides in, two officials walk the runner to it, a news reporter sprints in
 * from the side, and comic captions pop up. Driven by update(dtMs) (not
 * tweens), so it freezes with the scene when the game is paused.
 *
 * All characters and captions are fictional. Change the strings in BEATS.
 */

type Style = 'burst' | 'bubble';
interface Beat {
  at: number;
  len: number;
  text: string;
  style: Style;
  fill: number;
  /** Where the caption appears: the runner, the reporter or the van. */
  anchor: 'runner' | 'reporter' | 'van';
  dy: number;
}

const NAVY = 0x0b1530;
const CREAM = 0xfff4dc;

const BEATS: readonly Beat[] = [
  { at: 250, len: 1150, text: 'PAKDA GAYA!', style: 'burst', fill: 0x4cc9f0, anchor: 'runner', dy: -230 },
  { at: 1300, len: 1200, text: 'Main kuch galat nahi kar raha!', style: 'bubble', fill: CREAM, anchor: 'runner', dy: -190 },
  { at: 1750, len: 1500, text: 'Breaking! Live aa raha hoon!', style: 'bubble', fill: CREAM, anchor: 'reporter', dy: -200 },
  { at: 2050, len: 750, text: 'THUD!', style: 'burst', fill: 0xff9f1c, anchor: 'van', dy: -150 },
  { at: 2500, len: 1000, text: 'UTHAO ISSE!', style: 'burst', fill: 0x4cc9f0, anchor: 'runner', dy: -240 },
  { at: 3200, len: 900, text: 'EK, DO, TEEN... DHAPP!', style: 'burst', fill: 0xffd23f, anchor: 'van', dy: -190 },
  { at: 3950, len: 1050, text: 'RIHA! BACH GAYA!', style: 'burst', fill: 0x20c9a6, anchor: 'runner', dy: -230 },
];

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const easeOut = (v: number): number => 1 - Math.pow(1 - clamp01(v), 3);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * clamp01(t);
/** Progress 0..1 of `t` inside the window [from, to]. */
const win = (t: number, from: number, to: number): number => clamp01((t - from) / (to - from));

const VAN_W = 270;
const GUARD_H = 178;
const REPORTER_H = 176;

interface LiveCaption {
  beat: Beat;
  node: Phaser.GameObjects.Container;
}

export class DetentionSequence {
  private active = false;
  private t = 0;
  private side = 1;
  private runnerX = 0;
  private baseY = PLAYER_Y + 26;

  private van!: Phaser.GameObjects.Image;
  private reporter!: Phaser.GameObjects.Image;
  private reporterTag!: Phaser.GameObjects.Text;
  private guards: Phaser.GameObjects.Image[] = [];
  private captions: LiveCaption[] = [];
  private nextBeat = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly runner: Runner,
    private readonly reduced: () => boolean,
  ) {}

  get running(): boolean {
    return this.active;
  }

  start(): void {
    this.stop();
    this.active = true;
    this.t = 0;
    this.nextBeat = 0;
    this.runnerX = this.runner.screenX;
    // The van arrives from the nearer screen edge, the reporter from the other.
    this.side = this.runnerX > GAME_WIDTH / 2 ? -1 : 1;

    this.van = this.scene.add.image(0, this.baseY, DETENTION_TEX.van).setOrigin(0.5, 1).setDepth(1120);
    this.van.setDisplaySize(VAN_W, (VAN_W * 150) / 220);
    this.van.setFlipX(this.side === 1);

    this.reporter = this.scene.add.image(0, this.baseY + 10, DETENTION_TEX.reporter0).setOrigin(0.5, 1).setDepth(1130);
    this.reporter.setDisplaySize((REPORTER_H * 80) / 150, REPORTER_H);
    this.reporterTag = this.scene.add
      .text(0, 0, 'LIVE NEWS', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#fff4dc',
        backgroundColor: '#d64545',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(1131);

    for (let i = 0; i < 2; i++) {
      const g = this.scene.add.image(0, this.baseY, ROAD_TEX.clerk0).setOrigin(0.5, 1).setDepth(1110 + i);
      g.setDisplaySize((GUARD_H * 80) / 150, GUARD_H);
      this.guards.push(g);
    }
    this.layout();
  }

  /** Call every frame with the frame time in ms. */
  update(dtMs: number): void {
    if (!this.active) return;
    this.t += dtMs;
    this.spawnBeats();
    this.layout();
    this.animateCaptions();
    if (this.t >= DETAIN_MS + 200 || this.runner.detainedMs <= 0) this.stop();
  }

  stop(): void {
    this.active = false;
    for (const c of this.captions) c.node.destroy();
    this.captions = [];
    for (const g of this.guards) g.destroy();
    this.guards = [];
    this.van?.destroy();
    this.reporter?.destroy();
    this.reporterTag?.destroy();
    this.runner.offsetX = 0;
    this.runner.fade = 1;
  }

  // ---------------------------------------------------------------- layout

  private edge(side: number): number {
    return side === 1 ? GAME_WIDTH + 190 : -190;
  }

  private layout(): void {
    const t = this.t;
    const R = this.runnerX;

    // Van: slides in, waits, drives away at the very end.
    const vanStop = Phaser.Math.Clamp(R + this.side * 250, 160, GAME_WIDTH - 160);
    const vanX = t < 3900 ? lerp(this.edge(this.side), vanStop, easeOut(win(t, 0, 750))) : lerp(vanStop, this.edge(this.side), easeOut(win(t, 4300, 5000)));
    this.van.setX(vanX);
    const door = vanX - this.side * 70;

    // Runner: walked to the van door, hidden inside, then released.
    let offset = 0;
    let fade = 1;
    if (t >= 1100 && t < 1900) {
      const p = easeOut(win(t, 1100, 1900));
      offset = (door - R) * p;
      fade = 1 - win(t, 1650, 1900);
    } else if (t >= 1900 && t < 3900) {
      offset = door - R;
      fade = 0;
    } else if (t >= 3900) {
      const p = easeOut(win(t, 3900, 4500));
      offset = (door - R) * (1 - p);
      fade = p;
    }
    this.runner.offsetX = offset;
    this.runner.fade = fade;

    // Officials: step out of the van, flank the runner, return to the van.
    const walk = Math.floor(t / 130) % 2 === 0;
    const guardFrame = walk ? ROAD_TEX.clerk0 : ROAD_TEX.clerk1;
    this.guards.forEach((g, i) => {
      const flank = (i === 0 ? -1 : 1) * 58;
      let x: number;
      if (t < 500) x = door;
      else if (t < 1100) x = lerp(door, R + flank, easeOut(win(t, 500, 1100)));
      else if (t < 1900) x = lerp(R + flank, door + (i === 0 ? -34 : 34), easeOut(win(t, 1100, 1900)));
      else if (t < 3900) x = door + (i === 0 ? -34 : 34);
      else x = lerp(door + (i === 0 ? -34 : 34), door + this.side * (i === 0 ? 40 : 80), easeOut(win(t, 3900, 4500)));
      g.setX(x).setTexture(t > 500 && t < 1900 ? guardFrame : ROAD_TEX.clerk0);
      g.setAlpha(t < 450 ? 0 : 1);
      g.setFlipX(x < R);
    });

    // Reporter: sprints in from the far side, films, then sprints off.
    const rStop = Phaser.Math.Clamp(R - this.side * 230, 90, GAME_WIDTH - 90);
    const rIn = easeOut(win(t, 700, 1700));
    const rOut = easeOut(win(t, 3900, 4700));
    const rx = t < 3900 ? lerp(this.edge(-this.side), rStop, rIn) : lerp(rStop, this.edge(-this.side), rOut);
    const running = (t >= 700 && t < 1700) || t >= 3900;
    this.reporter.setX(rx);
    this.reporter.setTexture(running && Math.floor(t / 110) % 2 === 0 ? DETENTION_TEX.reporter0 : DETENTION_TEX.reporter1);
    this.reporter.setFlipX(rx > R);
    this.reporter.setAlpha(t < 700 ? 0 : 1);
    this.reporterTag.setPosition(rx, this.baseY + 10 - REPORTER_H - 12).setAlpha(t < 700 ? 0 : 1);
  }

  // -------------------------------------------------------------- captions

  private anchorX(beat: Beat): number {
    if (beat.anchor === 'reporter') return this.reporter.x;
    if (beat.anchor === 'van') return this.van.x;
    return this.runnerX;
  }

  private spawnBeats(): void {
    while (this.nextBeat < BEATS.length && this.t >= BEATS[this.nextBeat].at) {
      const beat = BEATS[this.nextBeat];
      this.nextBeat += 1;
      const x = Phaser.Math.Clamp(this.anchorX(beat), 190, GAME_WIDTH - 190);
      this.captions.push({ beat, node: this.buildCaption(beat, x, this.baseY + beat.dy) });
    }
  }

  private buildCaption(beat: Beat, x: number, y: number): Phaser.GameObjects.Container {
    const isBurst = beat.style === 'burst';
    const label = this.scene.add
      .text(0, 0, beat.text, {
        fontFamily: '"Impact", "Arial Black", "Trebuchet MS", sans-serif',
        fontSize: isBurst ? '40px' : '24px',
        fontStyle: isBurst ? 'italic bold' : 'bold',
        color: isBurst ? '#fff4dc' : '#0b1530',
        stroke: isBurst ? '#0b1530' : '#0b1530',
        strokeThickness: isBurst ? 7 : 0,
        align: 'center',
        wordWrap: { width: 330 },
      })
      .setOrigin(0.5);

    const w = label.width;
    const h = label.height;
    const g = this.scene.add.graphics();
    if (isBurst) {
      const rx = w / 2 + 46;
      const ry = h / 2 + 38;
      const pts: Phaser.Math.Vector2[] = [];
      const spikes = 14;
      for (let i = 0; i < spikes * 2; i++) {
        const a = (Math.PI * i) / spikes + 0.15;
        const k = i % 2 === 0 ? 1 : 0.72;
        pts.push(new Phaser.Math.Vector2(Math.cos(a) * rx * k, Math.sin(a) * ry * k));
      }
      g.fillStyle(beat.fill, 1).lineStyle(5, NAVY, 1);
      g.fillPoints(pts, true);
      g.strokePoints(pts, true);
    } else {
      const bw = w + 36;
      const bh = h + 22;
      g.fillStyle(beat.fill, 1).lineStyle(4, NAVY, 1);
      g.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 18);
      g.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 18);
      g.fillTriangle(-12, bh / 2 - 2, 14, bh / 2 - 2, 0, bh / 2 + 24);
      g.lineBetween(-12, bh / 2 + 1, 0, bh / 2 + 24);
      g.lineBetween(14, bh / 2 + 1, 0, bh / 2 + 24);
    }
    const node = this.scene.add.container(x, y, [g, label]).setDepth(1700);
    node.setScale(this.reduced() ? 1 : 0.2);
    return node;
  }

  private animateCaptions(): void {
    for (let i = this.captions.length - 1; i >= 0; i--) {
      const c = this.captions[i];
      const age = this.t - c.beat.at;
      if (age >= c.beat.len) {
        c.node.destroy();
        this.captions.splice(i, 1);
        continue;
      }
      const scale = this.reduced() ? 1 : Math.max(0.2, easeOut(age / 200)) * (1 + 0.12 * Math.sin(Math.min(1, age / 220) * Math.PI));
      c.node.setScale(scale);
      const tail = c.beat.len - age;
      c.node.setAlpha(tail < 160 ? tail / 160 : 1);
      if (c.beat.anchor !== 'runner') {
        c.node.x = Phaser.Math.Clamp(this.anchorX(c.beat), 190, GAME_WIDTH - 190);
      }
    }
  }
}
