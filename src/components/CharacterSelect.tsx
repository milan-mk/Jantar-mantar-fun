import { ArrowLeft, Check } from 'lucide-react';
import { CHARACTER_LIST } from '../game/config/characters';
import type { CharacterId } from '../types';
import { CharacterArt } from './CharacterArt';

interface Props {
  selected: CharacterId;
  unlocked?: CharacterId[];
  missionsTotal?: number;
  onPick: (id: CharacterId) => void;
  onBack: () => void;
}

const TINTS: Record<string, string> = {
  neha: 'bg-amber-100/70 border-amber-300',
  abhijit: 'bg-blue-100/70 border-blue-300',
  nsui: 'bg-sky-100/70 border-sky-300',
  genz: 'bg-emerald-100/70 border-emerald-300',
  ex_minister: 'bg-orange-100/70 border-orange-300',
  wheelchair: 'bg-cyan-100/70 border-cyan-300',
  chhota: 'bg-purple-100/70 border-purple-300',
  student: 'bg-amber-100/70 border-amber-300',
  artist: 'bg-teal-100/70 border-teal-300',
  checker: 'bg-slate-100/70 border-slate-300',
  climber: 'bg-emerald-100/70 border-emerald-300',
};

export function CharacterSelect({ selected, onPick, onBack }: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#2b1f1d]">
      {/* Delhi Street Road Backdrop matching the screenshot */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <svg
          className="h-full w-full object-cover"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Evening Delhi sky gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a5d7c" />
              <stop offset="35%" stopColor="#d48c66" />
              <stop offset="65%" stopColor="#f3be82" />
              <stop offset="100%" stopColor="#b4826b" />
            </linearGradient>

            {/* Road texture gradient */}
            <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#282a36" />
              <stop offset="100%" stopColor="#1e2029" />
            </linearGradient>

            {/* Pavement stone texture */}
            <pattern id="paver" width="16" height="12" patternUnits="userSpaceOnUse">
              <rect width="16" height="12" fill="#9c7860" />
              <rect x="0" y="0" width="15" height="5" fill="#ab876d" />
              <rect x="0" y="6" width="7" height="5" fill="#8f6952" />
              <rect x="8" y="6" width="7" height="5" fill="#a48066" />
            </pattern>
          </defs>

          {/* Sky */}
          <rect width="1200" height="280" fill="url(#skyGrad)" />

          {/* Left Pavement / Sidewalk */}
          <polygon points="0,270 420,270 240,700 0,700" fill="url(#paver)" opacity="0.9" />

          {/* Right Pavement / Sidewalk */}
          <polygon points="1200,270 780,270 960,700 1200,700" fill="url(#paver)" opacity="0.9" />

          {/* Perspective Main Road */}
          <polygon points="420,270 780,270 960,700 240,700" fill="url(#roadGrad)" />

          {/* Road Curb Lines */}
          <line x1="420" y1="270" x2="240" y2="700" stroke="#f2c94c" strokeWidth="6" opacity="0.85" />
          <line x1="780" y1="270" x2="960" y2="700" stroke="#f2c94c" strokeWidth="6" opacity="0.85" />

          {/* Lane Markers (Dashed White Lines) */}
          <line
            x1="540"
            y1="270"
            x2="480"
            y2="700"
            stroke="#ffffff"
            strokeWidth="5"
            strokeDasharray="24 24"
            opacity="0.75"
          />
          <line
            x1="660"
            y1="270"
            x2="720"
            y2="700"
            stroke="#ffffff"
            strokeWidth="5"
            strokeDasharray="24 24"
            opacity="0.75"
          />

          {/* Yellow Center Divider Line */}
          <line
            x1="600"
            y1="270"
            x2="600"
            y2="700"
            stroke="#ffd23f"
            strokeWidth="6"
            strokeDasharray="30 20"
            opacity="0.9"
          />

          {/* Left Buildings */}
          <g transform="translate(-10, 60)">
            <rect x="0" y="40" width="220" height="240" fill="#a8715a" stroke="#1d1424" strokeWidth="3" />
            <rect x="15" y="110" width="190" height="38" rx="4" fill="#3b2b2b" stroke="#1d1424" strokeWidth="2.5" />
            <rect x="20" y="114" width="180" height="30" fill="#fff5e0" />
            <text
              x="110"
              y="135"
              fill="#1d1424"
              fontFamily="Impact, 'Arial Black', sans-serif"
              fontSize="22"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="2"
            >
              PHOTOSTAT
            </text>
            <rect x="25" y="155" width="170" height="110" fill="#241b18" />
          </g>

          {/* Right Buildings */}
          <g transform="translate(980, 50)">
            <rect x="10" y="40" width="240" height="250" fill="#b88358" stroke="#1d1424" strokeWidth="3" />
            <rect x="20" y="120" width="200" height="42" rx="4" fill="#7a2424" stroke="#1d1424" strokeWidth="2.5" />
            <rect x="25" y="125" width="190" height="32" fill="#ffd97d" />
            <text
              x="120"
              y="148"
              fill="#851818"
              fontFamily="'Noto Sans Devanagari', 'Yatra One', sans-serif"
              fontSize="20"
              fontWeight="900"
              textAnchor="middle"
            >
              दिल्ली स्वीट्स
            </text>
            <rect x="30" y="170" width="180" height="110" fill="#2d1e1c" />
          </g>

          {/* Roadside Trees */}
          <g transform="translate(140, 160)">
            <rect x="35" y="70" width="18" height="90" fill="#5a3825" />
            <circle cx="44" cy="50" r="42" fill="#2d6a4f" opacity="0.9" />
            <circle cx="20" cy="65" r="30" fill="#1b4332" opacity="0.95" />
            <circle cx="68" cy="65" r="32" fill="#40916c" opacity="0.9" />
          </g>
          <g transform="translate(920, 150)">
            <rect x="35" y="70" width="18" height="90" fill="#5a3825" />
            <circle cx="44" cy="50" r="44" fill="#2d6a4f" opacity="0.9" />
            <circle cx="20" cy="65" r="32" fill="#1b4332" opacity="0.95" />
            <circle cx="70" cy="65" r="34" fill="#40916c" opacity="0.9" />
          </g>

          {/* Street Lamp Post */}
          <line x1="280" y1="180" x2="280" y2="400" stroke="#333a42" strokeWidth="7" />
          <path d="M280 200 Q280 160 320 160" fill="none" stroke="#333a42" strokeWidth="6" />
          <ellipse cx="320" cy="165" rx="14" ry="7" fill="#ffeaa7" stroke="#333a42" strokeWidth="2.5" />

          {/* Police Officer on Left with "PERMISSION HAI?" Speech Bubble */}
          <g transform="translate(50, 420)">
            {/* Speech Bubble */}
            <path
              d="M10 20 Q10 0 40 0 L120 0 Q150 0 150 20 L150 45 Q150 65 120 65 L85 65 L70 85 L75 65 L40 65 Q10 65 10 45 Z"
              fill="#ffffff"
              stroke="#0b1530"
              strokeWidth="3.5"
            />
            <text
              x="80"
              y="40"
              fill="#0b1530"
              fontFamily="Impact, 'Arial Black', sans-serif"
              fontSize="16"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="1"
            >
              PERMISSION HAI?
            </text>

            {/* Officer figure */}
            <g transform="translate(75, 90)">
              {/* Boots */}
              <ellipse cx="20" cy="130" rx="10" ry="5" fill="#1a1410" />
              <ellipse cx="36" cy="130" rx="10" ry="5" fill="#1a1410" />
              {/* Khaki pants */}
              <rect x="14" y="85" width="12" height="45" rx="3" fill="#a8915a" stroke="#0b1530" strokeWidth="1.6" />
              <rect x="30" y="85" width="12" height="45" rx="3" fill="#a8915a" stroke="#0b1530" strokeWidth="1.6" />
              {/* Torso */}
              <rect x="10" y="42" width="36" height="46" rx="8" fill="#c9b27a" stroke="#0b1530" strokeWidth="2" />
              <rect x="10" y="76" width="36" height="6" fill="#3b2a1d" />
              {/* Head & Cap */}
              <circle cx="28" cy="28" r="14" fill="#c98e63" stroke="#0b1530" strokeWidth="1.8" />
              <path d="M14 20 Q14 6 28 6 Q42 6 42 20Z" fill="#1c2b52" stroke="#0b1530" strokeWidth="1.6" />
              <rect x="12" y="18" width="32" height="5" rx="2" fill="#0f1a38" stroke="#0b1530" strokeWidth="1.2" />
            </g>
          </g>

          {/* Dark Vignette Overlay so cards pop */}
          <rect width="1200" height="700" fill="#0b1530" opacity="0.3" />
        </svg>
      </div>

      {/* Main UI Overlay */}
      <main className="relative z-10 mx-auto flex min-h-screen w-full flex-col justify-between px-3 py-4 sm:px-6 sm:py-6">
        {/* Top Bar with Back Button and Header */}
        <div className="relative flex w-full flex-col items-center">
          {/* Back Button (Top Left) */}
          <button
            type="button"
            onClick={onBack}
            className="self-start sm:absolute sm:left-2 sm:top-0 flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-4 py-1.5 text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5 hover:-translate-y-0.5 z-20 cursor-pointer"
          >
            <ArrowLeft size={16} strokeWidth={3} aria-hidden />
            <span>BACK</span>
          </button>

          {/* Title: Hindi Calligraphy & Subtitle Badge */}
          <div className="mt-2 sm:mt-0 flex flex-col items-center text-center">
            <h2 className="text-4xl sm:text-6xl font-black text-[#f59e0b] drop-shadow-[0_4px_0_#0b1530] tracking-wide font-sans">
              कौन चलेगा?
            </h2>
            <span className="mt-0.5 rounded-md border border-black/30 bg-[#fffdf7]/95 px-3.5 py-0.5 text-xs sm:text-sm font-black uppercase tracking-widest text-[#18181b] shadow-[1px_1px_0px_#000]">
              PICK YOUR PROTESTER
            </span>
          </div>
        </div>

        {/* 7 Protester Cards Container: 5 on Top Row, 2 Centered on Bottom Row on Desktop */}
        <div
          role="radiogroup"
          aria-label="Protester Selection"
          className="my-5 grid w-full max-w-7xl mx-auto grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 items-stretch"
        >
          {CHARACTER_LIST.map((c, idx) => {
            const active = c.id === selected;
            const tint = TINTS[c.id] ?? 'bg-amber-100/70 border-amber-300';
            const speedPct = Math.round((c.bars.speed / 5) * 100);

            // On lg screens (10 columns):
            // Cards 1-5 span 2 cols each = cols 1-10 (Row 1)
            // Card 6 starts at col 3 and spans 2 = cols 3-4 (Row 2 centered)
            // Card 7 follows and spans 2 = cols 5-6 (Row 2 centered)
            const gridPlacement =
              idx < 5
                ? 'lg:col-span-2'
                : idx === 5
                ? 'lg:col-start-3 lg:col-span-2'
                : 'lg:col-span-2';

            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onPick(c.id)}
                className={`group relative flex flex-col items-center justify-between rounded-2xl border-[2.5px] p-2.5 sm:p-3 text-center transition-all cursor-pointer ${gridPlacement} ${
                  active
                    ? 'border-[#f59e0b] bg-[#fffaed] ring-4 ring-[#f59e0b]/60 shadow-[5px_5px_0px_#18181b] -translate-y-1'
                    : 'border-[#18181b] bg-[#fffdf7] shadow-[3.5px_3.5px_0px_#18181b] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#18181b]'
                }`}
              >
                {/* Picked Check Badge */}
                {active && (
                  <span className="absolute -top-2.5 right-2 flex items-center gap-0.5 rounded-full border-2 border-black bg-[#f59e0b] px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000] z-10">
                    <Check size={11} strokeWidth={3} aria-hidden /> Picked
                  </span>
                )}

                {/* Character Illustration Frame */}
                <div
                  className={`relative flex h-36 w-full items-center justify-center rounded-xl border border-black/20 overflow-hidden transition-transform duration-200 group-hover:scale-105 ${tint}`}
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
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
                <p className="my-1 flex min-h-[2.4rem] items-center text-center text-[11px] leading-tight text-zinc-700 font-semibold px-1">
                  {c.blurb}
                </p>

                {/* Speed Meter */}
                <div className="mt-auto flex w-full items-center gap-1.5 pt-1.5 border-t border-black/15">
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

        {/* Bottom Bar: Legend, Clicks, and Credits matching screenshot */}
        <footer className="mt-auto flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between border-t border-black/20 pt-3 text-xs">
          {/* Left Badges */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-black/40 bg-black/75 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] animate-pulse" />
              62,083 clicks
            </span>
            <span className="rounded border-2 border-black bg-[#dc2626] px-2.5 py-1 font-black text-white shadow-[2px_2px_0px_#000]">
              द जंतर मंतर रन
            </span>
          </div>

          {/* Center Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 font-black text-[#18181b] bg-[#fffdf7]/95 px-4 py-1.5 rounded-xl border border-black/25 shadow-[2px_2px_0px_#000]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4] border border-black/50" />
              Police = 5 sec van ride
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f97316] border border-black/50" />
              Stick squad = -50% जान
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#eab308] border border-black/50" />
              Barricade = jump it
            </span>
          </div>

          {/* Right Credit Badge with LinkedIn */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-[11px] font-bold text-zinc-900 shadow-[2px_2px_0px_#000]">
              <div className="flex flex-col text-right leading-tight">
                <span className="text-[10px] text-zinc-500 font-normal">Created by</span>
                <span className="font-black text-black">Pratik Mahajan</span>
                <span className="text-[9px] text-zinc-500 font-normal">Product Designer</span>
              </div>
              <a
                href="https://www.linkedin.com/in/pratik-j-mahajan/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pratik Mahajan on LinkedIn"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/30 bg-[#0a66c2] text-white transition hover:scale-105"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
