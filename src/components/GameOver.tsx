import { Home, RotateCcw, Share2 } from 'lucide-react';
import { useState } from 'react';
import { shareText, type ShareOutcome } from '../lib/share';
import type { RunSummary } from '../lib/progress';
import { CHARACTERS } from '../game/config/characters';
import { buildShareText, getResultTitle } from '../lib/titles';
import type { RunStats } from '../types';
import { Button, Panel, Stat } from './ui';

interface Props {
  stats: RunStats;
  summary: RunSummary | null;
  best: number;
  onAgain: () => void;
  onMenu: () => void;
}

const MESSAGES: Record<ShareOutcome, string> = {
  shared: 'Shared!',
  copied: 'Score copied to clipboard.',
  cancelled: 'Sharing cancelled.',
  failed: 'Could not share or copy. Please copy your score manually.',
};

export function GameOver({ stats, summary, best, onAgain, onMenu }: Props) {
  const [status, setStatus] = useState<string>('');

  const share = async (): Promise<void> => {
    setStatus('');
    const outcome = await shareText(buildShareText(stats));
    setStatus(MESSAGES[outcome]);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-navy-900/80 p-4" role="dialog" aria-modal="true" aria-label="Game over">
      <Panel className="flex max-w-md flex-col gap-4 text-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-cream/75">
            {stats.won ? 'You made it to Jantar Mantar!' : 'Out of stamina'}
          </p>
          <h2 className="text-3xl font-black text-saffron sm:text-4xl">{getResultTitle(stats)}</h2>
          {stats.mode === 'daily' && (
            <p className="mt-1 text-sm font-bold text-[#7fe8e2]">Daily Challenge &middot; {stats.dailyKey}</p>
          )}
          {stats.isNewBest && <p className="mt-1 font-extrabold text-[#ffd23f]">New best score!</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Score" value={stats.score.toLocaleString()} />
          <Stat label="Best" value={Math.max(best, stats.score).toLocaleString()} />
          <Stat label="Distance" value={`${stats.distance.toLocaleString()} m`} />
          <Stat label="Time" value={`${stats.timeSec}s`} />
          <Stat label="Food (🍕🍔🍲)" value={String(stats.items)} />
          <Stat label="Close calls" value={String(stats.closeCalls)} />
          <Stat label="Stamina left" value={`${stats.life}%`} />
        </div>
        {summary && (summary.missionsCompleted.length > 0 || summary.achievements.length > 0 || summary.unlocked.length > 0) && (
          <ul className="flex flex-col gap-1 rounded-2xl bg-navy-900/60 p-3 text-left text-sm" aria-label="Rewards">
            {summary.unlocked.map((id) => (
              <li key={id} className="font-extrabold text-[#ffd23f]">New runner unlocked: {CHARACTERS[id].name}!</li>
            ))}
            {summary.missionsCompleted.map((m) => (
              <li key={m.id} className="text-[#7fe8e2]">Mission complete: {m.text}</li>
            ))}
            {summary.achievements.map((a) => (
              <li key={a.id} className="text-cream">Badge earned: <b>{a.title}</b> ({a.text})</li>
            ))}
          </ul>
        )}
        {summary && <p className="text-xs font-bold text-cream/75">Daily streak: {summary.streak} {summary.streak === 1 ? 'day' : 'days'}</p>}
        <div className="flex flex-col gap-2">
          <Button variant="primary" icon={<RotateCcw size={20} aria-hidden />} onClick={onAgain} autoFocus>
            Play Again
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" icon={<Home size={18} aria-hidden />} onClick={onMenu}>
              Main Menu
            </Button>
            <Button variant="ghost" icon={<Share2 size={18} aria-hidden />} onClick={() => void share()}>
              Share Score
            </Button>
          </div>
          <p className="min-h-5 text-sm text-cream/90" role="status" aria-live="polite">{status}</p>
        </div>
      </Panel>
    </div>
  );
}
