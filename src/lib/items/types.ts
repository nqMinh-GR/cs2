import type { IconKey } from './icons';

export type ItemArt = { kind: 'atlas'; image: number } | { kind: 'icon'; icon: IconKey } | { kind: 'photo'; src: string };

/** Anything a case can drop: catalog dishes, custom dishes, drinks, sharing plates. */
export type CaseItem = {
  id: string;
  name: string;
  nameEn?: string;
  sub: string;
  subEn?: string;
  /** Thousand VND. */
  price: number;
  rarity: number;
  veg?: boolean;
  art: ItemArt;
  customId?: string;
};

/** Hand-authored entry; id/rarity/art are derived when a case materializes it. */
export type AuthoredItem = { name: string; nameEn: string; sub: string; subEn: string; price: number; icon: IconKey; photo?: string; veg?: boolean };
