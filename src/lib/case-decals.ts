import type { CaseId } from './cases';

/** Front-panel decal per case: a diamond badge with a glyph and short label, plus a dark diagonal stripe. */
export type CaseDecal = { glyph: string; label: string; accent: string };

/** Glyph paths live in a 100×100 box and are stroked, like the item placeholder icons. */
const GLYPHS: Record<CaseId, string> = {
  'mon-chinh': 'M24 46h52a26 20 0 0 1-52 0zM30 46c2-16 6-24 12-28M42 46c0-14 4-22 10-28M56 46c2-12 6-20 12-26M34 82h32',
  'do-uong': 'M28 30h40l-4 44H32zM68 38h8a8 8 0 0 1 0 16h-9M26 80h44M58 30l6-14',
  'mon-nhau': 'M26 30h42v44a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6zM68 40h8a9 9 0 0 1 0 18h-8M34 30v-6h26v6M38 44v24M50 44v24',
  'do-chay': 'M22 78C22 44 44 22 80 22c0 36-22 58-58 58zM22 78l40-40M40 58l-10-2M52 46l-2-10',
  'mon-ngot': 'M28 74h44v8H28zM36 74c2-28 8-44 14-44s12 16 14 44M42 30c0-8 8-12 8-12s8 4 8 12',
  'an-vat': 'M22 78L78 22M36 50l6 6M46 40l6 6M56 30l6 6M30 56l8 8M40 46l8 8',
  'viet-nam': 'M50 14l10.6 22.6 24.8 3-18.3 17.1 4.7 24.5L50 69.4 28.2 81.2l4.7-24.5L14.6 39.6l24.8-3z',
  'nhat-han': 'M16 30h68M22 30l-2-6h60l-2 6M26 30v50M74 30v50M30 48h40M50 48v32',
  'au-my': 'M20 44c0-14 14-22 30-22s30 8 30 22H20zM18 56h64M20 66h60c0 8-8 14-16 14H36c-8 0-16-6-16-14zM34 34h2M50 32h2M64 36h2',
  'a-dong': 'M22 40h56v22a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10zM22 52h56M40 40c0-10 6-16 10-16s10 6 10 16M30 82h40',
  '18-plus': 'M50 82C22 58 16 34 34 24c9-5 16 2 16 12 0-10 7-17 16-12 18 10 12 34-16 58z',
};

const LABELS: Record<CaseId, string> = {
  'mon-chinh': 'MÓN CHÍNH', 'do-uong': 'ĐỒ UỐNG', 'mon-nhau': 'MÓN NHẬU', 'do-chay': 'ĐỒ CHAY',
  'mon-ngot': 'MÓN NGỌT', 'an-vat': 'ĂN VẶT',
  'viet-nam': 'VIỆT NAM', 'nhat-han': 'NHẬT–HÀN', 'au-my': 'ÂU–MỸ', 'a-dong': 'Á ĐÔNG',
  '18-plus': '18+',
};

const cache = new Map<CaseId, CaseDecal>();
/** Stable per case, so memoized 3D builds keyed on the decal object are not rebuilt every render. */
export function decalFor(def: { id: CaseId; accent: string }): CaseDecal {
  let decal = cache.get(def.id);
  if (!decal) { decal = { glyph: GLYPHS[def.id], label: LABELS[def.id], accent: def.accent }; cache.set(def.id, decal); }
  return decal;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? r * 0.45 : r, angle = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.closePath();
}

/** Diamond badge (512×512, transparent) projected onto the case's front panel. Pure canvas 2D — no three import. */
export function drawBadge(decal: CaseDecal, size = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const s = size / 512;
  ctx.scale(s, s);
  ctx.translate(256, 256);
  ctx.save();
  ctx.rotate(Math.PI / 4);
  roundRect(ctx, -150, -150, 300, 300, 26);
  ctx.fillStyle = 'rgba(16, 19, 24, .95)'; ctx.fill();
  ctx.lineWidth = 10; ctx.strokeStyle = decal.accent; ctx.stroke();
  roundRect(ctx, -128, -128, 256, 256, 18);
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255, 255, 255, .22)'; ctx.stroke();
  ctx.restore();
  // glyph
  ctx.save();
  ctx.translate(-72, -118); ctx.scale(1.44, 1.44);
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = decal.accent; ctx.stroke(new Path2D(decal.glyph));
  ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(255, 255, 255, .85)'; ctx.stroke(new Path2D(decal.glyph));
  ctx.restore();
  // star + label
  star(ctx, 0, 62, 15); ctx.fillStyle = decal.accent; ctx.fill();
  ctx.fillStyle = '#eef1f4';
  ctx.font = "700 27px 'Saira Variable', 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(decal.label, 0, 108, 190);
  return canvas;
}

/** Tall dark band (256×1024) with accent edges; rotated by the projector it becomes the diagonal stripe. */
export function drawStripe(decal: CaseDecal): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.fillStyle = 'rgba(12, 14, 18, .92)';
  ctx.fillRect(36, 0, 184, 1024);
  ctx.fillStyle = decal.accent;
  ctx.fillRect(24, 0, 12, 1024);
  ctx.fillRect(220, 0, 12, 1024);
  return canvas;
}
