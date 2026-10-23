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
import { loadSave, writeSave } from '../lib/storage';
import type { CharacterId, HudState, MoveVector, RunStats, SaveData, Screen, Settings } from '../types';

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

export default function App() {
  const [bridge] = useState(() => new Bridge());
  const [save, setSave] = useState<SaveData>(loadSave);
  const [screen, setScreen] = useState<Screen>('menu');
  const [hud, setHud] = useState<HudState>(EMPTY_HUD);
  const [stats, setStats] = useState<RunStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;
  const readyRef = useRef(false);

  // Mutable options shared with Phaser. Fields are refreshed on every render.
  const optionsRef = useRef<GameOptions>({
    bridge,
    character: save.character,
    settings: save.settings,
    bestScore: save.bestScore,
  });
  optionsRef.current.character = save.character;
  optionsRef.current.settings = save.settings;
  optionsRef.current.bestScore = save.bestScore;

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
        setSave((prev) => (s.score > prev.bestScore ? { ...prev, bestScore: s.score } : prev));
        setScreen('gameover');
      }),
      bridge.on('error', (message) => setError(message)),
    ];
    return () => offs.forEach((off) => off());
  }, [bridge]);

  const startRun = useCallback(() => {
    audio.unlock();
    audio.click();
    readyRef.current = false;
    setError(null);
    setHud(EMPTY_HUD);
    setStats(null);
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
        if (current === 'menu') startRun();
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
  const pickCharacter = (character: CharacterId): void => setSave((prev) => ({ ...prev, character }));

  const reduced = save.settings.reducedMotion;
  const inGame = GAME_SCREENS.includes(screen);

  return (
    <div className={`h-full w-full overflow-y-auto bg-gradient-to-b from-navy-900 via-navy-800 to-[#3a2a4d] ${reduced ? 'reduce-motion' : ''}`}>
      {screen === 'menu' && (
        <MenuScreen
          character={save.character}
          bestScore={save.bestScore}
          reducedMotion={reduced}
          onPlay={startRun}
          onSelect={() => setScreen('select')}
          onHowTo={() => setScreen('howto')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'select' && (
        <CharacterSelect selected={save.character} onPick={pickCharacter} onBack={toMenu} />
      )}
      {screen === 'howto' && <HowToPlay character={save.character} reducedMotion={reduced} onBack={toMenu} />}
      {screen === 'settings' && <SettingsScreen settings={save.settings} onChange={updateSettings} onBack={toMenu} />}

      {inGame && (
        <div className="flex h-full w-full flex-col">
          <Hud hud={hud} best={save.bestScore} showFps={import.meta.env.DEV} onPause={pause} />
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
                    <div className="text-3xl font-black uppercase italic leading-none">Stuck in the queue!</div>
                    <div className="mt-1 text-sm font-bold">Form 27-B is being stamped. Released in&hellip;</div>
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-[#12306b] bg-[#1b4fb0] text-4xl font-black text-cream">
                    {Math.ceil(hud.detainedMs / 1000)}
                  </div>
                </div>
              </div>
            )}
            {screen === 'paused' && <PauseMenu onResume={resume} onRestart={restart} onMenu={toMenu} />}
            {screen === 'gameover' && stats && (
              <GameOver stats={stats} best={save.bestScore} onAgain={restart} onMenu={toMenu} />
            )}
            {error && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy-900/90 p-4" role="alertdialog" aria-label="Error">
                <Panel className="flex max-w-sm flex-col gap-3 text-center">
                  <h2 className="text-2xl font-black text-alert">Something went wrong</h2>
                  <p className="text-sm">{error}</p>
                  <Button variant="primary" onClick={startRun}>Try again</Button>
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
