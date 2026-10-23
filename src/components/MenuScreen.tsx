import { BookOpen, CalendarDays, Check, Flame, Play, Settings as SettingsIcon, Trophy, Users } from 'lucide-react';
import { CHARACTERS } from '../game/config/characters';
import type { Mission } from '../lib/progress';
import { ACHIEVEMENTS } from '../lib/progress';
import type { CharacterId, Progress } from '../types';
import { CharacterArt } from './CharacterArt';

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

export function MenuScreen({
  character,
  bestScore,
  progress,
  missions,
  dailyBest,
  dailyKey,
  reducedMotion,
  onPlay,
  onDaily,
  onSelect,
  onHowTo,
  onSettings,
}: Props) {
  const def = CHARACTERS[character];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#2b1f1d]">
      {/* Delhi Street Road Backdrop matching CharacterSelect */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <svg
          className="h-full w-full object-cover"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="menuSkyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d4f6d" />
              <stop offset="35%" stopColor="#c87f59" />
              <stop offset="65%" stopColor="#f3be82" />
              <stop offset="100%" stopColor="#a8745d" />
            </linearGradient>

            <linearGradient id="menuRoadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#282a36" />
              <stop offset="100%" stopColor="#181921" />
            </linearGradient>

            <pattern id="menuPaver" width="16" height="12" patternUnits="userSpaceOnUse">
              <rect width="16" height="12" fill="#8f6b53" />
              <rect x="0" y="0" width="15" height="5" fill="#a07a60" />
              <rect x="0" y="6" width="7" height="5" fill="#7d5a44" />
              <rect x="8" y="6" width="7" height="5" fill="#957056" />
            </pattern>
          </defs>

          {/* Sky */}
          <rect width="1200" height="280" fill="url(#menuSkyGrad)" />

          {/* Left Pavement */}
          <polygon points="0,270 420,270 240,700 0,700" fill="url(#menuPaver)" opacity="0.85" />

          {/* Right Pavement */}
          <polygon points="1200,270 780,270 960,700 1200,700" fill="url(#menuPaver)" opacity="0.85" />

          {/* Perspective Main Road */}
          <polygon points="420,270 780,270 960,700 240,700" fill="url(#menuRoadGrad)" />

          {/* Road Curb Lines */}
          <line x1="420" y1="270" x2="240" y2="700" stroke="#f2c94c" strokeWidth="6" opacity="0.85" />
          <line x1="780" y1="270" x2="960" y2="700" stroke="#f2c94c" strokeWidth="6" opacity="0.85" />

          {/* Lane Markers */}
          <line x1="540" y1="270" x2="480" y2="700" stroke="#ffffff" strokeWidth="5" strokeDasharray="24 24" opacity="0.65" />
          <line x1="660" y1="270" x2="720" y2="700" stroke="#ffffff" strokeWidth="5" strokeDasharray="24 24" opacity="0.65" />
          <line x1="600" y1="270" x2="600" y2="700" stroke="#ffd23f" strokeWidth="6" strokeDasharray="30 20" opacity="0.8" />

          {/* Left Building with Photostat sign */}
          <g transform="translate(-10, 60)">
            <rect x="0" y="40" width="220" height="240" fill="#a8715a" stroke="#1d1424" strokeWidth="3" />
            <rect x="15" y="110" width="190" height="38" rx="4" fill="#3b2b2b" stroke="#1d1424" strokeWidth="2.5" />
            <rect x="20" y="114" width="180" height="30" fill="#fff5e0" />
            <text x="110" y="135" fill="#1d1424" fontFamily="Impact, 'Arial Black', sans-serif" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="2">
              PHOTOSTAT
            </text>
            <rect x="25" y="155" width="170" height="110" fill="#241b18" />
          </g>

          {/* Right Building with Delhi Sweets sign */}
          <g transform="translate(980, 50)">
            <rect x="10" y="40" width="240" height="250" fill="#b88358" stroke="#1d1424" strokeWidth="3" />
            <rect x="20" y="120" width="200" height="42" rx="4" fill="#7a2424" stroke="#1d1424" strokeWidth="2.5" />
            <rect x="25" y="125" width="190" height="32" fill="#ffd97d" />
            <text x="120" y="148" fill="#851818" fontFamily="'Noto Sans Devanagari', 'Yatra One', sans-serif" fontSize="20" fontWeight="900" textAnchor="middle">
              दिल्ली स्वीट्स
            </text>
            <rect x="30" y="170" width="180" height="110" fill="#2d1e1c" />
          </g>

          {/* Roadside Trees */}
          <g transform="translate(150, 160)">
            <rect x="35" y="70" width="18" height="90" fill="#5a3825" />
            <circle cx="44" cy="50" r="42" fill="#2d6a4f" opacity="0.9" />
            <circle cx="20" cy="65" r="30" fill="#1b4332" opacity="0.95" />
            <circle cx="68" cy="65" r="32" fill="#40916c" opacity="0.9" />
          </g>
          <g transform="translate(910, 150)">
            <rect x="35" y="70" width="18" height="90" fill="#5a3825" />
            <circle cx="44" cy="50" r="44" fill="#2d6a4f" opacity="0.9" />
            <circle cx="20" cy="65" r="32" fill="#1b4332" opacity="0.95" />
            <circle cx="70" cy="65" r="34" fill="#40916c" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* Main Foreground Content */}
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-between px-4 py-6 text-center">
        {/* Header */}
        <header className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-[#dc2626] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_#000]">
              द जंतर मंतर रन
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-black/40 bg-black/75 px-3 py-1 text-xs font-bold text-white shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#ef4444] animate-pulse" />
              Live City Street
            </span>
          </div>

          <h1 className="text-5xl font-black uppercase tracking-tight text-[#f59e0b] drop-shadow-[0_4px_0_#18181b] sm:text-7xl">
            Jantar <span className="text-[#fffdf7]">Dash</span>
          </h1>

          <p className="mt-2 text-base font-bold text-[#fffdf7] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] sm:text-lg">
            Run for your voice. Play for the people.
          </p>
          <p className="mt-0.5 text-xs font-medium text-amber-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            Dodge police vans, barricades, lathi squads & tear gas to reach Jantar Mantar!
          </p>
        </header>

        {/* Selected Runner Spotlight */}
        <section className="my-3 flex flex-col items-center" aria-label="Selected Runner">
          <div className={`relative ${reducedMotion ? '' : 'dd-bob'}`}>
            <CharacterArt def={def} size={190} />
          </div>
          <div className="h-3.5 w-36 rounded-full bg-black/60 blur-[3px]" aria-hidden />

          <div className="mt-2.5 flex items-center gap-2">
            <span className="rounded-xl border-2 border-black bg-[#fffdf7] px-4 py-1 text-base font-black uppercase text-zinc-900 shadow-[2px_2px_0px_#000]">
              {def.name}
            </span>
            <button
              type="button"
              onClick={onSelect}
              className="rounded-xl border-2 border-black bg-[#f59e0b] px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] transition hover:bg-[#fbbf24] active:translate-y-0.5"
            >
              Change
            </button>
          </div>
          <p className="mt-1 text-xs font-semibold text-cream/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-xs">
            {def.blurb}
          </p>
        </section>

        {/* Action Buttons */}
        <div className="flex w-full max-w-sm flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlay}
            autoFocus
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-[3px] border-black bg-[#f59e0b] py-3.5 text-2xl font-black uppercase text-black shadow-[5px_5px_0px_#000] transition hover:-translate-y-0.5 hover:bg-[#fbbf24] active:translate-y-1 active:shadow-[2px_2px_0px_#000]"
          >
            <Play size={26} strokeWidth={3} aria-hidden /> PLAY
          </button>

          <button
            type="button"
            onClick={onDaily}
            className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-black bg-[#fffdf7] py-2 text-black shadow-[3.5px_3.5px_0px_#000] transition hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <span className="flex items-center gap-2 text-sm font-black uppercase">
              <CalendarDays size={18} aria-hidden /> Daily Challenge
            </span>
            <span className="text-[11px] font-bold text-zinc-600">
              {dailyKey} &middot; same street for everyone &middot; best {dailyBest.toLocaleString()}
            </span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onSelect}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-black bg-[#fffdf7] p-2 text-xs font-black uppercase text-zinc-900 shadow-[3px_3px_0px_#000] transition hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Users size={18} aria-hidden /> Protesters
            </button>
            <button
              type="button"
              onClick={onHowTo}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-black bg-[#fffdf7] p-2 text-xs font-black uppercase text-zinc-900 shadow-[3px_3px_0px_#000] transition hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <BookOpen size={18} aria-hidden /> How to Play
            </button>
            <button
              type="button"
              onClick={onSettings}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-black bg-[#fffdf7] p-2 text-xs font-black uppercase text-zinc-900 shadow-[3px_3px_0px_#000] transition hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <SettingsIcon size={18} aria-hidden /> Settings
            </button>
          </div>
        </div>

        {/* Missions Section */}
        <section
          className="mt-4 w-full max-w-sm rounded-2xl border-2 border-black bg-[#fffdf7]/95 p-3.5 text-left text-zinc-900 shadow-[4px_4px_0px_#000]"
          aria-label="Today's missions"
        >
          <div className="mb-2 flex items-center justify-between border-b border-black/15 pb-1.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-red-700">Today&apos;s Missions</h2>
            <span className="flex items-center gap-1 text-xs font-extrabold text-amber-700">
              <Flame size={15} className="text-amber-500 fill-amber-500" aria-hidden /> {progress.streak.count}-day streak
            </span>
          </div>

          <ul className="flex flex-col gap-1.5 text-xs font-bold text-zinc-800">
            {missions.map((m) => {
              const done = progress.missionsDone.date === dailyKey && progress.missionsDone.ids.includes(m.id);
              return (
                <li key={m.id} className={`flex items-center gap-2 ${done ? 'text-emerald-700 line-through' : ''}`}>
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-2 border-black ${
                      done ? 'bg-emerald-500 text-white' : 'bg-white'
                    }`}
                  >
                    {done && <Check size={12} strokeWidth={3} aria-hidden />}
                  </span>
                  <span>{m.text}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-2.5 flex items-center justify-between border-t border-black/15 pt-2 text-[10px] font-bold text-zinc-600">
            <span>{progress.missionsTotal} missions completed</span>
            <span>{progress.achievements.length}/{ACHIEVEMENTS.length} badges earned</span>
          </div>
        </section>

        {/* Best Score Pill */}
        <div className="mt-3 flex items-center gap-2 rounded-full border-2 border-black bg-[#fffdf7] px-4 py-1.5 text-sm font-black text-black shadow-[3px_3px_0px_#000]">
          <Trophy size={18} className="text-[#f59e0b] fill-[#f59e0b]" aria-hidden />
          Best Score: <span className="text-red-700 font-extrabold">{bestScore.toLocaleString()}</span>
        </div>

        {/* Satirical disclaimer */}
        <footer className="mt-4 max-w-md text-[10px] leading-tight text-cream/70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          Democracy Dash / Jantar Dash is a fictional, satirical arcade game inspired by peaceful civic participation. All
          characters, slogans and events are invented game content.
        </footer>
      </main>
    </div>
  );
}
