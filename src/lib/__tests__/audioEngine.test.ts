import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChiptuneMusicBox } from "../../components/ChiptuneMusicBox";
import { MusicBoxEngine, type SfxType } from "../audioEngine";

interface MockAudioParam {
  value: number;
  setValueAtTime: ReturnType<typeof vi.fn>;
  linearRampToValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  setTargetAtTime: ReturnType<typeof vi.fn>;
  cancelScheduledValues: ReturnType<typeof vi.fn>;
}

interface MockOscillator {
  type: OscillatorType;
  frequency: MockAudioParam;
  onended: ((this: AudioScheduledSourceNode, ev: Event) => unknown) | null;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface MockGainNode {
  gain: MockAudioParam;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

interface MockBiquadFilterNode {
  type: BiquadFilterType;
  frequency: MockAudioParam;
  Q: MockAudioParam;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

type MockContextState = AudioContextState | "interrupted";

interface MockAudioContextHarness {
  ctx: AudioContext;
  setCurrentTime: (time: number) => void;
  setState: (state: MockContextState) => void;
  oscillators: MockOscillator[];
  gains: MockGainNode[];
  filters: MockBiquadFilterNode[];
  resume: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  destination: object;
}

function createMockAudioParam(initial = 0): MockAudioParam {
  const param: MockAudioParam = {
    value: initial,
    setValueAtTime: vi.fn((val: number) => {
      param.value = val;
      return param;
    }),
    linearRampToValueAtTime: vi.fn((val: number) => {
      param.value = val;
      return param;
    }),
    exponentialRampToValueAtTime: vi.fn((val: number) => {
      if (val <= 0) {
        throw new RangeError("exponentialRampToValueAtTime target must be > 0");
      }
      param.value = val;
      return param;
    }),
    setTargetAtTime: vi.fn((val: number) => {
      param.value = val;
      return param;
    }),
    cancelScheduledValues: vi.fn(() => param),
  };
  return param;
}

function createMockAudioContext(options?: {
  state?: MockContextState;
  resumeReject?: boolean;
  closeReject?: boolean;
}): MockAudioContextHarness {
  let currentTime = 0;
  let state: MockContextState = options?.state ?? "running";
  const oscillators: MockOscillator[] = [];
  const gains: MockGainNode[] = [];
  const filters: MockBiquadFilterNode[] = [];
  const destination = { label: "destination" };

  const resume = vi.fn(() => {
    if (options?.resumeReject) {
      return Promise.reject(new Error("Autoplay blocked"));
    }
    state = "running";
    return Promise.resolve();
  });

  const close = vi.fn(() => {
    if (options?.closeReject) {
      return Promise.reject(new Error("Close failed"));
    }
    state = "closed";
    return Promise.resolve();
  });

  const ctx = {
    get currentTime() {
      return currentTime;
    },
    get state() {
      return state;
    },
    destination,
    resume,
    close,
    createOscillator: vi.fn(() => {
      const osc: MockOscillator = {
        type: "sine",
        frequency: createMockAudioParam(440),
        onended: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      oscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => {
      const gainNode: MockGainNode = {
        gain: createMockAudioParam(1),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      gains.push(gainNode);
      return gainNode;
    }),
    createBiquadFilter: vi.fn(() => {
      const filterNode: MockBiquadFilterNode = {
        type: "lowpass",
        frequency: createMockAudioParam(350),
        Q: createMockAudioParam(1),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      filters.push(filterNode);
      return filterNode;
    }),
  } as unknown as AudioContext;

  return {
    ctx,
    setCurrentTime: (t: number) => {
      currentTime = t;
    },
    setState: (s: MockContextState) => {
      state = s;
    },
    oscillators,
    gains,
    filters,
    resume,
    close,
    destination,
  };
}

const ALL_SFX_TYPES: readonly SfxType[] = [
  "slide",
  "click",
  "firework",
  "twinkle",
  "heart",
  "type",
  "star",
  "flip",
];

describe("MusicBoxEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("constructs lazily without calling factory until start()", () => {
    const harness = createMockAudioContext();
    const factory = vi.fn(() => harness.ctx);

    const engine = new MusicBoxEngine(factory);

    expect(factory).not.toHaveBeenCalled();
    expect(engine.isPlaying()).toBe(false);
    expect(engine.isMuted()).toBe(false);
  });

  it("sets up warm low-pass filter, master gain, and schedules initial Silent Night notes immediately on start()", () => {
    const harness = createMockAudioContext();
    const factory = vi.fn(() => harness.ctx);
    const engine = new MusicBoxEngine(factory);

    engine.start();

    expect(factory).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying()).toBe(true);
    expect(engine.isMuted()).toBe(false);

    // Master gain and warm low-pass filter configured properly
    expect(harness.filters.length).toBe(1);
    expect(harness.filters[0].type).toBe("lowpass");
    expect(harness.filters[0].frequency.value).toBe(2200);
    expect(harness.filters[0].Q.value).toBeCloseTo(0.7, 2);

    const masterGain = harness.gains[0];
    expect(masterGain.gain.value).toBeCloseTo(0.22, 4);
    expect(harness.filters[0].connect).toHaveBeenCalledWith(masterGain);
    expect(masterGain.connect).toHaveBeenCalledWith(harness.destination);

    // Immediate synchronous scheduling of first Silent Night beat (C major: G4 + G5 harmonic + C3 bass)
    expect(harness.oscillators.length).toBeGreaterThanOrEqual(3);
    const types = harness.oscillators.map((o) => o.type);
    expect(types).toContain("triangle");
    expect(types).toContain("sine");

    const melodyFund = harness.oscillators.find(
      (o) => o.type === "triangle" && Math.abs(o.frequency.value - 392) < 0.5,
    );
    const melodyBell = harness.oscillators.find(
      (o) => o.type === "sine" && Math.abs(o.frequency.value - 784) < 0.5,
    );
    const bassNote = harness.oscillators.find(
      (o) => o.type === "sine" && Math.abs(o.frequency.value - 130.81) < 0.5,
    );
    expect(melodyFund).toBeDefined();
    expect(melodyBell).toBeDefined();
    expect(bassNote).toBeDefined();

    // Verify every scheduled oscillator was started and scheduled to stop
    for (const osc of harness.oscillators) {
      expect(osc.start).toHaveBeenCalledTimes(1);
      expect(osc.stop).toHaveBeenCalledTimes(1);
      const startArg = osc.start.mock.calls[0][0] as number;
      const stopArg = osc.stop.mock.calls[0][0] as number;
      expect(stopArg).toBeGreaterThan(startArg);
    }

    engine.dispose();
  });

  it("makes repeated start() calls idempotent without creating a second context or duplicate intervals", () => {
    const harness = createMockAudioContext();
    const factory = vi.fn(() => harness.ctx);
    const engine = new MusicBoxEngine(factory);

    engine.start();
    const initialOscCount = harness.oscillators.length;
    const activeTimersBefore = vi.getTimerCount();

    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);

    engine.start();

    expect(factory).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying()).toBe(true);
    expect(engine.isMuted()).toBe(false);
    expect(harness.gains[0].gain.value).toBeCloseTo(0.22, 4);
    expect(harness.oscillators.length).toBe(initialOscCount);
    expect(vi.getTimerCount()).toBe(activeTimersBefore);

    engine.dispose();
  });

  it("reuses the lazily constructed AudioContext when playSfx() runs before start()", () => {
    const harness = createMockAudioContext();
    const factory = vi.fn(() => harness.ctx);
    const engine = new MusicBoxEngine(factory);

    engine.playSfx("click");
    expect(factory).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying()).toBe(false);

    engine.start();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying()).toBe(true);

    engine.dispose();
  });

