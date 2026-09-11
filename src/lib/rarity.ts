import type { CaseSound } from './case-audio';

/** Mil-spec blue, restricted purple, classified pink, covert red, gold. */
export const RARITY_COLORS = ['#4b69ff', '#8847ff', '#d32ce6', '#eb4b4b', '#e4ae39'] as const;
export const REVEAL_SOUNDS: readonly CaseSound[] = ['item_reveal3_rare', 'item_reveal4_mythical', 'item_reveal5_legendary', 'item_reveal6_ancient', 'item_reveal6_ancient'];
export const GOLD = 4;
