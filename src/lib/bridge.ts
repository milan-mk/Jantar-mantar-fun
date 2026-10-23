import type { BridgeEvents } from '../types';

type Args<K extends keyof BridgeEvents> = BridgeEvents[K] extends void
  ? []
  : [payload: BridgeEvents[K]];

/**
 * Minimal typed event emitter. It is the only coupling point between the
 * React UI and the Phaser game: React sends commands (jump, pause, ...),
 * Phaser sends state (hud, gameover, ...).
 */
export class Bridge {
  private listeners = new Map<keyof BridgeEvents, Set<(payload: unknown) => void>>();

  on<K extends keyof BridgeEvents>(
    event: K,
    handler: (payload: BridgeEvents[K]) => void,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    const fn = handler as (payload: unknown) => void;
    set.add(fn);
    return () => {
      set?.delete(fn);
    };
  }

  emit<K extends keyof BridgeEvents>(event: K, ...args: Args<K>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of Array.from(set)) fn(args[0]);
  }

  clear(): void {
    this.listeners.clear();
  }
}