  it("toggles mute and explicitly sets mute, updating master gain and suppressing playSfx() while muted", () => {
    const harness = createMockAudioContext();
    const factory = vi.fn(() => harness.ctx);
    const engine = new MusicBoxEngine(factory);

    // Toggling before start updates muted state without lazily creating AudioContext
    expect(engine.toggleMute()).toBe(true);
    expect(engine.isMuted()).toBe(true);
    expect(factory).not.toHaveBeenCalled();

    // playSfx is suppressed when muted
    engine.playSfx("click");
    expect(factory).not.toHaveBeenCalled();

    // Start unmutes and builds audio graph
    engine.start();
    expect(engine.isMuted()).toBe(false);
    const masterGain = harness.gains[0];
    expect(masterGain.gain.value).toBeCloseTo(0.22, 4);

    // toggleMute -> muted
    expect(engine.toggleMute()).toBe(true);
    expect(engine.isMuted()).toBe(true);
    expect(masterGain.gain.value).toBe(0);

    const oscCountWhileMuted = harness.oscillators.length;
    engine.playSfx("twinkle");
    expect(harness.oscillators.length).toBe(oscCountWhileMuted);

    // toggleMute -> unmuted
    expect(engine.toggleMute()).toBe(false);
    expect(engine.isMuted()).toBe(false);
    expect(masterGain.gain.value).toBeCloseTo(0.22, 4);

    engine.playSfx("twinkle");
    expect(harness.oscillators.length).toBeGreaterThan(oscCountWhileMuted);

    // setMuted explicit API
    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);
    expect(masterGain.gain.value).toBe(0);

    const countBeforeSuppressed = harness.oscillators.length;
    engine.playSfx("flip");
    expect(harness.oscillators.length).toBe(countBeforeSuppressed);

    engine.setMuted(false);
    expect(engine.isMuted()).toBe(false);
    expect(masterGain.gain.value).toBeCloseTo(0.22, 4);

    engine.playSfx("flip");
    expect(harness.oscillators.length).toBeGreaterThan(countBeforeSuppressed);

    engine.dispose();
  });

  it.each(ALL_SFX_TYPES)(
    "synthesizes '%s' SFX cleanly and spawns started/stopped oscillators when unmuted",
    (sfxType) => {
      const harness = createMockAudioContext();
      const factory = vi.fn(() => harness.ctx);
      const engine = new MusicBoxEngine(factory);

      engine.playSfx(sfxType);

      expect(factory).toHaveBeenCalledTimes(1);
      expect(harness.oscillators.length).toBeGreaterThanOrEqual(1);

      for (const osc of harness.oscillators) {
        expect(osc.start).toHaveBeenCalledTimes(1);
        expect(osc.stop).toHaveBeenCalledTimes(1);
      }

      if (sfxType === "type") {
        // Typewriter tick should stay subtle and quiet (peak <= 0.1)
        const sfxGain = harness.gains[1];
        const peakCalls = sfxGain.gain.linearRampToValueAtTime.mock.calls.map(
          (call) => call[0] as number,
        );
        const setCalls = sfxGain.gain.setValueAtTime.mock.calls.map(
          (call) => call[0] as number,
        );
        const maxGain = Math.max(...peakCalls, ...setCalls, 0);
        expect(maxGain).toBeGreaterThan(0);
        expect(maxGain).toBeLessThanOrEqual(0.1);
      }

      engine.dispose();
    },
  );

  it("resumes a suspended AudioContext cleanly even if resume() rejects", async () => {
    const runningHarness = createMockAudioContext({ state: "suspended" });
    const engine1 = new MusicBoxEngine(() => runningHarness.ctx);
    engine1.start();
    expect(runningHarness.resume).toHaveBeenCalledTimes(1);
    engine1.dispose();

    const rejectedHarness = createMockAudioContext({
      state: "suspended",
      resumeReject: true,
    });
    const engine2 = new MusicBoxEngine(() => rejectedHarness.ctx);

    expect(() => engine2.start()).not.toThrow();
    expect(() => engine2.playSfx("heart")).not.toThrow();
    expect(rejectedHarness.resume).toHaveBeenCalled();

    // Flush microtasks to verify no unhandled rejection escapes
    await Promise.resolve();
    engine2.dispose();
  });

  it("allocates zero oscillators during scheduler ticks while muted and preserves song position on unmute", () => {
    const harness = createMockAudioContext();
    const engine = new MusicBoxEngine(() => harness.ctx);

    engine.start();
    const oscCountAfterStart = harness.oscillators.length;
    const gainCountAfterStart = harness.gains.length;

    engine.setMuted(true);

    // Advance 105 ticks * 80ms = 8.40s (advances through steps 1..23 to Measure 5, step 24)
    let simTime = 0;
    for (let i = 0; i < 105; i++) {
      simTime = Number((simTime + 0.08).toFixed(4));
      harness.setCurrentTime(simTime);
      vi.advanceTimersByTime(80);
    }

    // Zero oscillators or voice gains allocated while muted
    expect(harness.oscillators.length).toBe(oscCountAfterStart);
    expect(harness.gains.length).toBe(gainCountAfterStart);

    // Unmuting resumes from Measure 5 ("All is calm": D5 = 587.33 Hz, G2 = 98.0 Hz), not Measure 1
    engine.setMuted(false);
    simTime = Number((simTime + 0.08).toFixed(4));
    harness.setCurrentTime(simTime);
    vi.advanceTimersByTime(80);

    const resumedOscs = harness.oscillators.slice(oscCountAfterStart);
    expect(resumedOscs.length).toBeGreaterThanOrEqual(3);
    expect(
      resumedOscs.some(
        (o) => o.type === "triangle" && Math.abs(o.frequency.value - 587.33) < 0.5,
      ),
    ).toBe(true);
    expect(
      resumedOscs.some(
        (o) => o.type === "sine" && Math.abs(o.frequency.value - 98.0) < 0.5,
      ),
    ).toBe(true);

    engine.dispose();
  });

  it("recovers from currentTime stall jumps without scheduling notes in the past", () => {
    const harness = createMockAudioContext();
    const engine = new MusicBoxEngine(() => harness.ctx);

    engine.start();

    // Advance normally past empty step 1 so stepIndex = 2 (which schedules accompaniment E3 at ~0.734s)
    harness.setCurrentTime(0.24);
    vi.advanceTimersByTime(80);
    const countBeforeShortStall = harness.oscillators.length;

    // Sub-500ms stall jump: nextNoteTime (~0.734s) is ~216ms behind currentTime (0.95s)
    harness.setCurrentTime(0.95);
    vi.advanceTimersByTime(80);

    const afterShortStall = harness.oscillators.slice(countBeforeShortStall);
    expect(afterShortStall.length).toBeGreaterThan(0);
    for (const osc of afterShortStall) {
      const scheduledStart = osc.start.mock.calls[0][0] as number;
      expect(scheduledStart).toBeGreaterThanOrEqual(0.95);
    }

    // Multi-second background tab stall jump (reset to step 0 / chord downbeat by advancing to a voiced step)
    const countBeforeLongStall = harness.oscillators.length;
    harness.setCurrentTime(4.2);
    vi.advanceTimersByTime(80);
    harness.setCurrentTime(4.56);
    vi.advanceTimersByTime(80);

    const afterLongStall = harness.oscillators.slice(countBeforeLongStall);
    expect(afterLongStall.length).toBeGreaterThan(0);
    for (const osc of afterLongStall) {
      const scheduledStart = osc.start.mock.calls[0][0] as number;
      expect(scheduledStart).toBeGreaterThanOrEqual(4.2);
    }

    engine.dispose();
  });

  it("resumes an iOS Safari 'interrupted' AudioContext on start, unmute, and playSfx", () => {
    const harness = createMockAudioContext({ state: "interrupted" });
    const engine = new MusicBoxEngine(() => harness.ctx);

    engine.start();
    expect(harness.resume).toHaveBeenCalledTimes(1);

    // Simulate iOS screen lock / app switch interrupting the context while muted
    engine.setMuted(true);
    harness.setState("interrupted");
    engine.toggleMute();
    expect(harness.resume).toHaveBeenCalledTimes(2);

    // Simulate another iOS interruption before SFX playback
    harness.setState("interrupted");
    engine.playSfx("click");
    expect(harness.resume).toHaveBeenCalledTimes(3);

    engine.dispose();
  });

  it("advances scheduler cleanly across full melody loop and stops scheduling after dispose()", async () => {
    const harness = createMockAudioContext();
    const engine = new MusicBoxEngine(() => harness.ctx);

    engine.start();
    const afterStartCount = harness.oscillators.length;

    // Advance across ~54 seconds of audio time (more than a full 24-bar Silent Night verse)
    let simTime = 0;
    for (let i = 0; i < 180; i++) {
      simTime += 0.3;
      harness.setCurrentTime(simTime);
      vi.advanceTimersByTime(80);
    }

    const afterLoopCount = harness.oscillators.length;
    expect(afterLoopCount).toBeGreaterThan(afterStartCount + 60);

    // Dispose stops interval and closes AudioContext
    engine.dispose();
    expect(engine.isPlaying()).toBe(false);
    expect(harness.close).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);

    // Advancing timers after dispose schedules zero new oscillators
    simTime += 2.0;
    harness.setCurrentTime(simTime);
    vi.advanceTimersByTime(1000);
    expect(harness.oscillators.length).toBe(afterLoopCount);

    // Subsequent calls after dispose are safe no-ops
    expect(() => engine.start()).not.toThrow();
    expect(() => engine.playSfx("star")).not.toThrow();
    expect(() => engine.setMuted(true)).not.toThrow();
    expect(() => engine.toggleMute()).not.toThrow();
    expect(() => engine.dispose()).not.toThrow();
    expect(engine.isPlaying()).toBe(false);
    expect(harness.oscillators.length).toBe(afterLoopCount);
    expect(harness.close).toHaveBeenCalledTimes(1);

    await Promise.resolve();
  });

  it("disconnects completed voice nodes on osc.onended and disconnects filter + masterGain before close on dispose()", () => {
    const harness = createMockAudioContext();
    const callOrder: string[] = [];
    harness.close.mockImplementation(() => {
      callOrder.push("ctx.close");
      return Promise.resolve();
    });

    const engine = new MusicBoxEngine(() => harness.ctx);
    engine.playSfx("click");

    expect(harness.filters.length).toBe(1);
    expect(harness.gains.length).toBe(2); // gains[0] = masterGain, gains[1] = voice gain
    expect(harness.oscillators.length).toBe(1);

    const filter = harness.filters[0];
    const masterGain = harness.gains[0];
    const voiceGain = harness.gains[1];
    const osc = harness.oscillators[0];

    filter.disconnect.mockImplementation(() => {
      callOrder.push("filter.disconnect");
    });
    masterGain.disconnect.mockImplementation(() => {
      callOrder.push("masterGain.disconnect");
    });

    expect(typeof osc.onended).toBe("function");
    expect(osc.disconnect).not.toHaveBeenCalled();
    expect(voiceGain.disconnect).not.toHaveBeenCalled();

    osc.onended?.call(osc as unknown as AudioScheduledSourceNode, {} as Event);
    expect(osc.disconnect).toHaveBeenCalledTimes(1);
    expect(voiceGain.disconnect).toHaveBeenCalledTimes(1);

    // Also swallows disconnect errors on already-disposed contexts
    osc.disconnect.mockImplementationOnce(() => {
      throw new Error("Already disconnected");
    });
    expect(() =>
      osc.onended?.call(osc as unknown as AudioScheduledSourceNode, {} as Event),
    ).not.toThrow();

    engine.dispose();
    expect(filter.disconnect).toHaveBeenCalledTimes(1);
    expect(masterGain.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.close).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual([
      "filter.disconnect",
      "masterGain.disconnect",
      "ctx.close",
    ]);
  });

  it("ignores rejected AudioContext.close() during dispose()", async () => {
    const harness = createMockAudioContext({ closeReject: true });
    const engine = new MusicBoxEngine(() => harness.ctx);

    engine.start();
    harness.filters[0].disconnect.mockImplementationOnce(() => {
      throw new Error("Filter disconnect error");
    });
    expect(() => engine.dispose()).not.toThrow();
    expect(engine.isPlaying()).toBe(false);
    expect(harness.gains[0].disconnect).toHaveBeenCalledTimes(1);
    expect(harness.close).toHaveBeenCalledTimes(1);

    await Promise.resolve();
  });

  it("degrades silently when AudioContext factory throws or in SSR without window", () => {
    const throwingFactory = vi.fn(() => {
      throw new Error("AudioContext blocked");
    });

    const engine = new MusicBoxEngine(throwingFactory);
    expect(() => engine.start()).not.toThrow();
    expect(engine.isPlaying()).toBe(false);
    expect(() => engine.playSfx("firework")).not.toThrow();
    expect(() => engine.toggleMute()).not.toThrow();
    expect(() => engine.setMuted(false)).not.toThrow();
    expect(() => engine.dispose()).not.toThrow();
    expect(engine.isPlaying()).toBe(false);

    // Default constructor in Node (SSR environment with no window)
    const ssrEngine = new MusicBoxEngine();
    expect(() => ssrEngine.start()).not.toThrow();
    expect(ssrEngine.isPlaying()).toBe(false);
    expect(() => ssrEngine.playSfx("slide")).not.toThrow();
    expect(() => ssrEngine.dispose()).not.toThrow();
  });
});

