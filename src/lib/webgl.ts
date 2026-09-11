let cached: boolean | undefined;

/** three ≥ r163 renders with WebGL2 only. */
export function supportsWebGL2() {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = !!canvas.getContext('webgl2');
  } catch {
    cached = false;
  }
  return cached;
}

type NavigatorHints = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

export function deviceHints() {
  const nav = navigator as NavigatorHints;
  return { saveData: !!nav.connection?.saveData, memory: nav.deviceMemory ?? 8 };
}
