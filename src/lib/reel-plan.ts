import { REEL_STEP, REEL_TILE } from './reel-geometry';

export type ReelSlot<T> = { id: number; food: T };
type Selector<T> = { probabilities: Map<T, number>; choose(items: T[]): T };

export type ReelPlanInput<T> = {
  reel: ReelSlot<T>[];
  eligible: T[];
  selector: Selector<T>;
  winner: T;
  /** Viewport width in px. */
  width: number;
  /** Current track translation in px (negative = scrolled left). */
  start: number;
  /** Tiles to travel before stopping on the winner. */
  tiles: number;
  /** Where inside the winning tile the marker stops, in [0.1, 0.9]. */
  stop: number;
};

/**
 * Keeps the visible cards at their permanent world coordinates and generates new cards offscreen to the
 * right so the track only ever travels left, never resets. Pure: randomness comes from the selector.
 */
export function planReel<T>({ reel, eligible, selector, winner, width, start, tiles, stop }: ReelPlanInput<T>) {
  const center = Math.floor((width / 2 - start) / REEL_STEP);
  const target = center + tiles;
  const end = width / 2 - REEL_TILE * stop - target * REEL_STEP;
  const rightEdge = Math.ceil((width - start) / REEL_STEP) + 1;
  const items = reel.filter((item) => item.id >= center - Math.ceil(width / REEL_STEP) - 2 && item.id <= rightEdge);
  const last = items.length ? Math.max(...items.map((item) => item.id)) : center - 1;
  const recent: T[] = [];
  for (let id = last + 1; id <= target + 4; id++) {
    const alternatives = eligible.filter((food) => !recent.includes(food) && (selector.probabilities.get(food) ?? 0) > 0);
    const food = id === target ? winner : selector.choose(alternatives.length ? alternatives : eligible);
    items.push({ id, food });
    recent.push(food);
    if (recent.length > 8) recent.shift();
  }
  return { items, target, end, center };
}
