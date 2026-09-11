import { Lock } from 'lucide-react';
import { useState } from 'react';
import { CASE_FALLBACK_URL, SOURCE_HUE, caseImageUrl } from '@/lib/case-model';
import type { CaseDef } from '@/lib/cases';
import { caseName, copy, type Language } from '@/lib/i18n';

type Props = { def: CaseDef; language: Language; selected: boolean; locked: boolean; onSelect: () => void; onOpen: () => void };

/** CS2 inventory tile: image, name band, accent bottom border, gold outline when selected. */
export function CaseTile({ def, language, selected, locked, onSelect, onOpen }: Props) {
  const t = copy[language];
  const [missing, setMissing] = useState(false);
  return (
    <li data-case-id={def.id}>
      <button
        type="button"
        className={`case-tile ${selected ? 'is-selected' : ''} ${locked ? 'is-locked' : ''}`}
        style={{ '--accent': def.accent } as React.CSSProperties}
        aria-pressed={selected}
        onClick={onSelect}
        onDoubleClick={() => { if (!locked) onOpen(); }}
        onKeyDown={(event) => { if (event.key === 'Enter' && !locked) { event.preventDefault(); onOpen(); } }}
      >
        <span className="case-tile-art">
          <img src={missing ? CASE_FALLBACK_URL : caseImageUrl(def.id)} alt="" width={768} height={576} decoding="async" loading="lazy" onError={() => setMissing(true)} style={!missing || def.hue === SOURCE_HUE ? undefined : { filter: `hue-rotate(${def.hue - SOURCE_HUE}deg)` }} />
          {locked && <span className="case-tile-lock"><Lock size={18} aria-hidden="true" /> {t.comingSoon}</span>}
        </span>
        <span className="case-tile-name">{caseName(def, language)}</span>
      </button>
    </li>
  );
}
