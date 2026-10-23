import { ArrowUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { MoveVector } from '../types';

interface Props {
  onJump: () => void;
  onMove: (v: MoveVector) => void;
}

const RADIUS = 56;
const DEAD_ZONE = 0.18;

/**
 * Left: a drag joystick (further = faster; up sprints, down slows).
 * Right: a JUMP button. Both use pointer events with capture, so a touch
 * only ever fires once. Shown on touch devices only.
 */
export function TouchControls({ onJump, onMove }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const base = baseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      let dx = e.clientX - (rect.left + rect.width / 2);
      let dy = e.clientY - (rect.top + rect.height / 2);
      const len = Math.hypot(dx, dy);
      if (len > RADIUS) {
        dx = (dx / len) * RADIUS;
        dy = (dy / len) * RADIUS;
      }
      setKnob({ x: dx, y: dy });
      const nx = Math.abs(dx / RADIUS) < DEAD_ZONE ? 0 : dx / RADIUS;
      const ny = Math.abs(dy / RADIUS) < DEAD_ZONE ? 0 : -dy / RADIUS;
      onMove({ x: nx, y: ny });
    },
    [onMove],
  );

  const release = useCallback(() => {
    activeId.current = null;
    setKnob({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  }, [onMove]);

  // Never leave the runner drifting if the controls unmount mid-drag.
  useEffect(() => () => onMove({ x: 0, y: 0 }), [onMove]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden items-end justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] [@media(pointer:coarse)]:flex"
      style={{ touchAction: 'none' }}
    >
      <div
        ref={baseRef}
        role="group"
        aria-label="Move joystick"
        className="pointer-events-auto relative h-36 w-36 rounded-full border-2 border-cream/50 bg-navy-900/45"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          if (activeId.current !== null) return;
          e.preventDefault();
          activeId.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => {
          if (e.pointerId === activeId.current) update(e);
        }}
        onPointerUp={(e) => {
          if (e.pointerId === activeId.current) release();
        }}
        onPointerCancel={(e) => {
          if (e.pointerId === activeId.current) release();
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-16 w-16 rounded-full border-2 border-cream bg-saffron/85 shadow-lg"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>

      <button
        type="button"
        aria-label="Jump"
        onPointerDown={(e) => {
          e.preventDefault();
          onJump();
        }}
        className="pointer-events-auto flex h-24 w-28 select-none flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-cream/60 bg-saffron/85 text-lg font-black uppercase tracking-wide text-navy-900 shadow-xl active:scale-95"
        style={{ touchAction: 'none' }}
      >
        <ArrowUp size={28} aria-hidden /> Jump
      </button>
    </div>
  );
}
