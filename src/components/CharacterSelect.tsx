import { ArrowLeft, Check } from 'lucide-react';
import { CHARACTER_LIST } from '../game/config/characters';
import type { CharacterId } from '../types';
import { CharacterArt } from './CharacterArt';

interface Props {
  selected: CharacterId;
  onPick: (id: CharacterId) => void;
  onBack: () => void;
}

const TINTS: Record<CharacterId, string> = {
  neha: 'bg-amber-100/60 border-amber-200',
  abhijit: 'bg-blue-100/60 border-blue-200',
  nsui: 'bg-sky-100/60 border-sky-200',
  genz: 'bg-emerald-100/60 border-emerald-200',
  ex_minister: 'bg-orange-100/60 border-orange-200',
  wheelchair: 'bg-cyan-100/60 border-cyan-200',
  chhota: 'bg-purple-100/60 border-purple-200',
  student: 'bg-amber-100/60 border-amber-200',
  artist: 'bg-teal-100/60 border-teal-200',
  checker: 'bg-slate-100/60 border-slate-200',
};

export function CharacterSelect({ selected, onPick, onBack }: Props) {
  return (
    <main className="relative mx-auto flex min-h-screen w-full flex-col justify-between overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6">
      {/* Top Bar with Back Button and Header */}
      <div className="relative flex w-full flex-col items-center">
        {/* Back Button (Top Left) */}
        <button
          type="button"
          onClick={onBack}
          className="self-start sm:absolute sm:left-2 sm:top-0 flex items-center gap-1 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5 hover:-translate-y-0.5 z-20 cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={3} aria-hidden />
          <span>Back</span>
        </button>

        {/* Title: Hindi Calligraphy & English Subtitle */}
        <div className="mt-2 sm:mt-0 flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-[#f59e0b] drop-shadow-[0_3px_0_#0b1530] tracking-wide font-sans">
            कौन चलेगा?
          </h2>
          <span className="mt-0.5 rounded-md border border-black/30 bg-[#fffdf7]/90 px-3 py-0.5 text-xs sm:text-sm font-black uppercase tracking-widest text-[#18181b] shadow-[1px_1px_0px_#000]">
            PICK YOUR PROTESTER
          </span>
        </div>
      </div>

      {/* Protester Cards Container */}
      <div
        role="radiogroup"
        aria-label="Protester Selection"
        className="my-5 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 max-w-7xl mx-auto items-stretch"
      >
        {CHARACTER_LIST.map((c) => {
          const active = c.id === selected;
          const tint = TINTS[c.id] ?? 'bg-amber-100/60 border-amber-200';
          const speedPct = Math.round((c.bars.speed / 5) * 100);

          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onPick(c.id)}
              className={`group relative flex flex-col items-center justify-between rounded-2xl border-[2.5px] p-2.5 sm:p-3 text-center transition-all cursor-pointer ${
                active
                  ? 'border-[#f59e0b] bg-[#fffaed] ring-4 ring-[#f59e0b]/50 shadow-[5px_5px_0px_#18181b] -translate-y-1'
                  : 'border-[#18181b] bg-[#fffdf7] shadow-[3.5px_3.5px_0px_#18181b] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#18181b]'
              }`}
            >
              {/* Selected Badge */}
              {active && (
                <span className="absolute -top-2.5 right-2 flex items-center gap-0.5 rounded-full border-2 border-black bg-[#f59e0b] px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000] z-10">
                  <Check size={11} strokeWidth={3} aria-hidden /> Picked
                </span>
              )}

              {/* Character Illustration Frame */}
              <div
                className={`relative flex h-36 w-full items-center justify-center rounded-xl border border-black/15 overflow-hidden transition-transform duration-200 group-hover:scale-105 ${tint}`}
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
                  backgroundSize: '8px 8px',
                }}
              >
                <CharacterArt def={c} size={116} />
              </div>

              {/* Character Name */}
              <h3 className="mt-2 text-sm sm:text-base font-black uppercase tracking-wide text-[#18181b] line-clamp-1">
                {c.name}
              </h3>

              {/* Blurb / Tagline */}
              <p className="my-1 flex min-h-[2.4rem] items-center text-center text-[11px] leading-tight text-zinc-700 font-medium px-1">
                {c.blurb}
              </p>

              {/* Speed Meter */}
              <div className="mt-auto flex w-full items-center gap-1.5 pt-1 border-t border-black/10">
                <span className="text-[9px] font-black tracking-wider uppercase text-zinc-800">
                  SPEED
                </span>
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full border border-black/40 bg-zinc-200"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-[#dc2626] transition-all"
                    style={{ width: `${speedPct}%` }}
                  />
                </div>
                <span className="sr-only">Speed {speedPct}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Bar: Legend and Badges */}
      <footer className="mt-auto flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between border-t border-black/20 pt-3 text-xs">
        {/* Left Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-black/30 bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#ef4444] animate-pulse" />
            61,858 clicks
          </span>
          <span className="rounded border-2 border-black bg-[#dc2626] px-2 py-0.5 font-black text-white shadow-[2px_2px_0px_#000]">
            द जंतर मंतर रन
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-extrabold text-[#18181b] bg-[#fffdf7]/90 px-3 py-1 rounded-xl border border-black/20 shadow-[2px_2px_0px_#000]">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4] border border-black/40" />
            Police = 5 sec van ride
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316] border border-black/40" />
            Stick squad = -50% जान
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#eab308] border border-black/40" />
            Barricade = jump it
          </span>
        </div>

        {/* Right Badge */}
        <div className="flex items-center gap-2 text-right">
          <div className="rounded-lg border border-black/30 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-zinc-900 shadow-[2px_2px_0px_#000]">
            <span className="block text-[10px] text-zinc-500 font-normal">Created for</span>
            <span>Jantar Mantar Run</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
