import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type Phaser from 'phaser';
import type { GameOptions } from '../game/config/options';

interface Props {
  optionsRef: MutableRefObject<GameOptions>;
}

/**
 * Owns the single Phaser game instance. It is created once when mounted and
 * destroyed on unmount (StrictMode's mount/unmount/mount is handled by the
 * cleanup), so restarts never stack up instances.
 */
export function GameCanvas({ optionsRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let game: Phaser.Game | null = null;
    let cancelled = false;

    // Phaser is loaded lazily so the menu appears before the large chunk arrives.
    void import('../game/createGame')
      .then(({ createGame }) => {
        if (cancelled) return;
        game = createGame(host, optionsRef.current);
      })
      .catch(() => {
        optionsRef.current.bridge.emit('error', 'The game engine failed to load. Check your connection and reload.');
      });

    return () => {
      cancelled = true;
      game?.destroy(true);
      game = null;
    };
  }, [optionsRef]);

  return <div ref={hostRef} className="game-surface h-full w-full" />;
}
