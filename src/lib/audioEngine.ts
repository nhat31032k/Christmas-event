export type SfxType =
  | "slide"
  | "click"
  | "firework"
  | "twinkle"
  | "heart"
  | "type"
  | "star"
  | "flip";

export type AudioContextFactory = () => AudioContext;

const MASTER_VOLUME = 0.22;
const LOWPASS_FREQUENCY = 2200;
const LOWPASS_Q = 0.7;
const SCHEDULER_INTERVAL_MS = 80;
const SCHEDULE_AHEAD_SEC = 0.18;
const BPM = 84;
const EIGHTH_STEP_SEC = 60 / BPM / 2;

const NOTE_FREQ = {
  F2: 87.31,
  G2: 98.0,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
  G6: 1567.98,
  A6: 1760.0,
  C7: 2093.0,
} as const;

type NoteName = keyof typeof NOTE_FREQ;
type ChordName = "C" | "G7" | "F";

interface MelodyEvent {
  offset: number;
  note: NoteName;
  eighths: number;
}

interface MeasureDef {
  chord: ChordName;
  melody: readonly MelodyEvent[];
  turnaround?: boolean;
}

interface StepEvent {
  melody?: { freq: number; durationSec: number };
  accompaniment?: { freq: number; durationSec: number; isBass: boolean };
}

const CHORD_ARPEGGIO: Record<ChordName, readonly [NoteName, NoteName, NoteName]> =
  {
    C: ["C3", "E3", "G3"],
    G7: ["G2", "D3", "F3"],
    F: ["F2", "C3", "A3"],
  };

/**
 * Full 24-bar authentic verse of "Silent Night" (Stille Nacht) in C Major, 3/4 waltz meter.
 * Each measure spans 6 eighth-note steps (144 steps total per seamless loop).
 */
const SILENT_NIGHT_MEASURES: readonly MeasureDef[] = [
  // Phrase 1: "Silent night, holy night"
  {
    chord: "C",
    melody: [
      { offset: 0, note: "G4", eighths: 3 },
      { offset: 3, note: "A4", eighths: 1 },
      { offset: 4, note: "G4", eighths: 2 },
    ],
  },
  { chord: "C", melody: [{ offset: 0, note: "E4", eighths: 6 }] },
  {
    chord: "C",
    melody: [
      { offset: 0, note: "G4", eighths: 3 },
      { offset: 3, note: "A4", eighths: 1 },
      { offset: 4, note: "G4", eighths: 2 },
    ],
  },
  { chord: "C", melody: [{ offset: 0, note: "E4", eighths: 6 }] },

  // Phrase 2: "All is calm, all is bright"
  {
    chord: "G7",
    melody: [
      { offset: 0, note: "D5", eighths: 4 },
      { offset: 4, note: "D5", eighths: 2 },
    ],
  },
  { chord: "G7", melody: [{ offset: 0, note: "B4", eighths: 6 }] },
  {
    chord: "C",
    melody: [
      { offset: 0, note: "C5", eighths: 4 },
      { offset: 4, note: "C5", eighths: 2 },
    ],
  },
  { chord: "C", melody: [{ offset: 0, note: "G4", eighths: 6 }] },

  // Phrase 3: "Round yon virgin mother and child"
  {
    chord: "F",
    melody: [
      { offset: 0, note: "A4", eighths: 4 },
      { offset: 4, note: "A4", eighths: 2 },
    ],
  },
  {
    chord: "F",
    melody: [
      { offset: 0, note: "C5", eighths: 3 },
      { offset: 3, note: "B4", eighths: 1 },
      { offset: 4, note: "A4", eighths: 2 },
    ],
  },
  {
    chord: "C",
    melody: [
      { offset: 0, note: "G4", eighths: 3 },
      { offset: 3, note: "A4", eighths: 1 },
      { offset: 4, note: "G4", eighths: 2 },
    ],
  },
  { chord: "C", melody: [{ offset: 0, note: "E4", eighths: 6 }] },

  // Phrase 4: "Holy infant so tender and mild"
  {
    chord: "F",
    melody: [
      { offset: 0, note: "A4", eighths: 4 },
      { offset: 4, note: "A4", eighths: 2 },
    ],
  },
  {
    chord: "F",
    melody: [
      { offset: 0, note: "C5", eighths: 3 },
      { offset: 3, note: "B4", eighths: 1 },
      { offset: 4, note: "A4", eighths: 2 },
    ],
  },
  {
    chord: "C",
    melody: [
      { offset: 0, note: "G4", eighths: 3 },
      { offset: 3, note: "A4", eighths: 1 },
      { offset: 4, note: "G4", eighths: 2 },
    ],
  },
  { chord: "C", melody: [{ offset: 0, note: "E4", eighths: 6 }] },

  // Phrase 5: "Sleep in heavenly peace"
  {
    chord: "G7",
    melody: [
      { offset: 0, note: "D5", eighths: 4 },
      { offset: 4, note: "D5", eighths: 2 },
    ],
  },
  {
    chord: "G7",
    melody: [
      { offset: 0, note: "F5", eighths: 3 },
      { offset: 3, note: "D5", eighths: 1 },
      { offset: 4, note: "B4", eighths: 2 },
    ],
  },
  { chord: "C", melody: [{ offset: 0, note: "C5", eighths: 6 }] },
  { chord: "C", melody: [{ offset: 0, note: "E5", eighths: 6 }] },

  // Phrase 6: "Sleep in heavenly peace"
  {
    chord: "C",
    melody: [
      { offset: 0, note: "C5", eighths: 2 },
      { offset: 2, note: "G4", eighths: 2 },
      { offset: 4, note: "E4", eighths: 2 },
    ],
  },
  {
    chord: "G7",
    melody: [
      { offset: 0, note: "G4", eighths: 3 },
      { offset: 3, note: "F4", eighths: 1 },
      { offset: 4, note: "D4", eighths: 2 },
    ],
  },
  { chord: "C", melody: [{ offset: 0, note: "C4", eighths: 9 }] },
  { chord: "C", melody: [], turnaround: true },
];

