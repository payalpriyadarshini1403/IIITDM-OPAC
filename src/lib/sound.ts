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

/** Simulate a quick page flip sound with a short noise burst */
export function playPageFlip() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const duration = 0.15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Use a low sine wave with a quick pitch drop to simulate a thick page turn 'thwump'
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + duration);
    
    // Quick attack and release on volume
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    
    // Add a slight high-pitched noise to simulate paper friction
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext may be blocked
  }
}