describe("ChiptuneMusicBox", () => {
  it("uses dynamic Vietnamese action aria-label and title without aria-pressed", () => {
    // tsconfig uses jsx: "preserve" for Next.js, so Vitest esbuild emits classic React.createElement
    (globalThis as unknown as { React?: typeof React }).React = React;

    const activeHtml = renderToStaticMarkup(
      React.createElement(ChiptuneMusicBox, {
        isPlaying: true,
        isMuted: false,
        onToggle: () => {},
      }),
    );
    expect(activeHtml).toContain('aria-label="Tắt nhạc nền"');
    expect(activeHtml).toContain('title="Tắt nhạc nền"');
    expect(activeHtml).not.toContain("aria-pressed");

    const mutedHtml = renderToStaticMarkup(
      React.createElement(ChiptuneMusicBox, {
        isPlaying: true,
        isMuted: true,
        onToggle: () => {},
      }),
    );
    expect(mutedHtml).toContain('aria-label="Bật nhạc nền"');
    expect(mutedHtml).toContain('title="Bật nhạc nền"');
    expect(mutedHtml).not.toContain("aria-pressed");

    const stoppedHtml = renderToStaticMarkup(
      React.createElement(ChiptuneMusicBox, {
        isPlaying: false,
        isMuted: false,
        onToggle: () => {},
      }),
    );
    expect(stoppedHtml).toContain('aria-label="Bật nhạc nền"');
    expect(stoppedHtml).toContain('title="Bật nhạc nền"');
    expect(stoppedHtml).not.toContain("aria-pressed");
  });
});
