export interface DhakSynth {
  start: () => Promise<void>;
  stop: () => void;
}

const TEMPO_BPM = 156;
const MASTER_VOLUME = 0.55;

const STEPS: ReadonlyArray<readonly [low: number, high: number]> = [
  [1, 0.85],
  [0, 0],
  [0.45, 0],
  [0.35, 0.7],
  [0, 0.8],
  [0, 0],
  [0.9, 0.75],
  [0, 0.55],
  [1, 0.85],
  [0, 0],
  [0.45, 0],
  [0.35, 0.7],
  [0, 0.8],
  [0, 0],
  [0.85, 1],
  [0, 0.5],
];

function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function createDhakSynth(): DhakSynth {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;
  let timer: number | null = null;
  let stepIndex = 0;
  let nextTime = 0;

  const strokeLow = (time: number, velocity: number) => {
    if (!ctx || !master || !noiseBuffer) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(112, time);
    osc.frequency.exponentialRampToValueAtTime(52, time + 0.1);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.85 * velocity, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    osc.connect(gain).connect(master);
    osc.start(time);
    osc.stop(time + 0.32);

    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noise.buffer = noiseBuffer;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    noiseGain.gain.setValueAtTime(0.28 * velocity, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
    noise.connect(filter).connect(noiseGain).connect(master);
    noise.start(time, Math.random() * 0.4);
    noise.stop(time + 0.12);
  };

  const strokeHigh = (time: number, velocity: number) => {
    if (!ctx || !master || !noiseBuffer) return;

    const noise = ctx.createBufferSource();
    const band = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    noise.buffer = noiseBuffer;
    band.type = "bandpass";
    band.frequency.value = 2400;
    band.Q.value = 0.9;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.5 * velocity, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    noise.connect(band).connect(gain).connect(master);
    noise.start(time, Math.random() * 0.4);
    noise.stop(time + 0.11);

    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = "triangle";
    body.frequency.setValueAtTime(340, time);
    body.frequency.exponentialRampToValueAtTime(205, time + 0.05);
    bodyGain.gain.setValueAtTime(0.22 * velocity, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    body.connect(bodyGain).connect(master);
    body.start(time);
    body.stop(time + 0.1);
  };

  const schedule = () => {
    if (!ctx) return;
    const secondsPerStep = 60 / TEMPO_BPM / 4;
    while (nextTime < ctx.currentTime + 0.12) {
      const [low, high] = STEPS[stepIndex];
      const swing = stepIndex % 2 === 1 ? 0.985 : 1;
      const humanize = 0.92 + Math.random() * 0.16;
      if (low > 0) strokeLow(nextTime, low * humanize * swing);
      if (high > 0) strokeHigh(nextTime, high * humanize * swing);
      nextTime += secondsPerStep;
      stepIndex = (stepIndex + 1) % STEPS.length;
    }
  };

  return {
    async start() {
      if (!ctx || !master) {
        if (typeof window === "undefined" || !window.AudioContext) {
          throw new Error("no-audio-context");
        }
        ctx = new AudioContext();
        master = ctx.createGain();
        master.gain.value = 0.0001;
        master.connect(ctx.destination);
        noiseBuffer = makeNoiseBuffer(ctx);
      }
      await ctx.resume();
      if (timer !== null) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(MASTER_VOLUME, now + 0.45);
      stepIndex = 0;
      nextTime = ctx.currentTime + 0.08;
      timer = window.setInterval(schedule, 25);
    },
    stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
      if (ctx && master) {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        const closing = ctx;
        window.setTimeout(() => {
          void closing.close().catch(() => undefined);
        }, 250);
      }
      ctx = null;
      master = null;
      noiseBuffer = null;
    },
  };
}