function buildSilentNightSteps(): readonly StepEvent[] {
  const steps: StepEvent[] = [];

  for (const measure of SILENT_NIGHT_MEASURES) {
    const [bass, mid, high] = CHORD_ARPEGGIO[measure.chord];
    const barSteps: StepEvent[] = Array.from({ length: 6 }, () => ({}));

    barSteps[0].accompaniment = {
      freq: NOTE_FREQ[bass],
      durationSec: EIGHTH_STEP_SEC * (measure.turnaround ? 5 : 4),
      isBass: true,
    };
    barSteps[2].accompaniment = {
      freq: NOTE_FREQ[measure.turnaround ? "G3" : mid],
      durationSec: EIGHTH_STEP_SEC * 2.5,
      isBass: false,
    };
    barSteps[4].accompaniment = {
      freq: NOTE_FREQ[measure.turnaround ? "E4" : high],
      durationSec: EIGHTH_STEP_SEC * 2.2,
      isBass: false,
    };

    for (const event of measure.melody) {
      barSteps[event.offset].melody = {
        freq: NOTE_FREQ[event.note],
        durationSec: EIGHTH_STEP_SEC * event.eighths,
      };
    }

    steps.push(...barSteps);
  }

  return steps;
}

const SILENT_NIGHT_STEPS = buildSilentNightSteps();

function createDefaultAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("Web Audio API is unavailable outside the browser.");
  }
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) {
    throw new Error("Web Audio API is not supported in this browser.");
  }
  return new AudioContextCtor();
}

export class MusicBoxEngine {
  private readonly contextFactory: AudioContextFactory;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;

  private playing = false;
  private muted = false;
  private disposed = false;
  private stepIndex = 0;
  private nextNoteTime = 0;

  constructor(contextFactory?: AudioContextFactory) {
    this.contextFactory = contextFactory ?? createDefaultAudioContext;
  }

  public start(): void {
    if (this.disposed) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    this.muted = false;
    this.applyMasterGain();
    this.resumeIfSuspended(ctx);

    if (this.playing && this.schedulerTimer !== null) {
      return;
    }

    this.playing = true;
    this.stepIndex = 0;
    this.nextNoteTime = ctx.currentTime + 0.02;

    this.scheduleNotes();
    this.schedulerTimer = setInterval(() => {
      this.scheduleNotes();
    }, SCHEDULER_INTERVAL_MS);
  }

  public toggleMute(): boolean {
    if (this.disposed) {
      return this.muted;
    }

    this.muted = !this.muted;
    this.applyMasterGain();

    if (!this.muted && this.ctx) {
      this.resumeIfSuspended(this.ctx);
    }

    return this.muted;
  }

