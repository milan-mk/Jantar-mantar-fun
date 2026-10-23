import { useMemo } from 'react';
import { characterDataUri, FRAME_H, FRAME_W, type Pose } from '../game/art/characterArt';
import type { CharacterDef } from '../game/config/characters';

interface Props {
  def: CharacterDef;
  /** Defaults to the front-facing menu pose. */
  pose?: Pose;
  /** Height in CSS pixels. */
  size?: number;
  className?: string;
}

/** Shows the same SVG artwork the game uses. */
export function CharacterArt({ def, pose = 'front', size = 128, className }: Props) {
  const src = useMemo(() => characterDataUri(def, pose), [def, pose]);
  return (
    <img
      src={src}
      width={Math.round((size * FRAME_W) / FRAME_H)}
      height={size}
      alt=""
      draggable={false}
      className={className}
    />
  );
}
