import { useCallback, useEffect, useRef, useState } from 'react';
import { CharacterSelect } from '../components/CharacterSelect';
import { GameCanvas } from '../components/GameCanvas';
import { GameOver } from '../components/GameOver';
import { Hud } from '../components/Hud';
import { HowToPlay } from '../components/HowToPlay';
import { MenuScreen } from '../components/MenuScreen';
import { PauseMenu } from '../components/PauseMenu';
import { SettingsScreen } from '../components/SettingsScreen';
import { TouchControls } from '../components/TouchControls';
import { Button, Panel } from '../components/ui';
import type { GameOptions } from '../game/config/options';
import { audio } from '../lib/audio';
import { Bridge } from '../lib/bridge';
import { applyRun, missionsForDay, type RunSummary } from '../lib/progress';
import { loadSave, writeSave } from '../lib/storage';
import type { CharacterId, HudState, MoveVector, RunMode, RunStats, SaveData, Screen, Settings } from '../types';

const EMPTY_HUD: HudState = {
  score: 0,
  distance: 0,
  goal: 1200,
  life: 100,
  items: 0,
  timeSec: 0,
  detainedMs: 0,
  shieldMs: 0,
  communityMs: 0,
  energyMs: 0,
  fps: 0,
};

const GAME_SCREENS: readonly Screen[] = ['playing', 'paused', 'gameover'];
const ZERO_MOVE: MoveVector = { x: 0, y: 0 };
const MOVE_KEYS: readonly string[] = [
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS',
];

