/** JSON.parse with a fallback. Never throws. */
export function safeJsonParse<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Resolves a dotted path against an object, treating a leading "$." or "$"
 * as a no-op prefix. Mirrors the HTML console's resolvePath().
 *   resolvePath({ a: { b: 1 } }, 'a.b')  // → 1
 *   resolvePath({ a: { b: 1 } }, '$.a.b') // → 1
 */
export function resolvePath(obj: unknown, path: string | null | undefined): unknown {
  if (!path || obj == null) return undefined;
  const parts = String(path)
    .replace(/^\$\.?/, '')
    .split('.')
    .filter(Boolean);
  let cursor: unknown = obj;
  for (const key of parts) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
}