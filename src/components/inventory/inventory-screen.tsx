import { useEffect, useMemo, useRef } from 'react';
import { Cs2Nav } from '@/components/cs2-nav';
import { CasePreview } from '@/components/inventory/case-preview';
import { CaseTile } from '@/components/inventory/case-tile';
import { caseItems, cases, type CaseDef } from '@/lib/cases';
import { copy, fmt, type Language } from '@/lib/i18n';
import type { PoolProfile } from '@/lib/personal-pool';

type Props = {
  language: Language;
  onLanguage: () => void;
  sound: boolean;
  onSound: () => void;
  profile: PoolProfile;
  selected: CaseDef;
  onSelect: (def: CaseDef) => void;
  onOpen: (def: CaseDef, inspect?: boolean) => void;
  reducedMotion: boolean;
  notice?: string;
  /** Tile to refocus when returning from the unlock screen. */
  focusCaseId?: string | null;
};

/** CS2 inventory: nav, large preview of the selected container on the left, tile grid on the right. */
export function InventoryScreen({ language, onLanguage, sound, onSound, profile, selected, onSelect, onOpen, reducedMotion, notice, focusCaseId }: Props) {
  const t = copy[language];
  const counts = useMemo(() => new Map(cases.map((def) => [def.id, caseItems(def, profile)])), [profile]);
  const selectedItems = counts.get(selected.id) ?? [];
  const grid = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const select = (def: CaseDef) => {
    onSelect(def);
    if (window.matchMedia('(max-width: 1023px) and (min-height: 541px), (max-width: 1023px) and (orientation: portrait)').matches) preview.current?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    if (!focusCaseId) return;
    grid.current?.querySelector<HTMLButtonElement>(`[data-case-id="${focusCaseId}"] button`)?.focus({ preventScroll: true });
  }, [focusCaseId]);

  return (
    <div className="inv-shell">
      <Cs2Nav language={language} onLanguage={onLanguage} sound={sound} onSound={onSound} />
      <main className="inv-screen">
        {notice && <p role="status" className="preferences-message inv-notice">{notice}</p>}
        <div className="inv-body">
          <div ref={preview} className="inv-preview-anchor" />
          <CasePreview def={selected} items={selectedItems} language={language} reducedMotion={reducedMotion} onOpen={() => onOpen(selected)} onInspect={() => onOpen(selected, true)} />
          <section className="inv-grid" aria-label={t.inventory}>
            <div className="inv-grid-head"><span>{fmt(t.casesCount, { n: cases.length })}</span><span className="inv-hint">{t.selectCase}</span></div>
            <ul ref={grid} className="case-grid">
              {cases.map((def) => (
                <CaseTile key={def.id} def={def} language={language} selected={def.id === selected.id} locked={(counts.get(def.id)?.length ?? 0) === 0} onSelect={() => select(def)} onOpen={() => onOpen(def)} />
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
