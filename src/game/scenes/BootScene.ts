import Phaser from 'phaser';
import { ALL_ASSETS } from '../art';
import { ALL_POSES, FRAME_H, FRAME_W, RES, characterSvg, textureKey } from '../art/characterArt';
import { addSvgTexture } from '../art/rasterize';
import { CHARACTERS } from '../config/characters';
import type { GameOptions } from '../config/options';

export const BOOT_SCENE_KEY = 'Boot';
export const GAME_SCENE_KEY = 'Game';

/** Generates every texture from code, then hands over to the game scene. */
export class BootScene extends Phaser.Scene {
  private cancelled = false;

  constructor(private readonly opts: GameOptions) {
    super(BOOT_SCENE_KEY);
  }

  create(): void {
    this.cancelled = false;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cancelled = true;
    });
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      this.cancelled = true;
    });
    void this.buildTextures();
  }

  private async buildTextures(): Promise<void> {
    try {
      const jobs: Array<Promise<void>> = [];
      for (const asset of ALL_ASSETS) {
        jobs.push(addSvgTexture(this, asset.key, asset.svg, asset.w, asset.h));
      }
      // Only the chosen runner's poses are needed during a run.
      const def = CHARACTERS[this.opts.character];
      for (const pose of ALL_POSES) {
        if (pose === 'front') continue;
        jobs.push(addSvgTexture(this, textureKey(def, pose), characterSvg(def, pose), FRAME_W * RES, FRAME_H * RES));
      }
      await Promise.all(jobs);
      if (this.cancelled) return;
      this.scene.start(GAME_SCENE_KEY);
    } catch (err) {
      if (this.cancelled) return;
      const message = err instanceof Error ? err.message : 'Artwork failed to load';
      this.opts.bridge.emit('error', message);
    }
  }
}
