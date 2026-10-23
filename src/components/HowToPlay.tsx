import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronLeft, Pause } from 'lucide-react';
import type { ReactNode } from 'react';
import { CHARACTERS } from '../game/config/characters';
import type { CharacterId } from '../types';
import { CharacterArt } from './CharacterArt';
import { Button } from './ui';

interface Props {
  character: CharacterId;
  reducedMotion: boolean;
  onBack: () => void;
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-7 items-center justify-center rounded-lg border-b-4 border-black/40 bg-cream px-2 py-1 text-sm font-black text-navy-900">
      {children}
    </kbd>
  );
}

export function HowToPlay({ character, reducedMotion, onBack }: Props) {
  const def = CHARACTERS[character];
  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center gap-5 px-4 py-6">
      <h2 className="text-3xl font-black uppercase text-saffron sm:text-4xl">How to play</h2>
      <p className="max-w-2xl text-center text-sm text-cream/90">
        Run down the street to <b>Jantar Mantar</b>. You have 1,200 metres, and a stamina bar that the red tape wants to
        drain. Reach the finish arch before it hits zero.
      </p>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <section className="flex items-center gap-4 rounded-3xl bg-navy-800 p-4">
          <div className={reducedMotion ? '' : 'dd-bob'}>
            <CharacterArt def={def} pose="jump" size={104} />
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold">
              <ArrowUp size={20} className="text-saffron" aria-hidden /> Jump
            </h3>
            <p className="text-sm text-cream/85">Hop over barricades, cones and puddles. High tokens need a jump too.</p>
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs"><Key>Space</Key> or the <b>JUMP</b> button</p>
          </div>
        </section>

        <section className="flex items-center gap-4 rounded-3xl bg-navy-800 p-4">
          <CharacterArt def={def} pose="run0" size={104} />
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold">
              <ArrowLeft size={18} className="text-saffron" aria-hidden />
              <ArrowRight size={18} className="text-saffron" aria-hidden /> Steer and run
            </h3>
            <p className="text-sm text-cream/85">You stand still until you hold the up arrow. Hold it to run, let go to stop, and use left / right to steer through the gaps. If you are caught, mash Space to wriggle free. A faint cyan runner is your best run so far: race it! Grab megaphones to slow the guards, watch for crossing rickshaws and tough checkpoints, and finish daily missions to unlock a new runner.</p>
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs">
              <Key>←</Key><Key>→</Key><Key>↑</Key><Key>↓</Key> or <Key>WASD</Key>, or drag the joystick
            </p>
          </div>
        </section>
      </div>

      <section className="grid w-full gap-3 rounded-3xl bg-navy-800 p-4 text-sm sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-base font-extrabold text-saffron">Watch out</h3>
          <ul className="space-y-1 text-cream/90">
            <li><b>Paperwork officials</b>: catch you and you are stuck in the queue for 5 seconds</li>
            <li><b>Rubber-stamp squad</b>: a REJECTED stamp costs 50% stamina</li>
            <li><b>Barricades</b>: jump them (or lose 15%)</li>
            <li>Rickshaws, paper piles and cones block lanes. Puddles slow you down</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-base font-extrabold text-saffron">Collect</h3>
          <ul className="space-y-1 text-cream/90">
            <li>Tokens 10, megaphones 25, placards 40 points</li>
            <li>Fact-check tokens: 60 points and +8% stamina</li>
            <li><b>Fact Check Shield</b>: absorbs one hit (12 s)</li>
            <li><b>Community Boost</b>: double item points (10 s)</li>
            <li><b>Energy Boost</b>: faster, higher jumps, bonus distance score (7 s)</li>
          </ul>
        </div>
        <p className="flex items-center gap-2 text-cream/90 sm:col-span-2">
          <Pause size={16} aria-hidden /> Press <Key>Esc</Key> or the pause button to pause. The street gets busier the
          closer you get. <ArrowDown size={14} className="sr-only" aria-hidden />
        </p>
      </section>

      <Button variant="primary" icon={<ChevronLeft size={20} aria-hidden />} onClick={onBack}>
        Back
      </Button>
    </main>
  );
}
