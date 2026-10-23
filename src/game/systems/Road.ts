import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, HORIZON_Y, VIEW_DIST } from '../config/constants';
import { xAt, yAt } from './Projection';

const Z_NEAR = -2.4;
const Z_FAR = VIEW_DIST + 40;

type G = Phaser.GameObjects.Graphics;

function quad(g: G, u0: number, u1: number, z0: number, z1: number, camX: number): void {
  g.beginPath();
  g.moveTo(xAt(u0, z0, camX), yAt(z0));
  g.lineTo(xAt(u1, z0, camX), yAt(z0));
  g.lineTo(xAt(u1, z1, camX), yAt(z1));
  g.lineTo(xAt(u0, z1, camX), yAt(z1));
  g.closePath();
  g.fillPath();
}

/** Calls `fn` for every band of `len` metres that is visible, keyed to world distance so bands scroll. */
function bands(dist: number, len: number, fn: (z0: number, z1: number, index: number) => void): void {
  const first = Math.floor((Z_NEAR + dist) / len);
  for (let k = first; ; k++) {
    const z0 = k * len - dist;
    if (z0 > Z_FAR) break;
    fn(Math.max(z0, Z_NEAR), Math.min(z0 + len, Z_FAR), k);
  }
}

/**
 * Draws the street (asphalt, kerbs, pavements, lane markings) in perspective.
 * Called every frame; everything is positioned from the distance travelled,
 * so the road appears to rush toward the camera.
 */
export function drawRoad(g: G, dist: number, camX: number): void {
  g.clear();

  // Base colour behind everything below the horizon.
  g.fillStyle(0x5d5560, 1);
  g.fillRect(0, HORIZON_Y, GAME_WIDTH, GAME_HEIGHT - HORIZON_Y);

  // Ground behind the pavements (hidden by the buildings).
  g.fillStyle(0x5a3b35, 1);
  quad(g, 1.3, 7, Z_NEAR, Z_FAR, camX);
  quad(g, -7, -1.3, Z_NEAR, Z_FAR, camX);

  // Asphalt
  bands(dist, 4, (z0, z1, k) => {
    g.fillStyle(k % 2 === 0 ? 0x4a4a52 : 0x43434b, 1);
    quad(g, -1, 1, z0, z1, camX);
  });

  // Brick pavements
  bands(dist, 1.6, (z0, z1, k) => {
    g.fillStyle(k % 2 === 0 ? 0xa8563b : 0x984c34, 1);
    quad(g, 1.07, 1.3, z0, z1, camX);
    quad(g, -1.3, -1.07, z0, z1, camX);
  });

  // Yellow and black kerbs
  bands(dist, 3, (z0, z1, k) => {
    g.fillStyle(k % 2 === 0 ? 0xe8b92f : 0x1c1c1c, 1);
    quad(g, 1, 1.07, z0, z1, camX);
    quad(g, -1.07, -1, z0, z1, camX);
  });

  // Dashed lane lines
  g.fillStyle(0xe8e2d0, 0.9);
  bands(dist, 6, (z0, z1, k) => {
    const dashEnd = Math.min(z1, k * 6 - dist + 2.6);
    if (dashEnd <= z0) return;
    for (const u of [-0.5, 0, 0.5]) quad(g, u - 0.013, u + 0.013, z0, dashEnd, camX);
  });
}
