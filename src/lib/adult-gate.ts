/** Playful client-side lock for the 18+ case — not authentication. */
const PASSWORD = 'ahihidocho';

/** Constant-time compare so casual timing does not leak the password. */
export function checkAdultPassword(input: string): boolean {
  const given = input.normalize('NFC');
  const expected = PASSWORD;
  const n = Math.max(given.length, expected.length);
  let diff = given.length === expected.length ? 0 : 1;
  for (let i = 0; i < n; i++) diff |= (given.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  return diff === 0;
}
