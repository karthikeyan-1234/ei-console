/**
 * Lowercase, hyphenate, trim leading/trailing hyphens. Mirrors slugify() in
 * the original HTML console.
 */
export function slugify(input: string | null | undefined): string {
  return String(input ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Short random id generator — replaces the HTML `uid(prefix)` helper. */
export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Truncates an id for display. e.g. "9e1bc82f3a41" → "9e1bc82f…" */
export function shortId(id: string | null | undefined, keep = 8): string {
  const s = String(id ?? '');
  return s.length > keep ? `${s.substring(0, keep)}…` : s;
}

/** Escapes HTML special characters for safe interpolation into innerHTML. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
  );
}