import { BookOpen, CalendarDays, Check, Flame, Play, Settings as SettingsIcon, Trophy, Users } from 'lucide-react';
import { CHARACTERS } from '../game/config/characters';
import type { Mission } from '../lib/progress';
import { ACHIEVEMENTS } from '../lib/progress';
import type { CharacterId, Progress } from '../types';
import { CharacterArt } from './CharacterArt';
import { Button } from './ui';

interface Props {
  character: CharacterId;
  bestScore: number;
  progress: Progress;
  missions: Mission[];
  dailyBest: number;
  dailyKey: string;
  reducedMotion: boolean;
  onPlay: () => void;
  onDaily: () => void;
  onSelect: () => void;
  onHowTo: () => void;
  onSettings: () => void;
}

export function MenuScreen({ character, bestScore, progress, missions, dailyBest, dailyKey, reducedMotion, onPlay, onDaily, onSelect, onHowTo, onSettings }: Props) {
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
        <Button variant="secondary" className="flex-col gap-0 py-2" icon={<CalendarDays size={20} aria-hidden />} onClick={onDaily}>
          <span>Daily Challenge</span>
          <span className="text-xs font-bold opacity-75">
            {dailyKey} &middot; same street for everyone &middot; best {dailyBest.toLocaleString()}
          </span>
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

      <section className="w-full max-w-sm rounded-2xl border border-cream/20 bg-navy-800/80 p-3 text-left" aria-label="Today's missions">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-saffron">Today&apos;s missions</h2>
          <span className="flex items-center gap-1 text-sm font-bold text-[#ffb347]">
            <Flame size={16} aria-hidden /> {progress.streak.count}-day streak
          </span>
        </div>
        <ul className="flex flex-col gap-1 text-sm">
          {missions.map((m) => {
            const done = progress.missionsDone.date === dailyKey && progress.missionsDone.ids.includes(m.id);
            return (
              <li key={m.id} className={`flex items-center gap-2 ${done ? 'text-[#7fe8e2]' : 'text-cream/90'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${done ? 'border-[#7fe8e2] bg-[#7fe8e2]/20' : 'border-cream/40'}`}>
                  {done && <Check size={14} aria-hidden />}
                </span>
                <span className={done ? 'line-through' : ''}>{m.text}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-cream/70">
          {progress.missionsTotal} missions done in total &middot; {progress.achievements.length}/{ACHIEVEMENTS.length} badges
        </p>
      </section>

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
