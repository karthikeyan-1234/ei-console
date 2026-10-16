/**
 * Slices a list to one page. Client-side only — the views already hold the
 * full list in a signal, so pagination is a projection, not a fetch.
 *
 * Page is 1-based. Out-of-range pages return an empty array rather than
 * clamping silently — callers are expected to keep the page in range.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return items;
  const start = (page - 1) * pageSize;
  if (start >= items.length) return [];
  return items.slice(start, start + pageSize);
}