import type { IconKey } from '@/lib/items/icons';
import { RARITY_COLORS } from '@/lib/rarity';

/**
 * Placeholder artwork for items that have no photo atlas yet: a simple two-tone glyph on the same dark
 * plate the food photos use, tinted by rarity. Swap an item's `art` to an atlas entry to replace it.
 */
const GLYPHS: Record<IconKey, string> = {
  cup: 'M28 30h40l-4 44H32zM68 38h8a8 8 0 0 1 0 16h-9M26 80h44',
  glass: 'M30 26h40l-6 50H36zM34 40h32M32 84h36',
  mug: 'M26 30h42v44a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6zM68 40h8a9 9 0 0 1 0 18h-8M34 30v-6h26v6',
  bottle: 'M42 18h16v14l6 10v40a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V42l6-10zM36 56h28',
  can: 'M32 26h36v50a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6zM32 40h36M32 66h36M46 26v-6h8v6',
  coconut: 'M50 24c18 0 30 14 30 30s-12 30-30 30-30-14-30-30 12-30 30-30zM50 24v12M44 20l8 8 8-8',
  teacup: 'M26 40h44v22a14 14 0 0 1-14 14H40a14 14 0 0 1-14-14zM70 46h8a8 8 0 0 1 0 14h-9M22 82h52M40 28c0-6 6-6 6-12M52 28c0-6 6-6 6-12',
  boba: 'M32 26h36l-4 52H36zM36 32h28M48 18l6 60M40 64h4M50 66h4M58 62h4M42 56h4',
  smoothie: 'M30 28h40l-5 50H35zM30 36h40M56 18l-6 20M40 50h20',
  juice: 'M34 24h32l-4 56H38zM34 42h32M48 24l8-8M40 66h20',
  coldbrew: 'M36 22h28v22H36zM40 44h20v36H40zM44 30h12M44 36h12M45 62h10',
  plate: 'M18 56h64M24 56a26 12 0 0 0 52 0M36 46c4-8 12-12 22-10s14 6 16 10',
  bowl: 'M20 44h60a30 30 0 0 1-60 0zM30 44c6-10 14-14 20-14s14 4 20 14M34 82h32',
  skewer: 'M22 78L78 22M36 50l6 6M46 40l6 6M56 30l6 6M30 56l8 8M40 46l8 8',
  peanut: 'M36 30c8 0 12 6 12 12s4 12 12 12 12 6 12 12-6 12-14 12-12-6-12-12-4-12-12-12-12-6-12-12 6-12 14-12z',
  shell: 'M50 24c18 0 30 12 30 28 0 18-14 30-30 30S20 70 20 52c0-16 12-28 30-28zM50 24v58M32 34l18 18M68 34L50 52M26 52h48',
  wing: 'M22 64c8-20 24-34 44-36 6 0 10 4 8 10-4 14-18 26-36 32M42 58l12 12M52 46l10 10',
  fish: 'M22 50c10-14 24-22 38-22 8 6 12 14 12 22s-4 16-12 22c-14 0-28-8-38-22zM72 50l12-12v24zM58 46h4',
  tofu: 'M28 34h36v30H28zM28 34l8-8h36l-8 8M64 34l8-8v30l-8 8M40 46h12',
  fries: 'M30 46h40l-4 34H34zM36 46l2-24M46 46l1-26M54 46l-1-26M62 46l-2-22',
  hotpot: 'M22 46h56v10a28 20 0 0 1-56 0zM30 46c4-10 12-14 20-14s16 4 20 14M18 50h-4M82 50h4M40 26v-8M50 26v-8M60 26v-8',
  roll: 'M26 36h48a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V44a8 8 0 0 1 8-8zM26 36c-4 8-4 20 0 28M74 36c4 8 4 20 0 28M40 50h20',
  banhxeo: 'M20 52c0-14 14-24 30-24s30 10 30 24S66 76 50 76 20 66 20 52zM26 44h48M32 60h36M44 36l6 8',
  noodles: 'M24 46h52a26 20 0 0 1-52 0zM30 46c2-16 6-24 12-28M42 46c0-14 4-22 10-28M56 46c2-12 6-20 12-26M34 82h32',
  rice: 'M20 50h60a30 20 0 0 1-60 0zM34 48c2-8 8-14 16-14s14 6 16 14M36 82h28M46 26l4-8 4 8',
  heart: 'M50 82C22 58 16 34 34 24c9-5 16 2 16 12 0-10 7-17 16-12 18 10 12 34-16 58z',
};

export function IconArt({ icon, rarity, label }: { icon: IconKey; rarity: number; label: string }) {
  const color = RARITY_COLORS[rarity] ?? RARITY_COLORS[0];
  return (
    <div className="icon-art" role="img" aria-label={label} style={{ '--rarity': color } as React.CSSProperties}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d={GLYPHS[icon]} fill="none" stroke="var(--rarity)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
        <path d={GLYPHS[icon]} fill="none" stroke="#f3f5f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
