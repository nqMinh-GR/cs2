import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import type { CaseAudio } from '@/lib/case-audio';
import { createFoodSelector, createSpinProfile, spinProgress, stopFraction } from '@/lib/case-mechanics';
import type { CaseItem } from '@/lib/items/types';
import { REVEAL_SOUNDS } from '@/lib/rarity';
import { REEL_ORIGIN, REEL_STEP, REEL_WINDOW } from '@/lib/reel-geometry';
import { planReel, type ReelSlot } from '@/lib/reel-plan';
import { initialUnlockState, shouldMaskGold, unlockReducer, type Phase } from '@/lib/unlock-state';
import { OPENING_DELAY_MS, REDUCED_SETTLE_MS, REDUCED_UNLOCK_MS, SETTLE_MS } from '@/lib/unlock-timeline';

type Selector = ReturnType<typeof createFoodSelector<CaseItem>>;

type Args = {
  eligible: CaseItem[];
  selector: Selector | null;
  validTarget: boolean;
  audio: RefObject<CaseAudio | null>;
  reducedMotion: boolean;
};

function initialReel(items: CaseItem[]): ReelSlot<CaseItem>[] {
  return Array.from({ length: REEL_WINDOW }, (_, id) => ({ id, food: items[id % Math.max(1, items.length)] }));
}

/**
 * Owns the unlock state machine, the reel strip and the animation loop. The reel keeps permanent world
 * coordinates: the track only translates, cards are generated offscreen to the right, nothing ever resets.
 */
export function useUnlockFlow({ eligible, selector, validTarget, audio, reducedMotion }: Args) {
  const [state, dispatch] = useReducer(unlockReducer, initialUnlockState);
  const [reel, setReel] = useState(() => initialReel(eligible));
  const [visibleStart, setVisibleStart] = useState(0);

  const busy = useRef(false);
  const viewport = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const position = useRef(REEL_ORIGIN);
  const frame = useRef(0);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // startSpin() runs 2.4 s after the click, so it reads refs rather than click-time closures.
  const phaseRef = useRef<Phase>('idle');
  const reelRef = useRef(reel);
  const eligibleRef = useRef(eligible);
  const selectorRef = useRef(selector);
  const visibleStartRef = useRef(0);
  const reducedRef = useRef(reducedMotion);
  useLayoutEffect(() => { phaseRef.current = state.phase; }, [state.phase]);
  useLayoutEffect(() => { reelRef.current = reel; }, [reel]);
  useLayoutEffect(() => { eligibleRef.current = eligible; selectorRef.current = selector; reducedRef.current = reducedMotion; }, [eligible, selector, reducedMotion]);

  const attachTrack = useCallback((node: HTMLDivElement | null) => {
    track.current = node;
    if (node) node.style.transform = `translate3d(${position.current}px,0,0)`;
  }, []);

  // Keep idle cards pointing at dishes that still exist when filters change.
  useEffect(() => {
    if (state.phase !== 'idle' || !eligible.length || !selector) return;
    setReel((current) => current.map((slot) => ({ ...slot, food: eligible.find((item) => item.id === slot.food.id) ?? selector.choose(eligible) })));
  }, [eligible, selector, state.phase]);

  const abort = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    busy.current = false;
  }, []);
  useEffect(() => abort, [abort]);

  const startSpin = useCallback(() => {
    if (phaseRef.current !== 'unlocking') return;
    const items = eligibleRef.current, chooser = selectorRef.current, viewportEl = viewport.current;
    if (!items.length || !chooser || !viewportEl || !track.current) { busy.current = false; dispatch({ type: 'DISMISS' }); return; }
    const winner = chooser.choose(items);
    const width = viewportEl.clientWidth || 360;
    const start = position.current;
    const reduced = reducedRef.current;
    const profile = createSpinProfile(Math.random, reduced);
    const plan = planReel({ reel: reelRef.current, eligible: items, selector: chooser, winner, width, start, tiles: profile.tiles, stop: stopFraction() });
    flushSync(() => { setReel(plan.items); dispatch({ type: 'SPIN' }); });
    const duration = profile.durationMs;
    const started = performance.now();
    let renderedStart = visibleStartRef.current;
    let lastCell = Math.floor((start - width / 2) / REEL_STEP);
    const animate = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - started) / duration));
      const next = start + (plan.end - start) * spinProgress(progress, profile.friction);
      position.current = next;
      // Only mount a viewport-sized strip, with overscan on either side; slot coordinates never reset.
      const firstVisible = Math.max(0, Math.floor(-next / REEL_STEP));
      if (firstVisible - renderedStart >= 4 || firstVisible < renderedStart) { renderedStart = Math.max(0, firstVisible - 2); visibleStartRef.current = renderedStart; setVisibleStart(renderedStart); }
      if (track.current) track.current.style.transform = `translate3d(${next}px,0,0)`;
      // Tick when a card actually crosses the marker, including on slow devices.
      const cell = Math.floor((next - width / 2) / REEL_STEP);
      if (cell !== lastCell) { audio.current?.play('csgo_ui_crate_item_scroll'); lastCell = cell; }
      if (progress < 1) { frame.current = requestAnimationFrame(animate); return; }
      if (phaseRef.current !== 'spinning') return;
      dispatch({ type: 'SETTLE', winner, slot: plan.target });
      settleTimer.current = setTimeout(() => {
        dispatch({ type: 'REVEAL' });
        audio.current?.play(REVEAL_SOUNDS[winner.rarity] ?? REVEAL_SOUNDS[0]);
        busy.current = false;
      }, reduced ? REDUCED_SETTLE_MS : SETTLE_MS);
    };
    frame.current = requestAnimationFrame(animate);
  }, [audio]);

  const open = useCallback(() => {
    if (busy.current || !validTarget || !eligible.length || !selector || phaseRef.current !== 'idle') return;
    audio.current?.unlock(); // synchronously, inside the click, before any await or timer
    busy.current = true;
    dispatch({ type: 'UNLOCK', at: performance.now() });
    audio.current?.play('csgo_ui_crate_open');
    unlockTimer.current = setTimeout(startSpin, reducedMotion ? REDUCED_UNLOCK_MS : OPENING_DELAY_MS);
  }, [validTarget, eligible.length, selector, audio, reducedMotion, startSpin]);

  const dismiss = useCallback(() => dispatch({ type: 'DISMISS' }), []);

  return { state, reel, visibleStart, maskGold: shouldMaskGold(state.phase), viewport, attachTrack, open, dismiss };
}
