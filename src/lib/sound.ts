// Sound utilities using native Web Audio API
// No external library — per README Section 5

let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.15) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext may be blocked until user interaction — silently ignore
  }
}

/** Light tap — navigation, button press */
export function playTap() {
  playTone(880, 0.06, 'sine', 0.1);
}

/** Success — login, borrow confirmed, collection saved */
export function playSuccess() {
  playTone(523, 0.08, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.1), 80);
  setTimeout(() => playTone(784, 0.18, 'sine', 0.08), 180);
}

/** Error — failed search with zero results, auth failure */
export function playError() {
  playTone(220, 0.15, 'square', 0.08);
  setTimeout(() => playTone(196, 0.2, 'square', 0.06), 120);
}

/** Notify — new hold ready, due-date reminder */
export function playNotify() {
  playTone(660, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.08), 200);
}

export function setMuted(val: boolean) {
  muted = val;
}

export function isMuted(): boolean {
  return muted;
}
