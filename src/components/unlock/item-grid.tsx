import { useMemo, useRef } from 'react';
import { GoldTile, ItemTile } from '@/components/unlock/item-tile';
import { useGridColumns } from '@/hooks/use-grid-columns';
import { collapsedSlice } from '@/lib/grid-slice';
import { copy, fmt, itemName, type Language } from '@/lib/i18n';
import type { CaseItem } from '@/lib/items/types';
import { GOLD } from '@/lib/rarity';

type Props = { items: CaseItem[]; language: Language; disabled: boolean; expanded: boolean; onToggle: () => void; showPrice?: boolean };

/** "Contains one of the following": two rows ending in the gold tile, expandable to the full list. */
export function ItemGrid({ items, language, disabled, expanded, onToggle, showPrice = true }: Props) {
  const t = copy[language];
  const grid = useRef<HTMLUListElement>(null);
  const columns = useGridColumns(grid);
  const { regular, goldCount } = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.rarity - b.rarity || a.price - b.price || itemName(a, language).localeCompare(itemName(b, language), language));
    return { regular: sorted.filter((item) => item.rarity !== GOLD), goldCount: sorted.length - sorted.filter((item) => item.rarity !== GOLD).length };
  }, [items, language]);
  const hasGold = goldCount > 0;
  const shown = expanded ? regular : collapsedSlice(regular, columns, hasGold);
  const canExpand = regular.length > shown.length || expanded;
  return (
    <section className="container-panel" aria-label={t.caseLabel}>
      <div className="panel-inner">
        <div className="panel-head">
          <span className="panel-title">{fmt(t.containsOneOf, { n: items.length })}</span>
          {canExpand && (
            <button type="button" className="inspect-button" onClick={onToggle} disabled={disabled} aria-expanded={expanded} aria-controls="dish-grid">
              {expanded ? t.hideItems : t.inspectItems}
            </button>
          )}
        </div>
        <ul id="dish-grid" className="item-grid" ref={grid}>
          {shown.map((item) => <ItemTile key={item.id} item={item} language={language} showPrice={showPrice} />)}
          {hasGold && <GoldTile count={goldCount} language={language} />}
        </ul>
      </div>
    </section>
  );
}
