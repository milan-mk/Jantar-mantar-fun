import type { PowerUpKind } from '../../types';
import { COMMUNITY_MS, ENERGY_MS, INVULN_MS, SHIELD_MS } from '../config/constants';

/**
 * Pure bookkeeping for timed power-ups. Advanced from the scene's update
 * loop (delta based), so pausing the scene pauses every timer.
 */
export class PowerUpState {
  shieldMs = 0;
  communityMs = 0;
  energyMs = 0;
  invulnMs = 0;

  reset(): void {
    this.shieldMs = 0;
    this.communityMs = 0;
    this.energyMs = 0;
    this.invulnMs = 0;
  }

  activate(kind: PowerUpKind, shieldScale: number): void {
    if (kind === 'shield') this.shieldMs = SHIELD_MS * shieldScale;
    else if (kind === 'community') this.communityMs = COMMUNITY_MS;
    else this.energyMs = ENERGY_MS;
  }

  update(dtMs: number): void {
    this.shieldMs = Math.max(0, this.shieldMs - dtMs);
    this.communityMs = Math.max(0, this.communityMs - dtMs);
    this.energyMs = Math.max(0, this.energyMs - dtMs);
    this.invulnMs = Math.max(0, this.invulnMs - dtMs);
  }

  get hasShield(): boolean {
    return this.shieldMs > 0;
  }

  get energyActive(): boolean {
    return this.energyMs > 0;
  }

  get invulnerable(): boolean {
    return this.invulnMs > 0;
  }

  /** Collectible point multiplier (Community Boost doubles it). */
  get multiplier(): number {
    return this.communityMs > 0 ? 2 : 1;
  }

  /** Spends the shield on one hit and grants a short grace period. */
  consumeShield(): void {
    this.shieldMs = 0;
    this.invulnMs = INVULN_MS;
  }

  grantInvulnerability(ms: number): void {
    this.invulnMs = Math.max(this.invulnMs, ms);
  }
}
