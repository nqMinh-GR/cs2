import { createFoodSelector, createUniformSelector } from './case-mechanics';
import { foods, type Cuisine, type Food } from './foods';
import { drinks } from './items/drinks';
import { snacks } from './items/snacks';
import { vegExtra } from './items/veg-extra';
import { desserts } from './items/desserts';
import { streetSnacks } from './items/street-snacks';
import { positions } from './items/positions';
import type { AuthoredItem, CaseItem } from './items/types';
import { personalFoods, type PoolProfile } from './personal-pool';

export type CaseId = 'mon-chinh' | 'do-uong' | 'mon-nhau' | 'do-chay' | 'mon-ngot' | 'an-vat' | 'viet-nam' | 'nhat-han' | 'au-my' | 'a-dong' | '18-plus';

export type CaseDef = {
  id: CaseId;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  /** Accent used for tile borders and type lines. */
  accent: string;
  /** Target hue (deg) the model's yellow paint is shifted to. */
  hue: number;
  /** Price (k VND) upper bounds for rarity 0..3; above the last = gold. */
  rarityThresholds: [number, number, number, number];
  budgets: { presets: number[]; default: number; min: number; max: number };
  /** Show the vegetarian switch. */
  vegFilter: boolean;
  /** "Món của tôi": catalog toggles + custom dishes apply. */
  customPool: boolean;
  /** Password before inspect/spin; every spin asks again. */
  gated?: boolean;
  /** Maps / GrabFood / VND budget chips. Default true. */
  commerce?: boolean;
  /** Give every item identical odds instead of weighting toward a target price. */
  uniformOdds?: boolean;
  source: { kind: 'foods'; cuisines?: Cuisine[]; veg?: true } | { kind: 'authored'; items: AuthoredItem[]; plusVegFoods?: true };
};

export const caseShowsCommerce = (def: Pick<CaseDef, 'commerce'>) => def.commerce !== false;

const FOOD_THRESHOLDS: [number, number, number, number] = [40, 65, 100, 130];
const FOOD_BUDGETS = { presets: [35, 50, 75, 100, 150, 250], default: 50, min: 30, max: 300 };

export const cases: CaseDef[] = [
  {
    id: 'mon-chinh', nameVi: 'Hòm Món Chính', nameEn: 'Main Dish Case',
    descVi: 'Bộ sưu tập món trưa quốc dân, từ cơm tấm vỉa hè tới sushi cá hồi và cơm hầm sâm.',
    descEn: 'Everyday lunch dishes, from street-side broken rice to salmon sushi and samgyetang.',
    accent: '#e4ae39', hue: 48, rarityThresholds: FOOD_THRESHOLDS, budgets: FOOD_BUDGETS, vegFilter: true, customPool: true,
    source: { kind: 'foods' },
  },
  {
    id: 'do-uong', nameVi: 'Hòm Đồ Uống', nameEn: 'Drinks Case',
    descVi: 'Từ trà đá 5k tới cold brew 60k — chọn ly cho buổi trưa.',
    descEn: 'From 5k iced tea to 60k cold brew — pick your lunch drink.',
    accent: '#2ec4c4', hue: 185, rarityThresholds: [20, 35, 50, 60], budgets: { presets: [20, 30, 45, 60], default: 30, min: 5, max: 100 }, vegFilter: false, customPool: false,
    source: { kind: 'authored', items: drinks },
  },
  {
    id: 'mon-nhau', nameVi: 'Hòm Món Nhậu', nameEn: 'Sharing Plates Case',
    descVi: 'Đồ nhắm tan làm: đậu phộng, khô gà, ốc, mực nướng, gà ủ muối.',
    descEn: 'After-work sharing plates: peanuts, dried chicken, snails, grilled squid, salt-baked chicken.',
    accent: '#e8712b', hue: 22, rarityThresholds: [45, 80, 120, 160], budgets: { presets: [50, 80, 120, 160], default: 80, min: 30, max: 250 }, vegFilter: true, customPool: false,
    source: { kind: 'authored', items: snacks },
  },
  {
    id: 'do-chay', nameVi: 'Hòm Đồ Chay', nameEn: 'Vegetarian Case',
    descVi: 'Toàn bộ món chay: cơm, bún, phở, lẩu chay và salad.',
    descEn: 'All-vegetarian: rice, noodles, pho, hotpot and salads.',
    accent: '#6fbf4a', hue: 110, rarityThresholds: [35, 45, 60, 90], budgets: { presets: [35, 50, 65, 150], default: 50, min: 25, max: 220 }, vegFilter: false, customPool: false,
    source: { kind: 'authored', items: vegExtra, plusVegFoods: true },
  },
  {
    id: 'mon-ngot', nameVi: 'Hòm Món Ngọt', nameEn: 'Dessert Case',
    descVi: 'Chè, bánh flan, kem chuối, tào phớ — kết thúc bữa trưa.',
    descEn: 'Che, flan, banana ice cream, tofu pudding — a sweet finish.',
    accent: '#e86aa0', hue: 330, rarityThresholds: [20, 30, 45, 70], budgets: { presets: [20, 35, 50], default: 30, min: 10, max: 100 }, vegFilter: true, customPool: false,
    source: { kind: 'authored', items: desserts },
  },
  {
    id: 'an-vat', nameVi: 'Hòm Ăn Vặt', nameEn: 'Street Snacks Case',
    descVi: 'Bánh tráng, bánh bèo, trái cây dầm và đồ chiên vỉa hè.',
    descEn: 'Rice paper, banh beo, fruit cups and street-fried bites.',
    accent: '#f0a020', hue: 32, rarityThresholds: [20, 35, 50, 80], budgets: { presets: [20, 35, 50, 80], default: 35, min: 10, max: 120 }, vegFilter: true, customPool: false,
    source: { kind: 'authored', items: streetSnacks },
  },
  {
    id: 'viet-nam', nameVi: 'Hòm Việt Nam', nameEn: 'Vietnam Case',
    descVi: 'Cơm, phở, bún, bánh mì — tinh hoa quán trưa ba miền.',
    descEn: 'Rice, pho, noodles, banh mi — lunch classics from all three regions.',
    accent: '#d94848', hue: 0, rarityThresholds: FOOD_THRESHOLDS, budgets: FOOD_BUDGETS, vegFilter: true, customPool: false,
    source: { kind: 'foods', cuisines: ['vn'] },
  },
  {
    id: 'nhat-han', nameVi: 'Hòm Nhật–Hàn', nameEn: 'Japan–Korea Case',
    descVi: 'Sushi, ramen, tonkatsu, bibimbap, tteokbokki và mì cay.',
    descEn: 'Sushi, ramen, tonkatsu, bibimbap, tteokbokki and spicy noodles.',
    accent: '#8b5cf6', hue: 265, rarityThresholds: FOOD_THRESHOLDS, budgets: FOOD_BUDGETS, vegFilter: false, customPool: false,
    source: { kind: 'foods', cuisines: ['jp', 'kr'] },
  },
  {
    id: 'au-my', nameVi: 'Hòm Âu–Mỹ', nameEn: 'Western Case',
    descVi: 'Pizza, pasta, burger, steak, burrito và kebab.',
    descEn: 'Pizza, pasta, burgers, steak, burritos and kebab.',
    accent: '#4b8bff', hue: 220, rarityThresholds: FOOD_THRESHOLDS, budgets: FOOD_BUDGETS, vegFilter: true, customPool: false,
    source: { kind: 'foods', cuisines: ['it', 'us', 'mx', 'me', 'intl'] },
  },
  {
    id: 'a-dong', nameVi: 'Hòm Á Đông', nameEn: 'East Asia Case',
    descVi: 'Dim sum, cơm gà Hải Nam, mì bò Đài Loan, pad thai, cà ri Ấn.',
    descEn: 'Dim sum, Hainanese chicken rice, Taiwanese beef noodles, pad thai, Indian curry.',
    accent: '#d34fc1', hue: 310, rarityThresholds: FOOD_THRESHOLDS, budgets: FOOD_BUDGETS, vegFilter: false, customPool: false,
    source: { kind: 'foods', cuisines: ['cn', 'tw', 'sg', 'th', 'in'] },
  },
  {
    id: '18-plus', nameVi: 'Hòm 18+', nameEn: '18+ Case',
    descVi: 'Mystery',
    descEn: 'Mystery',
    accent: '#e23d6b', hue: 350, rarityThresholds: [15, 25, 35, 45], budgets: { presets: [18], default: 18, min: 10, max: 50 }, vegFilter: false, customPool: false, gated: true, commerce: false, uniformOdds: true,
    source: { kind: 'authored', items: positions },
  },
];

