/**
 * Original, fully synthesized audio (Web Audio API). No audio files are
 * shipped, nothing is downloaded, and nothing plays until the player has
 * interacted with the page (browsers require that, and we never autoplay).
 */

type ContextCtor = typeof AudioContext;

function getContextCtor(): ContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { webkitAudioContext?: ContextCtor };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

/** Semitone offsets of a minor-flavoured scale, played from D. */
const SCALE = [0, 1, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19];
const ROOT_HZ = 146.83;
const STEP_SECONDS = 60 / 118 / 2; // eighth notes at 118 bpm
const LOOKAHEAD_SECONDS = 0.25;

function noteHz(scaleIndex: number): number {
  return ROOT_HZ * Math.pow(2, SCALE[scaleIndex % SCALE.length] / 12);
}

const BASS_PATTERN: ReadonlyArray<number | null> = [0, null, 0, null, 4, null, 3, null];
const ARP_PATTERN: ReadonlyArray<number> = [7, 9, 11, 9, 10, 9, 8, 9];
const BAR_SHIFT: readonly number[] = [0, 0, 3, 4];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private soundOn = true;
  private musicOn = true;
  private musicWanted = false;
  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private step = 0;

  /** Call from a user gesture (e.g. the Play button). Safe to call repeatedly. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = getContextCtor();
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
      } catch {
        this.ctx = null;
        return;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.5;
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.16;
      this.musicBus.connect(this.master);
      this.noiseBuffer = this.makeNoise(this.ctx);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
    if (this.musicWanted && this.musicOn) this.runMusicScheduler();
  }

  configure(opts: { sound: boolean; music: boolean }): void {
    this.soundOn = opts.sound;
    this.musicOn = opts.music;
    if (!this.musicOn) this.haltScheduler();
    else if (this.musicWanted) this.runMusicScheduler();
  }

  /** Declare whether music should currently be playing (menu vs. run vs. pause). */
  setMusicWanted(wanted: boolean): void {
    this.musicWanted = wanted;
    if (wanted && this.musicOn) this.runMusicScheduler();
    else this.haltScheduler();
  }

  dispose(): void {
    this.haltScheduler();
  }

  // ---- Sound effects ----

  click(): void {
    this.tone({ freq: 520, end: 640, dur: 0.07, type: 'triangle', vol: 0.35 });
  }

  jump(): void {
    this.tone({ freq: 300, end: 640, dur: 0.18, type: 'square', vol: 0.25 });
  }

  splash(): void {
    this.noiseBurst({ dur: 0.28, vol: 0.35, filter: 1800 });
    this.tone({ freq: 500, end: 220, dur: 0.18, type: 'sine', vol: 0.25 });
  }

  /** Two low thumps for being detained. */
  detain(): void {
    this.tone({ freq: 160, end: 70, dur: 0.18, type: 'square', vol: 0.4 });
    this.tone({ freq: 140, end: 60, dur: 0.22, type: 'square', vol: 0.4, delay: 0.22 });
  }

  win(): void {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      this.tone({ freq: f, dur: 0.16, type: 'triangle', vol: 0.4, delay: i * 0.11 }),
    );
  }

  collect(tier: number): void {
    const base = 660 + tier * 110;
    this.tone({ freq: base, dur: 0.08, type: 'triangle', vol: 0.4 });
    this.tone({ freq: base * 1.5, dur: 0.14, type: 'triangle', vol: 0.4, delay: 0.07 });
  }

  powerUp(): void {
    [392, 523, 659, 784].forEach((f, i) =>
      this.tone({ freq: f, dur: 0.12, type: 'square', vol: 0.28, delay: i * 0.07 }),
    );
  }

  shieldPop(): void {
    this.noiseBurst({ dur: 0.3, vol: 0.4, filter: 2600 });
    this.tone({ freq: 880, end: 220, dur: 0.25, type: 'sine', vol: 0.4 });
  }

  /** A canister thrown: a short rising whoosh. */
  gasThrow(): void {
    this.tone({ freq: 220, end: 520, dur: 0.22, type: 'sawtooth', vol: 0.18 });
    this.noiseBurst({ dur: 0.18, vol: 0.18, filter: 3200 });
  }

  /** Canister bursts: a long hiss. */
  gasBurst(): void {
    this.noiseBurst({ dur: 0.6, vol: 0.42, filter: 2600 });
    this.tone({ freq: 140, end: 70, dur: 0.25, type: 'square', vol: 0.2 });
  }

  /** Coughing: two quick low blips. */
  cough(): void {
    this.tone({ freq: 190, end: 120, dur: 0.1, type: 'square', vol: 0.3 });
    this.tone({ freq: 175, end: 105, dur: 0.12, type: 'square', vol: 0.3, delay: 0.14 });
  }

  hit(): void {
    this.noiseBurst({ dur: 0.35, vol: 0.55, filter: 700 });
    this.tone({ freq: 220, end: 60, dur: 0.4, type: 'sawtooth', vol: 0.4 });
  }

  gameOver(): void {
    [392, 330, 262, 196].forEach((f, i) =>
      this.tone({ freq: f, dur: 0.22, type: 'triangle', vol: 0.4, delay: i * 0.16 }),
    );
  }

  // ---- Internals ----

  private canPlaySfx(): boolean {
    return this.soundOn && this.ctx !== null && this.sfxBus !== null && this.ctx.state === 'running';
  }

  private tone(o: {
    freq: number;
    end?: number;
    dur: number;
    type: OscillatorType;
    vol: number;
    delay?: number;
    bus?: GainNode | null;
  }): void {
    const ctx = this.ctx;
    const bus = o.bus ?? this.sfxBus;
    if (!ctx || !bus) return;
    if (!o.bus && !this.canPlaySfx()) return;
    const t0 = ctx.currentTime + (o.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.end !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(o.end, 1), t0 + o.dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(o.vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private noiseBurst(o: { dur: number; vol: number; filter: number; bus?: GainNode | null; at?: number }): void {
    const ctx = this.ctx;
    const bus = o.bus ?? this.sfxBus;
    if (!ctx || !bus || !this.noiseBuffer) return;
    if (!o.bus && !this.canPlaySfx()) return;
    const t0 = o.at ?? ctx.currentTime;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = this.noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.value = o.filter;
    gain.gain.setValueAtTime(o.vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start(t0);
    src.stop(t0 + o.dur + 0.02);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private runMusicScheduler(): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus || this.musicTimer !== null) return;
    this.nextNoteTime = ctx.currentTime + 0.05;
    this.step = 0;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 80);
  }

  private haltScheduler(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusic(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') {
      if (ctx) this.nextNoteTime = ctx.currentTime + 0.05;
      return;
    }
    while (this.nextNoteTime < ctx.currentTime + LOOKAHEAD_SECONDS) {
      this.playStep(this.step, this.nextNoteTime);
      this.nextNoteTime += STEP_SECONDS;
      this.step += 1;
    }
  }

  private playStep(step: number, when: number): void {
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (!ctx || !bus) return;
    const inBar = step % 8;
    const bar = Math.floor(step / 8) % BAR_SHIFT.length;
    const shift = BAR_SHIFT[bar];
    const delay = Math.max(0, when - ctx.currentTime);

    const bass = BASS_PATTERN[inBar];
    if (bass !== null) {
      this.tone({ freq: noteHz(bass + shift) / 2, dur: 0.22, type: 'triangle', vol: 0.7, delay, bus });
    }
    const arp = ARP_PATTERN[inBar] + (bar === 2 ? 1 : 0);
    this.tone({ freq: noteHz(arp), dur: 0.12, type: 'square', vol: 0.16, delay, bus });

    if (inBar === 0 || inBar === 4) {
      this.tone({ freq: 140, end: 45, dur: 0.16, type: 'sine', vol: 0.9, delay, bus });
    }
    if (inBar % 2 === 1) {
      this.noiseBurst({ dur: 0.04, vol: 0.18, filter: 9000, bus, at: when });
    }
  }
}

export const audio = new AudioEngine();
