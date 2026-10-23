import { Home, Play, RotateCcw } from 'lucide-react';
import { Button, Panel } from './ui';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export function PauseMenu({ onResume, onRestart, onMenu }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-navy-900/70 p-4" role="dialog" aria-modal="true" aria-label="Paused">
      <Panel className="flex max-w-sm flex-col gap-3 text-center">
        <h2 className="text-3xl font-black uppercase text-saffron">Paused</h2>
        <Button variant="primary" icon={<Play size={20} aria-hidden />} onClick={onResume} autoFocus>
          Resume
        </Button>
        <Button icon={<RotateCcw size={20} aria-hidden />} onClick={onRestart}>
          Restart
        </Button>
        <Button variant="ghost" icon={<Home size={20} aria-hidden />} onClick={onMenu}>
          Main Menu
        </Button>
      </Panel>
    </div>
  );
}
