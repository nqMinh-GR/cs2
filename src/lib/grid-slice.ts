/**
 * CS2 shows two rows of items and ends them with the gold "rare special item" tile.
 * Returns how many regular tiles to show so that, with the gold tile appended, exactly two rows fill.
 */
export function collapsedCount(cols: number, hasGold: boolean) {
  const columns = Math.max(1, Math.floor(cols));
  return Math.max(1, columns * 2 - (hasGold ? 1 : 0));
}

export function collapsedSlice<T>(sorted: T[], cols: number, hasGold: boolean): T[] {
  return sorted.slice(0, collapsedCount(cols, hasGold));
}
