import { CaseStage } from '@/components/unlock/case-stage';
import { decalFor } from '@/lib/case-decals';
import { caseShowsCommerce, type CaseDef } from '@/lib/cases';
import { caseDescription, caseName, copy, fmt, type Language } from '@/lib/i18n';
import type { CaseItem } from '@/lib/items/types';

type Props = {
  def: CaseDef;
  items: CaseItem[];
  language: Language;
  reducedMotion: boolean;
  onOpen: () => void;
  onInspect: () => void;
};

/** Left panel of the inventory: the selected case in 3D plus its description and actions. */
export function CasePreview({ def, items, language, reducedMotion, onOpen, onInspect }: Props) {
  const t = copy[language];
  const prices = items.map((item) => item.price);
  const veg = items.filter((item) => item.veg).length;
  const locked = items.length === 0;
  return (
    <aside className="inv-preview" style={{ '--accent': def.accent } as React.CSSProperties} aria-label={caseName(def, language)}>
      <div className="inv-stage">
        <CaseStage phase="idle" startedAt={0} reducedMotion={reducedMotion} language={language} hue={def.hue} caseId={def.id} decal={decalFor(def)} variant="preview" />
      </div>
      <div className="inv-info">
        {!def.gated && <span className="inv-type">{fmt(t.caseType, { n: items.length })}</span>}
        <h2 className="inv-name">{caseName(def, language)}</h2>
        {!def.gated && <p className="inv-desc">{caseDescription(def, language)}</p>}
        {!def.gated && (
          <div className="inv-chips">
            {caseShowsCommerce(def) && items.length > 0 && <span className="chip">{fmt(t.budgetRange, { min: Math.min(...prices), max: Math.max(...prices) })}</span>}
            {veg > 0 && veg < items.length && <span className="chip">{fmt(t.vegCount, { m: veg })}</span>}
          </div>
        )}
        <div className="inv-actions">
          <button type="button" className="unlock-button" onClick={onOpen} disabled={locked}>{locked ? t.comingSoon : t.unlock}</button>
          {!def.gated && <button type="button" className="text-button" onClick={onInspect} disabled={locked}>{t.viewItems}</button>}
        </div>
      </div>
    </aside>
  );
}
