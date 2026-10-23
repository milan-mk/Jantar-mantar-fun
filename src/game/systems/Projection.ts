import { CENTER_X, HORIZON_Y, PLAYER_Y, ROAD_HALF_PX, Z_CAM } from '../config/constants';

/**
 * Projects the flat street onto the screen.
 * z = metres ahead of the runner (negative once passed), u = lateral position
 * where -1 and +1 are the road edges.
 */
export function scaleAt(z: number): number {
  return Z_CAM / Math.max(1.2, Z_CAM + z);
}

export function yAt(z: number): number {
  return HORIZON_Y + (PLAYER_Y - HORIZON_Y) * scaleAt(z);
}

export function xAt(u: number, z: number, camX: number): number {
  return CENTER_X + (u - camX) * ROAD_HALF_PX * scaleAt(z);
}
