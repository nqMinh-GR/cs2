const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Versioned filename: Vercel caches /models/* for a day, so a changed asset gets a new name. */
export const CASE_MODEL_URL = `${basePath}/models/csgo-case.v1.glb`;
export const CASE_FALLBACK_URL = `${basePath}/case.png`;
/** Pre-rendered image of each tinted case (exported from `/?render=cases`); falls back to case.png if missing. */
export const caseImageUrl = (caseId: string) => `${basePath}/cases/${caseId}.webp`;

/**
 * Lid node inside the GLB (see tools/model/inspect-lid.mjs). The FBX poses it partly open (−30° about X)
 * and the quantizer re-centred its origin, so at runtime the lid is re-hung on a pivot at its back-bottom
 * edge and rotated back by the authored angle to close. Opening swings the pivot by LID_OPEN_DELTA.
 */
export const LID_NODE = 'Case_Top';
export const LID_OPEN_DELTA = -1.5;
/** Hue of the model's yellow paint in the albedo texture; tints rotate from here. */
export const SOURCE_HUE = 48;

/** Closed-case rest pose (radians). Shared by idle spin and pointer inspect. */
export const CASE_REST_Y = -0.5;
export const CASE_TILT_X = 0.12;

export type CaseInspect = {
  lastX: number;
  lastY: number;
  rotY: number;
  rotX: number;
  velY: number;
  velX: number;
  shake: number;
  dragging: boolean;
  touched: boolean;
  pointer: number;
  invalidate?: () => void;
};

export function createCaseInspect(): CaseInspect {
  return { lastX: 0, lastY: 0, rotY: CASE_REST_Y, rotX: CASE_TILT_X, velY: 0, velX: 0, shake: 0, dragging: false, touched: false, pointer: -1 };
}

export function resetCaseInspect(inspect: CaseInspect) {
  inspect.lastX = 0;
  inspect.lastY = 0;
  inspect.rotY = CASE_REST_Y;
  inspect.rotX = CASE_TILT_X;
  inspect.velY = 0;
  inspect.velX = 0;
  inspect.shake = 0;
  inspect.dragging = false;
  inspect.touched = false;
  inspect.pointer = -1;
}

export function inspectPointerDown(inspect: CaseInspect, clientX: number, clientY: number, pointerId: number) {
  inspect.dragging = true;
  inspect.touched = true;
  inspect.pointer = pointerId;
  inspect.lastX = clientX;
  inspect.lastY = clientY;
  inspect.velY = 0;
  inspect.velX = 0;
  inspect.shake = 1;
}

export function inspectPointerMove(inspect: CaseInspect, clientX: number, clientY: number, pointerId: number) {
  if (!inspect.dragging || pointerId !== inspect.pointer) return;
  const dx = clientX - inspect.lastX;
  const dy = clientY - inspect.lastY;
  inspect.lastX = clientX;
  inspect.lastY = clientY;
  inspect.rotY += dx * 0.008;
  inspect.rotX = Math.min(0.7, Math.max(-0.55, inspect.rotX + dy * 0.005));
  inspect.velY = dx * 0.14;
  inspect.velX = dy * 0.09;
}

export function inspectPointerUp(inspect: CaseInspect, pointerId: number) {
  if (pointerId !== inspect.pointer) return;
  inspect.dragging = false;
  inspect.pointer = -1;
}
