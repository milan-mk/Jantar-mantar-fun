import { BookOpen, Play, Settings as SettingsIcon, Trophy, Users } from 'lucide-react';
import { CHARACTERS } from '../game/config/characters';
import type { CharacterId } from '../types';
import { CharacterArt } from './CharacterArt';
import { Button } from './ui';

interface Props {
  character: CharacterId;
  bestScore: number;
  reducedMotion: boolean;
  onPlay: () => void;
  onSelect: () => void;
  onHowTo: () => void;
  onSettings: () => void;
}

export function MenuScreen({ character, bestScore, reducedMotion, onPlay, onSelect, onHowTo, onSettings }: Props) {
  const def = CHARACTERS[character];
  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center gap-5 px-4 py-6 text-center">
      <header>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight text-saffron drop-shadow-[0_4px_0_#0b1530] sm:text-7xl">
          Democracy <span className="text-cream">Dash</span>
        </h1>
        <p className="mt-3 text-base font-semibold text-cream/90 sm:text-xl">
          Run for your voice. Play for the people.
        </p>
        <p className="mt-1 text-sm text-cream/80">Dodge the red tape and reach Jantar Mantar before your stamina runs out.</p>
      </header>

      <div className="flex flex-col items-center gap-1">
        <div className={reducedMotion ? '' : 'dd-bob'}>
          <CharacterArt def={def} size={190} />
        </div>
        <div className="h-3 w-32 rounded-full bg-black/40 blur-[2px]" aria-hidden />
        <p className="mt-2 text-lg font-bold">{def.name}</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button variant="primary" className="py-4 text-xl" icon={<Play size={22} aria-hidden />} onClick={onPlay} autoFocus>
          Play
        </Button>
        <div className="grid grid-cols-3 gap-3">
          <Button variant="ghost" className="flex-col gap-1 px-2 text-sm" icon={<Users size={20} aria-hidden />} onClick={onSelect}>
            Character
          </Button>
          <Button variant="ghost" className="flex-col gap-1 px-2 text-sm" icon={<BookOpen size={20} aria-hidden />} onClick={onHowTo}>
            How to Play
          </Button>
          <Button variant="ghost" className="flex-col gap-1 px-2 text-sm" icon={<SettingsIcon size={20} aria-hidden />} onClick={onSettings}>
            Settings
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-navy-800 px-4 py-2 text-lg font-bold">
        <Trophy size={20} className="text-saffron" aria-hidden />
        Best score: <span className="text-saffron">{bestScore.toLocaleString()}</span>
      </div>

      <p className="max-w-xl text-xs leading-relaxed text-cream/75">
        Democracy Dash is a fictional, satirical arcade game inspired by the idea of peaceful civic participation. All
        characters, scores, slogans and events are invented game content and are not factual reporting about any real
        person, group or event.
      </p>
    </main>
  );
}