export const DEFAULT_CASE: CaseId = 'mon-chinh';
export const findCase = (id: string | null | undefined) => cases.find((def) => def.id === id);

export function rarityFor(def: Pick<CaseDef, 'rarityThresholds'>, price: number) {
  const index = def.rarityThresholds.findIndex((limit) => price <= limit);
  return index === -1 ? 4 : index;
}

export function foodToItem(food: Food, def: CaseDef): CaseItem {
  return {
    id: food.customId ? `custom-${food.customId}` : `food-${food.image}`,
    name: food.name, nameEn: food.nameEn, sub: food.sub, price: food.price, veg: food.veg, customId: food.customId,
    rarity: rarityFor(def, food.price),
    art: food.customId ? { kind: 'icon', icon: 'plate' } : food.photo ? { kind: 'photo', src: food.photo } : { kind: 'atlas', image: food.image },
  };
}

function authoredToItem(item: AuthoredItem, index: number, def: CaseDef): CaseItem {
  return {
    id: `${def.id}-${index}`,
    name: def.gated ? item.nameEn : item.name, nameEn: item.nameEn, sub: item.sub, subEn: item.subEn, price: item.price, veg: item.veg,
    rarity: rarityFor(def, item.price),
    art: item.photo ? { kind: 'photo', src: item.photo } : { kind: 'icon', icon: item.icon },
  };
}

/** Everything the case can drop for this browser's profile ("Món của tôi" only affects customPool cases). */
export function caseItems(def: CaseDef, profile: PoolProfile): CaseItem[] {
  if (def.source.kind === 'foods') {
    const { cuisines, veg } = def.source;
    const pool = def.customPool ? personalFoods(profile) : foods;
    return pool
      .filter((food) => !cuisines || food.customId || cuisines.includes(food.cuisine))
      .filter((food) => !veg || food.veg)
      .map((food) => foodToItem(food, def));
  }
  const authored = def.source.items.map((item, index) => authoredToItem(item, index, def));
  const extra = def.source.plusVegFoods ? foods.filter((food) => food.veg).map((food) => foodToItem(food, def)) : [];
  return [...extra, ...authored];
}

/** Budget-weighted selector; the target is clamped into the pool's price range so it always exists. */
export function caseSelector(items: CaseItem[], target: number, uniformOdds = false) {
  if (!items.length) return null;
  if (uniformOdds) return createUniformSelector(items);
  const prices = items.map((item) => item.price);
  const feasible = Math.max(Math.min(...prices), Math.min(target, Math.max(...prices)));
  return createFoodSelector(items, feasible);
}

export const hasGold = (items: CaseItem[]) => items.some((item) => item.rarity === 4);
