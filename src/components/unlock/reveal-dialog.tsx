import { ArrowUpRight } from 'lucide-react';
import { useRef, type RefObject } from 'react';
import { ItemArtView } from '@/components/food-card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { copy, fmt, itemName, itemSubtitle, priceLabel, type Language } from '@/lib/i18n';
import type { CaseItem } from '@/lib/items/types';
import { GOLD, RARITY_COLORS } from '@/lib/rarity';

type Props = { item: CaseItem | null; open: boolean; onClose: () => void; language: Language; finalFocusRef: RefObject<HTMLButtonElement | null>; commerce?: boolean };

/** Full-screen CS2-style reveal: name in rarity color, big art, price, actions. */
export function RevealDialog({ item, open, onClose, language, finalFocusRef, commerce = true }: Props) {
  const t = copy[language];
  const continueRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className={`winner-dialog ${item?.rarity === GOLD ? 'is-gold' : ''}`} showCloseButton={false} initialFocus={continueRef} finalFocus={finalFocusRef}
        style={item ? ({ '--rarity': item.rarity === GOLD ? '#f1c85a' : RARITY_COLORS[item.rarity] } as React.CSSProperties) : undefined}>
        {item && (
          <>
            <span className="winner-label">{t.received}</span>
            <DialogTitle className="winner-title">{item.rarity === GOLD ? '★ ' : ''}{itemName(item, language)}</DialogTitle>
            <DialogDescription className="winner-description">{t.tiers[item.rarity]}{language === 'vi' ? ` · ${itemSubtitle(item, language)}` : ''}</DialogDescription>
            <div className="winner-art"><ItemArtView item={item} language={language} /><div className="winner-bar" aria-hidden="true" /></div>
            {commerce && <p className="winner-price">{t.referencePrice} · {priceLabel(item.price, language, true)} {t.perPerson}</p>}
            {!commerce && <p className="winner-price">{itemSubtitle(item, language)}</p>}
            <div className="winner-actions">
              {commerce && <a className="find-button" href={`https://www.google.com/maps/search/${encodeURIComponent(`${item.name} ${t.nearby}`)}`} target="_blank" rel="noreferrer">{t.find} <ArrowUpRight size={16} aria-hidden="true" /></a>}
              {commerce && (
                <a className="grabfood-button" href={`https://food.grab.com/vn/vi/restaurants?${new URLSearchParams({ search: item.name, 'support-deeplink': 'true', searchParameter: item.name })}`} target="_blank" rel="noreferrer" aria-label={fmt(t.grabfoodOrder, { name: itemName(item, language) })}>
                  <span className="grabfood-label">{t.grabfoodLabel} <strong>GrabFood</strong></span><ArrowUpRight size={17} aria-hidden="true" />
                </a>
              )}
              <button ref={continueRef} type="button" className="text-button continue-button" onClick={onClose}>{t.continue}</button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
