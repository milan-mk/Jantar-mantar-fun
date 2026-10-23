import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config/constants';
import type { GameOptions } from './config/options';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

/** Creates the one Phaser game instance. The caller owns it and must destroy it. */
export function createGame(parent: HTMLElement, opts: GameOptions): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0b1530',
    banner: false,
    disableContextMenu: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // Audio is synthesized separately (lib/audio.ts); input arrives from React through the bridge.
    audio: { noAudio: true },
    input: { keyboard: false, gamepad: false },
    scene: [new BootScene(opts), new GameScene(opts)],
  });
}
