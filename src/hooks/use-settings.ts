import { useCallback, useEffect, useState } from 'react';
import type { CaseDef } from '@/lib/cases';
import { clearCookie, readCookie, writeCookie } from '@/lib/cookies';

export type CaseSettings = { budget: string; custom: string; veg: boolean };
type Stored = { v: 2; sound: boolean; cases: Record<string, CaseSettings> };

const EMPTY: Stored = { v: 2, sound: true, cases: {} };

export function defaultCaseSettings(def: CaseDef): CaseSettings {
  return { budget: String(def.budgets.default), custom: String(def.budgets.default), veg: false };
}

function sanitizeCase(raw: unknown): CaseSettings | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.budget !== 'string' || typeof value.custom !== 'string' || typeof value.veg !== 'boolean') return null;
  if (value.budget !== 'custom' && !/^\d{1,3}$/.test(value.budget)) return null;
  if (!/^\d{0,3}(\.\d+)?$/.test(value.custom)) return null;
  return { budget: value.budget, custom: value.custom, veg: value.veg };
}

function load(): Stored {
  const saved = readCookie<Record<string, unknown>>('settings');
  if (!saved || typeof saved !== 'object') return EMPTY;
  const sound = typeof saved.sound === 'boolean' ? saved.sound : true;
  if (saved.v === 2 && saved.cases && typeof saved.cases === 'object') {
    const cases: Record<string, CaseSettings> = {};
    for (const [id, raw] of Object.entries(saved.cases as Record<string, unknown>).slice(0, 16)) {
      const clean = sanitizeCase(raw);
      if (clean) cases[id] = clean;
    }
    return { v: 2, sound, cases };
  }
  // v1 shape: {budget, custom, veg, sound} applied to the main dish case.
  const legacy = sanitizeCase({ budget: saved.budget, custom: saved.custom, veg: saved.veg });
  return { v: 2, sound, cases: legacy ? { 'mon-chinh': legacy } : {} };
}

/** Sound toggle + per-case budget/veg choices, persisted in one bounded cookie. */
export function useSettings() {
  const [state, setState] = useState<Stored>(EMPTY);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
    // Cookies from the removed spin counter are no longer written; clear them once.
    for (const key of ['spins', 'last-choice']) { try { clearCookie(key); } catch { /* fine */ } }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { writeCookie('settings', state); setError(false); } catch { setError(true); }
  }, [state, ready]);

  const forCase = useCallback((def: CaseDef): CaseSettings => {
    const saved = state.cases[def.id];
    if (!saved) return defaultCaseSettings(def);
    const presetOk = saved.budget === 'custom' || def.budgets.presets.includes(Number(saved.budget));
    return presetOk ? saved : { ...saved, budget: String(def.budgets.default) };
  }, [state]);

  const updateCase = useCallback((def: CaseDef, patch: Partial<CaseSettings>) => {
    setState((current) => ({ ...current, cases: { ...current.cases, [def.id]: { ...(current.cases[def.id] ?? defaultCaseSettings(def)), ...patch } } }));
  }, []);

  const setSound = useCallback((sound: boolean) => setState((current) => ({ ...current, sound })), []);

  return { ready, sound: state.sound, setSound, forCase, updateCase, error };
}

export type Settings = ReturnType<typeof useSettings>;
