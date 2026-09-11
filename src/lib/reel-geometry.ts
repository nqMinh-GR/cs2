// Reel world coordinates. Cards live at absolute slot positions (slot * REEL_STEP) and the track only
// ever translates; nothing here may change without updating --reel-* tokens in src/app/theme.css.
export const REEL_STEP = 254;
export const REEL_TILE = 240;
export const REEL_TILE_H = 180;
export const REEL_ORIGIN = -400;
/** Cards mounted at once: a viewport-sized strip plus overscan on both sides. */
export const REEL_WINDOW = 12;
export const REEL_OVERSCAN = 4;
