import type { RefObject } from 'react';
import { Card } from '@/components/food-card';
import type { Language } from '@/lib/i18n';
import type { CaseItem } from '@/lib/items/types';
import { REEL_WINDOW } from '@/lib/reel-geometry';

export type ReelCard = { id: number; item: CaseItem };

type Props = {
  items: ReelCard[];
  visibleStart: number;
  maskGold: boolean;
  winnerSlot: number | null;
  language: Language;
  viewportRef: RefObject<HTMLDivElement | null>;
  attachTrack: (node: HTMLDivElement | null) => void;
  hidden: boolean;
};

/** Always mounted (opacity-hidden while idle) so `clientWidth` is valid the moment a spin starts. */
export function Reel({ items, visibleStart, maskGold, winnerSlot, language, viewportRef, attachTrack, hidden }: Props) {
  return (
    <div className="reel-slot">
      <div className={`reel-window ${hidden ? 'is-hidden' : ''}`} ref={viewportRef} aria-hidden="true">
        <div className="reel-track" ref={attachTrack}>
          {items.filter(({ id }) => id >= visibleStart && id < visibleStart + REEL_WINDOW).map(({ item, id }) => (
            <Card key={id} item={item} language={language} slot={id} maskGold={maskGold} isWinner={winnerSlot === id} />
          ))}
        </div>
        <div className="reel-focus" />
        <div className="selector-line" />
      </div>
    </div>
  );
}
