import { Pause, Pizza, ShieldCheck, Timer, Trophy, Users, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { COMMUNITY_MS, ENERGY_MS, SHIELD_MS } from '../game/config/constants';
import type { HudState } from '../types';

interface Props {
  hud: HudState;
  best: number;
  showFps: boolean;
  onPause: () => void;
}

function Chip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-navy-800/90 px-2.5 py-1" title={label}>
      {icon}
      <span className="sr-only">{label}</span>
      <span className="text-sm font-extrabold tabular-nums sm:text-base">{value}</span>
    </div>
  );
}

function Power({ icon, label, ms, total, color }: { icon: ReactNode; label: string; ms: number; total: number; color: string }) {
  if (ms <= 0) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-navy-800/90 px-2 py-1" role="status" aria-label={`${label} ${Math.ceil(ms / 1000)} seconds left`}>
      {icon}
      <div className="h-2 w-12 overflow-hidden rounded-full bg-black/40 sm:w-16">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (ms / total) * 100)}%`, background: color }} />
      </div>
      <span className="w-6 text-right text-xs font-bold tabular-nums">{Math.ceil(ms / 1000)}s</span>
    </div>
  );
}

export function Hud({ hud, best, showFps, onPause }: Props) {
  const lifeColor = hud.life > 50 ? '#17a5a0' : hud.life > 25 ? '#ffb23f' : '#d64545';
  const progress = Math.min(100, (hud.distance / hud.goal) * 100);
  const remaining = Math.max(0, hud.goal - hud.distance);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 bg-navy-900 px-3 py-2">
      {/* Stamina */}
      <div className="flex items-center gap-2" role="meter" aria-label="Stamina" aria-valuenow={hud.life} aria-valuemin={0} aria-valuemax={100}>
        <span className="rounded bg-alert px-2 py-0.5 text-sm font-black uppercase tracking-wide text-cream">Stamina</span>
        <div className="h-3.5 w-24 overflow-hidden rounded-full border border-cream/30 bg-black/40 sm:w-40">
          <div className="h-full rounded-full transition-[width] duration-150" style={{ width: `${hud.life}%`, background: lifeColor }} />
        </div>
        <span className="w-10 text-sm font-extrabold tabular-nums">{hud.life}%</span>
      </div>

      {/* Route progress */}
      <div className="flex items-center gap-2" role="progressbar" aria-label="Route progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="relative h-3 flex-1 rounded-full border border-cream/30 bg-black/40">
          <div className="h-full rounded-full bg-saffron/80" style={{ width: `${progress}%` }} />
          <div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream bg-alert" style={{ left: `${progress}%` }} />
        </div>
        <span className="w-16 text-right text-sm font-extrabold tabular-nums">{remaining} m</span>
      </div>

      <div className="flex items-center gap-2">
        <Chip icon={<Timer size={16} className="text-teal-dash" aria-hidden />} label="Time" value={`${hud.timeSec.toFixed(1)}s`} />
        <button
          type="button"
          onClick={onPause}
          aria-label="Pause"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-navy-900 hover:bg-white"
        >
          <Pause size={20} aria-hidden />
        </button>
      </div>

      <div className="col-span-3 flex flex-wrap items-center gap-2">
        <Chip icon={<Trophy size={16} className="text-saffron" aria-hidden />} label="Score" value={hud.score.toLocaleString()} />
        <Chip icon={<Pizza size={16} className="text-saffron" aria-hidden />} label="Snacks (Pizza, Burger, Biryani)" value={`${hud.items} 🍕`} />
        <span className="hidden text-xs font-bold text-cream/75 sm:inline">Best {Math.max(best, hud.score).toLocaleString()}</span>
        {showFps && <span className="text-xs text-cream/60">{hud.fps} fps</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Power icon={<ShieldCheck size={16} className="text-teal-dash" aria-hidden />} label="Fact Check Shield" ms={hud.shieldMs} total={SHIELD_MS * 1.4} color="#17a5a0" />
          <Power icon={<Users size={16} className="text-saffron" aria-hidden />} label="Community Boost" ms={hud.communityMs} total={COMMUNITY_MS} color="#ff9933" />
          <Power icon={<Zap size={16} className="text-[#ffd23f]" aria-hidden />} label="Energy Boost" ms={hud.energyMs} total={ENERGY_MS} color="#ffd23f" />
        </div>
      </div>
    </div>
  );
}