/** Local calendar date as YYYY-MM-DD: everyone playing on the same day gets the same daily street. */
function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function App() {
  const [bridge] = useState(() => new Bridge());
  const [save, setSave] = useState<SaveData>(loadSave);
  const [screen, setScreen] = useState<Screen>('menu');
  const [hud, setHud] = useState<HudState>(EMPTY_HUD);
  const [stats, setStats] = useState<RunStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RunMode>('free');
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [dailyKey, setDailyKey] = useState<string>(todayKey);

  const saveRef = useRef(save);
  saveRef.current = save;
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;
  const readyRef = useRef(false);

  // Mutable options shared with Phaser. Fields are refreshed on every render.
  const optionsRef = useRef<GameOptions>({
    bridge,
    character: save.character,
    settings: save.settings,
    bestScore: save.bestScore,
    mode,
    dailyKey,
    ghost: null,
  });
  const ghostKey = mode === 'daily' ? `daily-${dailyKey}` : 'free';
  const modeBest = mode === 'daily' ? save.ghosts[ghostKey]?.score ?? 0 : save.bestScore;
  optionsRef.current.character = save.character;
  optionsRef.current.settings = save.settings;
  optionsRef.current.bestScore = modeBest;
  optionsRef.current.mode = mode;
  optionsRef.current.dailyKey = dailyKey;
  optionsRef.current.ghost = save.ghosts[ghostKey] ?? null;

  // Persist whenever the save changes.
  useEffect(() => {
    writeSave(save);
  }, [save]);

  // Keep audio in sync with settings and screen.
  useEffect(() => {
    audio.configure({ sound: save.settings.sound, music: save.settings.music });
  }, [save.settings.sound, save.settings.music]);
  useEffect(() => {
    audio.setMusicWanted(screen === 'playing');
  }, [screen]);
  useEffect(() => () => audio.dispose(), []);

  // Events coming from the Phaser scene.
  useEffect(() => {
    const offs = [
      bridge.on('ready', () => {
        readyRef.current = true;
      }),
      bridge.on('hud', (h) => setHud(h)),
      bridge.on('gameover', (s) => {
        setStats(s);
        const applied = applyRun(saveRef.current.progress, s, todayKey());
        setSummary(applied.summary);
        setSave((prev) => {
          const key = s.mode === 'daily' ? `daily-${s.dailyKey}` : 'free';
          const old = prev.ghosts[key];
          const next: SaveData = { ...prev, progress: applied.progress };
          // Daily runs have their own best; only free runs count toward the overall best.
          if (s.mode === 'free' && s.score > prev.bestScore) next.bestScore = s.score;
          if (s.score > 0 && (!old || s.score > old.score) && s.trace.d.length >= 2) {
            const keep: Record<string, typeof s.trace> = { [key]: s.trace };
            if (key !== 'free' && prev.ghosts.free) keep.free = prev.ghosts.free;
            if (key === 'free') {
              const daily = `daily-${todayKey()}`;
              if (prev.ghosts[daily]) keep[daily] = prev.ghosts[daily];
            }
            next.ghosts = keep;
          }
          return next;
        });
        setScreen('gameover');
      }),
      bridge.on('error', (message) => setError(message)),
    ];
    return () => offs.forEach((off) => off());
  }, [bridge]);

  const startRun = useCallback((runMode: RunMode = 'free') => {
    audio.unlock();
    setMode(runMode);
    setDailyKey(todayKey());
    audio.click();
    readyRef.current = false;
    setError(null);
    setHud(EMPTY_HUD);
    setStats(null);
    setSummary(null);
    setScreen('playing');
  }, []);

  const pause = useCallback(() => {
    if (screenRef.current !== 'playing' || !readyRef.current) return;
    bridge.emit('pause');
    setScreen('paused');
  }, [bridge]);

  const resume = useCallback(() => {
    if (screenRef.current !== 'paused') return;
    bridge.emit('resume');
    setScreen('playing');
  }, [bridge]);

  const restart = useCallback(() => {
    audio.unlock();
    bridge.emit('restart');
    setHud(EMPTY_HUD);
    setStats(null);
    setSummary(null);
    setScreen('playing');
  }, [bridge]);

  const toMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  const jump = useCallback(() => {
    if (screenRef.current === 'playing') bridge.emit('jump');
  }, [bridge]);

  const sendMove = useCallback(
    (v: MoveVector) => {
      if (screenRef.current === 'playing') bridge.emit('move', v);
      else bridge.emit('move', ZERO_MOVE);
    },
    [bridge],
  );

  const keysRef = useRef(new Set<string>());
  const syncKeys = useCallback(() => {
    const k = keysRef.current;
    const x = (k.has('ArrowRight') || k.has('KeyD') ? 1 : 0) - (k.has('ArrowLeft') || k.has('KeyA') ? 1 : 0);
    const y = (k.has('ArrowUp') || k.has('KeyW') ? 1 : 0) - (k.has('ArrowDown') || k.has('KeyS') ? 1 : 0);
    sendMove({ x, y });
  }, [sendMove]);

  // Stop moving whenever play is interrupted.
  useEffect(() => {
    if (screen !== 'playing') {
      keysRef.current.clear();
      bridge.emit('move', ZERO_MOVE);
    }
  }, [screen, bridge]);

  // Keyboard. All gameplay keys go through the bridge so there is a single input path.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const current = screenRef.current;
      if (current === 'playing') {
        if (MOVE_KEYS.includes(e.code)) {
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur?.();
          keysRef.current.add(e.code);
          syncKeys();
          return;
        }
        if (e.code === 'Space') {
          e.preventDefault();
          if (e.repeat) return;
          (document.activeElement as HTMLElement | null)?.blur?.();
          jump();
          return;
        }
        if (e.code === 'Escape') {
          e.preventDefault();
          pause();
        }
        return;
      }
      if (current === 'paused' && e.code === 'Escape') {
        e.preventDefault();
        resume();
        return;
      }
      if (e.code === 'Enter' && !e.repeat) {
        const active = document.activeElement;
        const onControl = active instanceof HTMLButtonElement || active instanceof HTMLAnchorElement;
        if (onControl) return; // the focused control handles Enter itself
        if (current === 'menu') startRun('free');
        else if (current === 'gameover') restart();
      }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      if (MOVE_KEYS.includes(e.code)) {
        keysRef.current.delete(e.code);
        syncKeys();
      }
      // Stops a focused button from also "clicking" when Space is released mid-run.
      if (screenRef.current === 'playing' && e.code === 'Space') e.preventDefault();
    };

    const onBlur = (): void => {
      keysRef.current.clear();
      sendMove(ZERO_MOVE);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [jump, syncKeys, sendMove, pause, resume, startRun, restart]);

  // Auto-pause when the tab is hidden.
  useEffect(() => {
    const onVisibility = (): void => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause]);

  const updateSettings = (settings: Settings): void => setSave((prev) => ({ ...prev, settings }));
  const pickCharacter = (character: CharacterId): void =>
    setSave((prev) => (prev.progress.unlocked.includes(character) ? { ...prev, character } : prev));

  const reduced = save.settings.reducedMotion;
  const inGame = GAME_SCREENS.includes(screen);

  return (
    <div className={`h-full w-full overflow-y-auto bg-gradient-to-b from-navy-900 via-navy-800 to-[#3a2a4d] ${reduced ? 'reduce-motion' : ''}`}>
      {screen === 'menu' && (
        <MenuScreen
          character={save.character}
          bestScore={save.bestScore}
          reducedMotion={reduced}
          progress={save.progress}
          missions={missionsForDay(todayKey())}
          dailyBest={save.ghosts[`daily-${dailyKey}`]?.score ?? 0}
          dailyKey={todayKey()}
          onPlay={() => startRun('free')}
          onDaily={() => startRun('daily')}
          onSelect={() => setScreen('select')}
          onHowTo={() => setScreen('howto')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'select' && (
        <CharacterSelect
          selected={save.character}
          unlocked={save.progress.unlocked}
          missionsTotal={save.progress.missionsTotal}
          onPick={pickCharacter}
          onBack={toMenu}
        />
      )}
      {screen === 'howto' && <HowToPlay character={save.character} reducedMotion={reduced} onBack={toMenu} />}
      {screen === 'settings' && <SettingsScreen settings={save.settings} onChange={updateSettings} onBack={toMenu} />}

      {inGame && (
        <div className="flex h-full w-full flex-col">
          <Hud hud={hud} best={modeBest} showFps={import.meta.env.DEV} onPause={pause} />
          <p className="hidden bg-navy-900 px-3 pb-1 text-center text-xs text-cream/70 [@media(orientation:portrait)_and_(pointer:coarse)]:block">
            Tip: rotate your device for a wider view.
          </p>
          <div className="relative min-h-0 flex-1">
            <GameCanvas optionsRef={optionsRef} />
            <TouchControls onJump={jump} onMove={sendMove} />
            {hud.detainedMs > 0 && screen === 'playing' && (
              <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center px-4" role="status" aria-live="assertive">
                <div className="dd-pop flex max-w-md items-center gap-4 rounded-2xl border-4 border-[#2f6bff] bg-cream px-5 py-3 text-navy-900 shadow-2xl">
                  <div>
                    <div className="text-3xl font-black uppercase italic leading-none">DETAINED!</div>
                    <div className="mt-1 text-sm font-bold">Mash SPACE (or JUMP) to wriggle free! Released in&hellip;</div>
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-[#12306b] bg-[#1b4fb0] text-4xl font-black text-cream">
                    {Math.ceil(hud.detainedMs / 1000)}
                  </div>
                </div>
              </div>
            )}
            {screen === 'paused' && <PauseMenu onResume={resume} onRestart={restart} onMenu={toMenu} />}
            {screen === 'gameover' && stats && (
              <GameOver stats={stats} summary={summary} best={modeBest} onAgain={restart} onMenu={toMenu} />
            )}
            {error && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy-900/90 p-4" role="alertdialog" aria-label="Error">
                <Panel className="flex max-w-sm flex-col gap-3 text-center">
                  <h2 className="text-2xl font-black text-alert">Something went wrong</h2>
                  <p className="text-sm">{error}</p>
                  <Button variant="primary" onClick={() => startRun(mode)}>Try again</Button>
                  <Button variant="ghost" onClick={toMenu}>Main Menu</Button>
                </Panel>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
