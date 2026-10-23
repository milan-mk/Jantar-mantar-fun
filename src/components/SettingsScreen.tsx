import { ChevronLeft } from 'lucide-react';
import type { Settings } from '../types';
import { Button, Panel } from './ui';

interface Props {
  settings: Settings;
  onChange: (next: Settings) => void;
  onBack: () => void;
}

interface RowProps {
  label: string;
  hint: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
}

function Row({ label, hint, checked, onToggle }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-navy-900/60 p-4">
      <div>
        <div className="text-lg font-extrabold">{label}</div>
        <div className="text-sm text-cream/80">{hint}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onToggle(!checked)}
        className={`relative h-9 w-16 shrink-0 rounded-full border-2 transition ${
          checked ? 'border-saffron bg-saffron' : 'border-cream/40 bg-navy-700'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-cream shadow transition-all ${
            checked ? 'left-8 bg-navy-900' : 'left-1'
          }`}
        />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}

export function SettingsScreen({ settings, onChange, onBack }: Props) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-6">
      <Panel className="flex flex-col gap-3">
        <h2 className="text-3xl font-black uppercase text-saffron">Settings</h2>
        <Row label="Sound effects" hint="Jump, collect and crash sounds" checked={settings.sound} onToggle={(sound) => onChange({ ...settings, sound })} />
        <Row label="Music" hint="A short synthesized loop while you run" checked={settings.music} onToggle={(music) => onChange({ ...settings, music })} />
        <Row label="Reduced motion" hint="Less shaking, flashing and particles" checked={settings.reducedMotion} onToggle={(reducedMotion) => onChange({ ...settings, reducedMotion })} />
        <Button variant="primary" className="mt-2" icon={<ChevronLeft size={20} aria-hidden />} onClick={onBack}>
          Back
        </Button>
      </Panel>
    </main>
  );
}
