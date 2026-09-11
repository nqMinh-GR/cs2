import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdultGateDialog } from '@/components/adult-gate-dialog';
import { CaseSheetPage } from '@/components/dev/case-sheet-page';
import { InventoryScreen } from '@/components/inventory/inventory-screen';
import { PreferencesPanel } from '@/components/preferences-panel';
import { UnlockScreen } from '@/components/unlock/unlock-screen';
import { usePreferences } from '@/hooks/use-preferences';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useSettings } from '@/hooks/use-settings';
import { CaseAudio } from '@/lib/case-audio';
import { caseItems, DEFAULT_CASE, findCase, type CaseDef } from '@/lib/cases';
import { readCookie, writeCookie } from '@/lib/cookies';
import { caseName, copy, pageTitle, type Language } from '@/lib/i18n';
import { readCaseParam, writeCaseParam } from '@/lib/url-state';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

type Screen = { name: 'inventory' } | { name: 'unlock'; inspect: boolean };
type InventoryGate = { def: CaseDef; inspect: boolean };

/** Inventory → Unlock Container, with `?case=<id>` deep links and browser back support. */
export default function App() {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('render') === 'cases') return <CaseSheetPage />;
  const [language, setLanguage] = useState<Language>('vi');
  const preferences = usePreferences();
  const settings = useSettings();
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<CaseDef>(() => findCase(readCaseParam()) ?? findCase(DEFAULT_CASE)!);
  const [screen, setScreen] = useState<Screen>(() => (findCase(readCaseParam()) ? { name: 'unlock', inspect: false } : { name: 'inventory' }));
  const [notice, setNotice] = useState('');
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [focusCaseId, setFocusCaseId] = useState<string | null>(null);
  const [inventoryGate, setInventoryGate] = useState<InventoryGate | null>(null);
  /** Session-only: after a correct password, 18+ stays open (deep link, inventory, spins). Reload asks again. */
  const [adultUnlocked, setAdultUnlocked] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);

  useEffect(() => {
    let saved: Language = 'vi';
    try { const cookie = readCookie<string>('language'); saved = cookie === 'en' || cookie === 'vi' ? cookie : 'vi'; } catch { /* default */ }
    setLanguage(saved);
    const param = readCaseParam();
    if (param && !findCase(param)) { setNotice(copy[saved].unknownCase); writeCaseParam(null, true); }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = pageTitle(language, screen.name === 'unlock' ? caseName(selected, language) : copy[language].inventory);
  }, [language, screen.name, selected]);

  const changeLanguage = useCallback(() => {
    setLanguage((current) => { const next = current === 'vi' ? 'en' : 'vi'; try { writeCookie('language', next); } catch { /* fine */ } return next; });
  }, []);

  const audio = useRef<CaseAudio | null>(null);
  useEffect(() => {
    const engine = new CaseAudio(basePath);
    audio.current = engine;
    engine.preload();
    const onVisibility = () => { if (document.hidden) engine.pause(); else engine.recover(); };
    const onHide = () => engine.pause();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onHide);
    return () => { document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('pagehide', onHide); engine.dispose(); audio.current = null; };
  }, []);
  useEffect(() => { if (settings.ready) audio.current?.setMuted(!settings.sound); }, [settings.ready, settings.sound]);

  const enterCase = useCallback((def: CaseDef, inspect = false, spin = false) => {
    setSelected(def);
    setAutoSpin(spin);
    setScreen({ name: 'unlock', inspect });
    setNotice('');
    writeCaseParam(def.id);
    window.scrollTo({ top: 0 });
  }, []);

  const openCase = useCallback((def: CaseDef, inspect = false) => {
    if (def.gated && !adultUnlocked) {
      setSelected(def);
      setInventoryGate({ def, inspect });
      return;
    }
    enterCase(def, inspect, false);
  }, [adultUnlocked, enterCase]);
  const backToInventory = useCallback((fromHistory = false) => {
    setScreen({ name: 'inventory' });
    setFocusCaseId(selected.id);
    setAutoSpin(false);
    if (!fromHistory) writeCaseParam(null);
    window.scrollTo({ top: 0 });
  }, [selected.id]);

  useEffect(() => {
    const onPop = () => {
      const def = findCase(readCaseParam());
      if (def) {
        setSelected(def);
        setAutoSpin(false);
        setScreen({ name: 'unlock', inspect: false });
      } else backToInventory(true);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [backToInventory]);

  const items = useMemo(() => caseItems(selected, preferences.profile), [selected, preferences.profile]);
  const caseSettings = settings.forCase(selected);
  const toggleSound = useCallback(() => { const next = !settings.sound; audio.current?.setMuted(!next); settings.setSound(next); }, [settings]);
  const prefsTrigger = selected.customPool ? () => setPrefsOpen(true) : undefined;

  return (
    <div className="site-shell">
      <div className="cs2-bg" aria-hidden="true" />
      {screen.name === 'inventory' ? (
        <InventoryScreen language={language} onLanguage={changeLanguage} sound={settings.sound} onSound={toggleSound} profile={preferences.profile} selected={selected} onSelect={setSelected} onOpen={openCase} reducedMotion={reducedMotion} notice={notice} focusCaseId={focusCaseId} />
      ) : (
        <UnlockScreen key={selected.id} def={selected} items={items} language={language} onLanguage={changeLanguage} sound={settings.sound} onSound={toggleSound} settings={caseSettings} onSettings={(patch) => settings.updateCase(selected, patch)} cookieError={settings.error} audio={audio} reducedMotion={reducedMotion} onBack={() => backToInventory()} onOpenPrefs={prefsTrigger} initialExpanded={screen.inspect} adultUnlocked={adultUnlocked} onAdultUnlocked={() => setAdultUnlocked(true)} autoSpin={autoSpin} onAutoSpinConsumed={() => setAutoSpin(false)} />
      )}
      <PreferencesPanel preferences={preferences} language={language} disabled={false} open={prefsOpen} onOpenChange={setPrefsOpen} hideTrigger />
      <AdultGateDialog
        open={inventoryGate !== null}
        language={language}
        onClose={() => setInventoryGate(null)}
        onSuccess={() => {
          if (!inventoryGate) return;
          const { def, inspect } = inventoryGate;
          setInventoryGate(null);
          setAdultUnlocked(true);
          enterCase(def, inspect, false);
        }}
      />
    </div>
  );
}
