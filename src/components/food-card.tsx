import { memo } from 'react';
import { IconArt } from '@/components/icon-art';
import { copy, itemName, itemSubtitle, type Language } from '@/lib/i18n';
import type { CaseItem } from '@/lib/items/types';
import { GOLD, RARITY_COLORS } from '@/lib/rarity';
import { REEL_STEP } from '@/lib/reel-geometry';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const rareSpecialItemIcon = `${basePath}/brand/rare-special-item.png`;

/** Sprite from the 2×2 / 4×3 food atlases. Atlas math is shared with the original app; do not change. */
export function FoodImage({ image, label }: { image: number; label: string }) {
  const common = image >= 120, lunch = image >= 72 && !common, expanded = image >= 36;
  const index = common ? (image - 120) % 12 : lunch ? (image - 72) % 12 : expanded ? (image - 36) % 12 : image % 4;
  const atlas = common ? `food-common-${Math.floor((image - 120) / 12)}` : lunch ? `food-lunch-${Math.floor((image - 72) / 12)}` : expanded ? `food-expanded-${Math.floor((image - 36) / 12)}` : `food-hd-${Math.floor(image / 4)}`;
  return <div role="img" aria-label={label} className="food-image" style={{ clipPath: common ? 'inset(0 0 4% 0)' : lunch ? 'inset(0 0 7% 0)' : undefined, backgroundImage: `url(${basePath}/${atlas}.webp)`, backgroundSize: expanded ? '400% 300%' : '200% 200%', backgroundPosition: expanded ? `${index % 4 / 3 * 100}% ${(common ? [0, 50, 100] : [0, 46, 92])[Math.floor(index / 4)]}%` : `${index % 2 * 100}% ${Math.floor(index / 2) * 100}%` }} />;
}

/** Photo when the item has an atlas sprite or a cloned still; placeholder glyph otherwise. */
export function PhotoImage({ src, label }: { src: string; label: string }) {
  return <img className="food-image" src={`${basePath}${src}`} alt={label} decoding="async" />;
}

export function ItemArtView({ item, language }: { item: CaseItem; language: Language }) {
  const label = itemName(item, language);
  if (item.art.kind === 'atlas') return <FoodImage image={item.art.image} label={label} />;
  if (item.art.kind === 'photo') return <PhotoImage src={item.art.src} label={label} />;
  return <IconArt icon={item.art.icon} rarity={item.rarity} label={label} />;
}

export function MysteryArt({ language }: { language: Language }) {
  return <div className="mystery-art" role="img" aria-label={copy[language].mysteryAlt}>
    <div className="mystery-rays" />
    <img className="mystery-emblem" src={rareSpecialItemIcon} alt="" aria-hidden="true" decoding="async" />
    <div className="mystery-sheen" />
  </div>;
}

type CardProps = { item: CaseItem; language: Language; slot?: number; maskGold?: boolean; isWinner?: boolean };

/** Reel card at an absolute slot position (slot × step). Gold items stay masked until revealed. */
export const Card = memo(function Card({ item, language, slot, maskGold = true, isWinner = false }: CardProps) {
  const mystery = item.rarity === GOLD && maskGold;
  const t = copy[language];
  return (
    <div
      className={`food-card ${mystery ? 'mystery-card' : ''} ${isWinner ? 'is-winner' : ''}`}
      data-slot-id={slot}
      data-item-id={item.id}
      style={{ '--rarity': RARITY_COLORS[item.rarity], ...(slot === undefined ? {} : { position: 'absolute', left: slot * REEL_STEP }) } as React.CSSProperties}
    >
      <span className="tier">{t.tiers[item.rarity]}</span>
      {mystery ? <MysteryArt language={language} /> : <ItemArtView item={item} language={language} />}
      <div className="card-copy"><strong>{mystery ? t.mystery : itemName(item, language)}</strong><span>{itemSubtitle(item, language)}</span></div>
    </div>
  );
});
