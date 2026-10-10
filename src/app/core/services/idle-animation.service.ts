import { Injectable, signal } from '@angular/core';

export type IdleAnimationName =
  | 'blink'
  | 'bob'
  | 'wiggle'
  | 'peek'
  | 'pulse'
  | 'wave';

interface IdleAnimationSpec {
  name: IdleAnimationName;
  durationMs: number;
  weight: number;
}

/**
 * Schedules short, random animations on the collapsed robot head. Each
 * animation runs for its natural duration and then clears itself, returning
 * the head to its rest state until the next one fires.
 *
 * The catalogue below weights common, subtle animations (blink, bob) higher
 * than the eye-catching ones (wave) so the head feels alive rather than
 * attention-seeking.
 */
@Injectable({ providedIn: 'root' })
export class IdleAnimationService {
  private readonly catalogue: IdleAnimationSpec[] = [
    { name: 'blink',  durationMs:  150, weight: 6 },
    { name: 'bob',    durationMs:  800, weight: 4 },
    { name: 'wiggle', durationMs:  700, weight: 3 },
    { name: 'peek',   durationMs: 1200, weight: 2 },
    { name: 'pulse',  durationMs:  900, weight: 3 },
    { name: 'wave',   durationMs: 1500, weight: 1 },
  ];

  private readonly _current = signal<IdleAnimationName | null>(null);
  readonly current = this._current.asReadonly();

  private nextTimer: ReturnType<typeof setTimeout> | null = null;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  /** Begin the idle loop. Safe to call multiple times. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.scheduleNext();
  }

  /** Stop the loop and clear any in-flight animation. */
  stop(): void {
    this.running = false;
    if (this.nextTimer) { clearTimeout(this.nextTimer); this.nextTimer = null; }
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    this._current.set(null);
  }

  /** Fire a specific animation immediately. Used by the "you have mail" cue. */
  trigger(name: IdleAnimationName): void {
    const spec = this.catalogue.find(s => s.name === name);
    if (!spec) return;
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    this._current.set(name);
    this.clearTimer = setTimeout(() => {
      this._current.set(null);
      this.clearTimer = null;
    }, spec.durationMs);
  }

  private scheduleNext(): void {
    if (!this.running) return;
    // 8–15 seconds between animations.
    const delayMs = 8_000 + Math.random() * 7_000;
    this.nextTimer = setTimeout(() => {
      if (!this.running) return;
      this.fireRandom();
      this.scheduleNext();
    }, delayMs);
  }

  private fireRandom(): void {
    const pool: IdleAnimationSpec[] = [];
    for (const spec of this.catalogue) {
      for (let i = 0; i < spec.weight; i++) pool.push(spec);
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    this._current.set(picked.name);
    this.clearTimer = setTimeout(() => {
      this._current.set(null);
      this.clearTimer = null;
    }, picked.durationMs);
  }
}