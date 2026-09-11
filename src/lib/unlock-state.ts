import type { CaseItem } from './items/types';

export type Phase = 'idle' | 'unlocking' | 'spinning' | 'settled' | 'revealed';
export type UnlockState = { phase: Phase; result: CaseItem | null; winnerSlot: number | null; startedAt: number };
export type UnlockAction =
  | { type: 'UNLOCK'; at: number }
  | { type: 'SPIN' }
  | { type: 'SETTLE'; winner: CaseItem; slot: number }
  | { type: 'REVEAL' }
  | { type: 'DISMISS' };

export const initialUnlockState: UnlockState = { phase: 'idle', result: null, winnerSlot: null, startedAt: 0 };

/** Pure transition table. Illegal actions return the same state reference so React bails out. */
export function unlockReducer(state: UnlockState, action: UnlockAction): UnlockState {
  switch (action.type) {
    case 'UNLOCK':
      return state.phase === 'idle' ? { phase: 'unlocking', result: null, winnerSlot: null, startedAt: action.at } : state;
    case 'SPIN':
      return state.phase === 'unlocking' ? { ...state, phase: 'spinning' } : state;
    case 'SETTLE':
      return state.phase === 'spinning' ? { ...state, phase: 'settled', result: action.winner, winnerSlot: action.slot } : state;
    case 'REVEAL':
      return state.phase === 'settled' ? { ...state, phase: 'revealed' } : state;
    case 'DISMISS':
      return state.phase === 'revealed' ? { ...initialUnlockState } : state;
  }
}

export const isBusy = (phase: Phase) => phase !== 'idle' && phase !== 'revealed';

/** Gold-tier contents stay secret throughout the reel and settle hold, then appear on reveal. */
export const shouldMaskGold = (phase: Phase) => phase !== 'revealed';