  public setMuted(muted: boolean): void {
    if (this.disposed) {
      return;
    }

    this.muted = muted;
    this.applyMasterGain();

    if (!this.muted && this.ctx) {
      this.resumeIfSuspended(this.ctx);
    }
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playSfx(type: SfxType): void {
    if (this.disposed || this.muted) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.filter) {
      return;
    }

    this.resumeIfSuspended(ctx);

    try {
      const now = ctx.currentTime + 0.005;

      switch (type) {
        case "slide":
          this.scheduleTone(ctx, {
            type: "triangle",
            freq: NOTE_FREQ.E5,
            startTime: now,
            duration: 0.17,
            peakGain: 0.24,
          });
          this.scheduleTone(ctx, {
            type: "triangle",
            freq: NOTE_FREQ.B5,
            startTime: now + 0.065,
            duration: 0.22,
            peakGain: 0.22,
          });
          break;

        case "click":
          this.scheduleTone(ctx, {
            type: "square",
            freq: 880,
            endFreq: 520,
            startTime: now,
            duration: 0.048,
            peakGain: 0.16,
            attack: 0.004,
          });
          break;

        case "firework":
          this.scheduleTone(ctx, {
            type: "sine",
            freq: 420,
            endFreq: 1480,
            startTime: now,
            duration: 0.19,
            peakGain: 0.14,
            attack: 0.01,
          });
          [
            { offset: 0.19, freq: NOTE_FREQ.G6, dur: 0.09, gain: 0.18 },
            { offset: 0.23, freq: NOTE_FREQ.C7, dur: 0.08, gain: 0.15 },
            { offset: 0.27, freq: NOTE_FREQ.A6, dur: 0.09, gain: 0.14 },
            { offset: 0.32, freq: NOTE_FREQ.E6, dur: 0.11, gain: 0.12 },
          ].forEach((pop) => {
            this.scheduleTone(ctx, {
              type: "triangle",
              freq: pop.freq,
              startTime: now + pop.offset,
              duration: pop.dur,
              peakGain: pop.gain,
              attack: 0.004,
            });
          });
          break;

        case "twinkle":
          [
            NOTE_FREQ.C5,
            NOTE_FREQ.D5,
            NOTE_FREQ.E5,
            NOTE_FREQ.G5,
            NOTE_FREQ.C6,
          ].forEach((freq, idx) => {
            this.scheduleTone(ctx, {
              type: "triangle",
              freq,
              startTime: now + idx * 0.05,
              duration: 0.24,
              peakGain: 0.22,
              attack: 0.008,
            });
          });
          break;

        case "heart":
          this.scheduleTone(ctx, {
            type: "sine",
            freq: NOTE_FREQ.C5,
            endFreq: NOTE_FREQ.E5,
            startTime: now,
            duration: 0.08,
            peakGain: 0.24,
            attack: 0.008,
          });
          this.scheduleTone(ctx, {
            type: "sine",
            freq: NOTE_FREQ.E5,
            endFreq: NOTE_FREQ.B5,
            startTime: now + 0.08,
            duration: 0.14,
            peakGain: 0.26,
            attack: 0.008,
          });
          break;

        case "type":
          this.scheduleTone(ctx, {
            type: "sine",
            freq: 1320,
            endFreq: 980,
            startTime: now,
            duration: 0.026,
            peakGain: 0.055,
            attack: 0.003,
          });
          break;

        case "star":
          [
            NOTE_FREQ.E6,
            NOTE_FREQ.C6,
            NOTE_FREQ.G5,
            NOTE_FREQ.A5,
            NOTE_FREQ.C6,
            NOTE_FREQ.E6,
          ].forEach((freq, idx) => {
            this.scheduleTone(ctx, {
              type: "sine",
              freq,
              startTime: now + idx * 0.042,
              duration: 0.24,
              peakGain: 0.17,
              attack: 0.008,
            });
          });
          break;

        case "flip":
          [
            NOTE_FREQ.C5,
            NOTE_FREQ.E5,
            NOTE_FREQ.G5,
            NOTE_FREQ.B5,
            NOTE_FREQ.E6,
          ].forEach((freq, idx) => {
            this.scheduleTone(ctx, {
              type: "triangle",
              freq,
              startTime: now + idx * 0.045,
              duration: 0.36,
              peakGain: 0.21,
              attack: 0.01,
            });
          });
          break;
      }
    } catch {
      // Ignore Web Audio synthesis errors gracefully
    }
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.playing = false;

    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    const ctx = this.ctx;
    const filter = this.filter;
    const masterGain = this.masterGain;
    this.ctx = null;
    this.masterGain = null;
    this.filter = null;

    try {
      filter?.disconnect?.();
    } catch {
      // Ignore disconnect errors on disposed context
    }

    try {
      masterGain?.disconnect?.();
    } catch {
      // Ignore disconnect errors on disposed context
    }

    if (ctx) {
      try {
        const result = ctx.close();
        if (result && typeof result.catch === "function") {
          result.catch(() => {
            // Ignore close rejection
          });
        }
      } catch {
        // Ignore synchronous close errors
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.disposed) {
      return null;
    }
    if (this.ctx) {
      return this.ctx;
    }

    try {
      const ctx = this.contextFactory();
      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.value = LOWPASS_FREQUENCY;
      filter.Q.value = LOWPASS_Q;

      const initialGain = this.muted ? 0 : MASTER_VOLUME;
      masterGain.gain.setValueAtTime?.(initialGain, ctx.currentTime);
      masterGain.gain.value = initialGain;

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      this.ctx = ctx;
      this.masterGain = masterGain;
      this.filter = filter;
      return ctx;
    } catch {
      this.ctx = null;
      this.masterGain = null;
      this.filter = null;
      return null;
    }
  }

  private applyMasterGain(): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const target = this.muted ? 0 : MASTER_VOLUME;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues?.(now);
      this.masterGain.gain.setValueAtTime?.(target, now);
      this.masterGain.gain.value = target;
    } catch {
      // Ignore parameter errors
    }
  }

  private resumeIfSuspended(ctx: AudioContext): void {
    try {
      const state = ctx.state as string;
      if (state === "suspended" || state === "interrupted") {
        const result = ctx.resume();
        if (result && typeof result.catch === "function") {
          result.catch(() => {
            // Ignore autoplay-policy rejections
          });
        }
      }
    } catch {
      // Ignore synchronous resume errors
    }
  }

  private scheduleNotes(): void {
    if (this.disposed || !this.playing || !this.ctx || !this.filter) {
      return;
    }

    try {
      const now = this.ctx.currentTime;

      // Guard against past-timestamp scheduling if main thread stalled or tab was backgrounded
      if (this.nextNoteTime < now) {
        this.nextNoteTime = now + 0.02;
      }

      while (this.nextNoteTime < now + SCHEDULE_AHEAD_SEC) {
        const step = SILENT_NIGHT_STEPS[this.stepIndex];
        const scheduledAt = this.nextNoteTime;

        if (!this.muted) {
          if (step.melody) {
            this.scheduleMusicBoxMelody(
              this.ctx,
              step.melody.freq,
              scheduledAt,
              step.melody.durationSec,
            );
          }

          if (step.accompaniment) {
            this.scheduleAccompaniment(
              this.ctx,
              step.accompaniment.freq,
              scheduledAt,
              step.accompaniment.durationSec,
              step.accompaniment.isBass,
            );
          }
        }

        this.nextNoteTime += EIGHTH_STEP_SEC;
        this.stepIndex = (this.stepIndex + 1) % SILENT_NIGHT_STEPS.length;
      }
    } catch {
      // Ignore scheduler errors gracefully
    }
  }

  private scheduleMusicBoxMelody(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    durationSec: number,
  ): void {
    const decay = Math.min(Math.max(durationSec * 1.15, 0.45), 2.4);

    // Primary warm triangle voice
    this.scheduleTone(ctx, {
      type: "triangle",
      freq,
      startTime,
      duration: decay,
      peakGain: 0.55,
      attack: 0.012,
    });

    // Soft octave-higher sine bell harmonic (~0.28x amplitude)
    this.scheduleTone(ctx, {
      type: "sine",
      freq: freq * 2,
      startTime,
      duration: decay * 0.72,
      peakGain: 0.55 * 0.28,
      attack: 0.008,
    });
  }

  private scheduleAccompaniment(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    durationSec: number,
    isBass: boolean,
  ): void {
    const decay = Math.min(Math.max(durationSec * 1.05, 0.5), 2.0);
    // ~0.32x melody amplitude for warm, cozy accompaniment
    const peakGain = isBass ? 0.55 * 0.32 : 0.55 * 0.22;

    this.scheduleTone(ctx, {
      type: "sine",
      freq,
      startTime,
      duration: decay,
      peakGain,
      attack: 0.018,
    });
  }

  private scheduleTone(
    ctx: AudioContext,
    options: {
      type: OscillatorType;
      freq: number;
      endFreq?: number;
      startTime: number;
      duration: number;
      peakGain: number;
      attack?: number;
    },
  ): void {
    if (!this.filter) {
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const attack = options.attack ?? 0.012;
    const startTime = options.startTime;
    const attackEnd = startTime + Math.min(attack, options.duration * 0.4);
    const decayEnd = startTime + Math.max(options.duration, attack + 0.02);

    osc.type = options.type;
    osc.frequency.setValueAtTime(options.freq, startTime);
    if (options.endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(options.endFreq, 20),
        decayEnd,
      );
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(options.peakGain, attackEnd);
    gain.gain.exponentialRampToValueAtTime(0.0006, decayEnd);

    osc.connect(gain);
    gain.connect(this.filter);

    osc.onended = () => {
      try {
        osc.disconnect?.();
        gain.disconnect?.();
      } catch {
        // Ignore disconnect errors on disposed context
      }
    };

    osc.start(startTime);
    osc.stop(decayEnd + 0.02);
  }
}
