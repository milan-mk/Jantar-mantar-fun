import { Check, ChevronLeft } from 'lucide-react';
import { CHARACTER_LIST } from '../game/config/characters';
import type { CharacterId } from '../types';
import { CharacterArt } from './CharacterArt';
import { Button } from './ui';

interface Props {
  selected: CharacterId;
  onPick: (id: CharacterId) => void;
  onBack: () => void;
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider">
      <span className="w-14 text-left">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40" aria-hidden>
        <div className="h-full rounded-full bg-alert" style={{ width: `${value * 20}%` }} />
      </div>
      <span className="sr-only">{value} out of 5</span>
    </div>
  );
}

export function CharacterSelect({ selected, onPick, onBack }: Props) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-5 px-4 py-6">
      <h2 className="text-3xl font-black uppercase text-saffron sm:text-4xl">Choose your runner</h2>
      <p className="max-w-xl text-center text-sm text-cream/85">
        Every runner has small strengths and weaknesses. Nothing can be bought or unlocked.
      </p>
      <div role="radiogroup" aria-label="Character" className="grid w-full gap-4 sm:grid-cols-3">
        {CHARACTER_LIST.map((c) => {
          const active = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onPick(c.id)}
              className={`relative flex flex-col items-center gap-2 rounded-3xl border-4 p-4 text-center transition ${
                active ? 'border-saffron bg-navy-700' : 'border-cream/15 bg-navy-800 hover:border-cream/40'
              }`}
            >
              {active && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-saffron px-2 py-0.5 text-xs font-extrabold text-navy-900">
                  <Check size={14} aria-hidden /> Selected
                </span>
              )}
              <CharacterArt def={c} size={150} />
              <span className="text-xl font-extrabold">{c.name}</span>
              <span className="rounded-full bg-teal-dash/30 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-cream">
                {c.trait}
              </span>
              <span className="text-sm leading-snug text-cream/85">{c.blurb}</span>
              <div className="mt-1 flex w-full flex-col gap-1">
                <Bar label="Speed" value={c.bars.speed} />
                <Bar label="Agility" value={c.bars.agility} />
                <Bar label="Shield" value={c.bars.shield} />
              </div>
            </button>
          );
        })}
      </div>
      <Button variant="primary" icon={<ChevronLeft size={20} aria-hidden />} onClick={onBack}>
        Done
      </Button>
    </main>
  );
}
