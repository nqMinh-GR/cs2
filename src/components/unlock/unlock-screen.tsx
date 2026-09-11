import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { AdultGateDialog } from '@/components/adult-gate-dialog';
import { Cs2Nav } from '@/components/cs2-nav';
import { BottomBar } from '@/components/unlock/bottom-bar';
import { CaseStage } from '@/components/unlock/case-stage';
import { ItemGrid } from '@/components/unlock/item-grid';
import { Reel } from '@/components/unlock/reel';
import { RevealDialog } from '@/components/unlock/reveal-dialog';
import type { CaseSettings } from '@/hooks/use-settings';
import { useUnlockFlow } from '@/hooks/use-unlock-flow';
import type { CaseAudio } from '@/lib/case-audio';
import { decalFor } from '@/lib/case-decals';
import { caseSelector, caseShowsCommerce, type CaseDef } from '@/lib/cases';
import { caseName, copy, fmt, itemName, priceLabel, type Language } from '@/lib/i18n';
import type { CaseItem } from '@/lib/items/types';
import { isBusy } from '@/lib/unlock-state';

type Props = {
  def: CaseDef;
  items: CaseItem[];
  language: Language;
  onLanguage: () => void;
  sound: boolean;
  onSound: () => void;
  settings: CaseSettings;
  onSettings: (patch: Partial<CaseSettings>) => void;
  cookieError: boolean;
  audio: RefObject<CaseAudio | null>;
  reducedMotion: boolean;
  onBack: () => void;
  onOpenPrefs?: () => void;
  initialExpanded?: boolean;
  /** Session flag from App: password already accepted this visit. */
  adultUnlocked?: boolean;
  onAdultUnlocked?: () => void;
  autoSpin?: boolean;
  onAutoSpinConsumed?: () => void;
};

/** CS2 "Unlock Container": title, case stage (3D + reel), item grid, bottom bar, reveal. */
export function UnlockScreen({ def, items, language, onLanguage, sound, onSound, settings, onSettings, cookieError, audio, reducedMotion, onBack, onOpenPrefs, initialExpanded = false, adultUnlocked = false, onAdultUnlocked, autoSpin = false, onAutoSpinConsumed }: Props) {
  const t = copy[language];
  const commerce = caseShowsCommerce(def);
  const target = settings.budget === 'custom' ? Number(settings.custom) : Number(settings.budget);
  const validTarget = Number.isInteger(target) && target >= def.budgets.min && target <= def.budgets.max;
  const vegAvailable = def.vegFilter && items.some((item) => item.veg);
  const vegOn = vegAvailable && settings.veg;
  const eligible = useMemo(() => items.filter((item) => !vegOn || item.veg), [items, vegOn]);
  const selector = useMemo(() => caseSelector(eligible, validTarget ? target : def.budgets.default, def.uniformOdds), [eligible, target, validTarget, def.budgets.default, def.uniformOdds]);
  const flow = useUnlockFlow({ eligible, selector, validTarget, audio, reducedMotion });
  const { phase, result, winnerSlot, startedAt } = flow.state;
  const busy = isBusy(phase);
  const [expanded, setExpanded] = useState(initialExpanded);
  const unlockRef = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const needsPassword = !!def.gated && !adultUnlocked;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    if (!autoSpin) return;
    onAutoSpinConsumed?.();
    flow.open();
  }, [autoSpin, flow.open, onAutoSpinConsumed]);

  useEffect(() => {
    if (phase === 'unlocking') {
      setStatus(t.unlocking);
      if (window.matchMedia('(max-width: 767px)').matches) stage.current?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
    } else if (phase === 'revealed' && result) {
      setStatus(commerce
        ? fmt(t.resultStatus, { name: itemName(result, language), tier: t.tiers[result.rarity], price: priceLabel(result.price, language, true) })
        : fmt(t.resultStatusPlain, { name: itemName(result, language), tier: t.tiers[result.rarity] }));
    } else if (phase === 'idle') setStatus('');
  }, [phase, result, language, t, reducedMotion, commerce]);

  const requestUnlock = () => {
    if (needsPassword) return;
    flow.open();
  };

  const dimmed = phase !== 'idle';
  return (
    <div className="unlock-shell">
      <Cs2Nav language={language} onLanguage={onLanguage} sound={sound} onSound={onSound} onBack={onBack} crumb={caseName(def, language)} onOpenPrefs={onOpenPrefs} prefsDisabled={busy} />
      <main className="unlock-screen" data-phase={phase} style={{ '--accent': def.accent } as React.CSSProperties}>
        <hgroup className="unlock-title-block">
          <h1 ref={heading} tabIndex={-1} className="unlock-title">{t.unlockTitle}</h1>
          <p className="unlock-subtitle">{caseName(def, language)}</p>
        </hgroup>
        <div ref={stage} className={`stage ${phase !== 'idle' ? 'is-unlocking' : ''} ${phase === 'revealed' ? 'is-revealed' : ''}`} aria-busy={busy}>
          <CaseStage phase={phase} startedAt={startedAt} reducedMotion={reducedMotion} language={language} hue={def.hue} caseId={def.id} decal={decalFor(def)} variant="unlock" />
          <Reel items={flow.reel.map(({ id, food }) => ({ id, item: food }))} visibleStart={flow.visibleStart} maskGold={flow.maskGold} winnerSlot={winnerSlot} language={language} viewportRef={flow.viewport} attachTrack={flow.attachTrack} hidden={phase === 'idle' || phase === 'unlocking'} />
          <div className="stage-dim" aria-hidden="true" />
        </div>
        <div className={`bar-wrap ${dimmed ? 'is-dimmed' : ''}`}>
          {cookieError && <p role="status" className="preferences-message">{t.cookieError}</p>}
          <BottomBar def={def} language={language} settings={{ ...settings, veg: vegOn }} vegAvailable={vegAvailable} onChange={onSettings} phase={phase} validTarget={validTarget} target={target} expectedPrice={selector?.expectedPrice ?? 0} eligibleCount={eligible.length} onUnlock={requestUnlock} onOpenPrefs={onOpenPrefs} onClose={onBack} unlockRef={unlockRef} adultUnlocked={adultUnlocked} />
        </div>
        <div className={`panel-wrap ${dimmed ? 'is-dimmed' : ''}`}>
          <ItemGrid items={eligible} language={language} disabled={busy} expanded={expanded} onToggle={() => setExpanded((value) => !value)} showPrice={commerce} />
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status}</p>
      </main>
      <RevealDialog item={result} open={phase === 'revealed'} onClose={flow.dismiss} language={language} finalFocusRef={unlockRef} commerce={commerce} />
      <AdultGateDialog open={needsPassword} language={language} onClose={onBack} onSuccess={() => onAdultUnlocked?.()} />
    </div>
  );
}
