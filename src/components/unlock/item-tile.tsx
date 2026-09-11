import { useEffect, useRef, useState } from 'react';
import { ItemArtView, MysteryArt } from '@/components/food-card';
import { copy, fmt, itemName, itemSubtitle, priceLabel, type Language } from '@/lib/i18n';
import type { CaseItem } from '@/lib/items/types';
import { RARITY_COLORS } from '@/lib/rarity';

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();
/** One shared observer flips tiles to "visible" before they scroll in, so first paint loads a few atlases, not all. */
function observe(element: Element, onVisible: () => void) {
  if (typeof IntersectionObserver === 'undefined') { onVisible(); return () => {}; }
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) { callbacks.get(entry.target)?.(); observer?.unobserve(entry.target); callbacks.delete(entry.target); }
  }, { rootMargin: '600px 0px' });
  callbacks.set(element, onVisible);
  observer.observe(element);
  return () => { observer?.unobserve(element); callbacks.delete(element); };
}

export function ItemTile({ item, language, showPrice = true }: { item: CaseItem; language: Language; showPrice?: boolean }) {
  const t = copy[language];
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(item.art.kind === 'icon');
  useEffect(() => { if (visible || !ref.current) return; return observe(ref.current, () => setVisible(true)); }, [visible]);
  return (
    <li ref={ref} className="item-tile" style={{ '--rarity': RARITY_COLORS[item.rarity] } as React.CSSProperties} title={`${t.tiers[item.rarity]} · ${itemSubtitle(item, language)}`}>
      <div className="thumb">{visible ? <ItemArtView item={item} language={language} /> : <div className="thumb-placeholder" aria-hidden="true" />}</div>
      <div className="rarity-bar" aria-hidden="true" />
      <div className="tile-text">
        <span className="tile-name">{itemName(item, language)}</span>
        <span className="tile-price">{showPrice ? priceLabel(item.price, language, true) : itemSubtitle(item, language)}</span>
      </div>
    </li>
  );
}

export function GoldTile({ count, language }: { count: number; language: Language }) {
  const t = copy[language];
  return (
    <li className="item-tile gold" style={{ '--rarity': RARITY_COLORS[4] } as React.CSSProperties} title={t.tiers[4]}>
      <div className="thumb"><MysteryArt language={language} /></div>
      <div className="rarity-bar" aria-hidden="true" />
      <div className="tile-text">
        <span className="tile-name">{t.mystery}</span>
        <span className="tile-price">{fmt(t.mysteryCount, { n: count })}</span>
      </div>
    </li>
  );
}
