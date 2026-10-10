export interface DatedItem {
  lastMessageAt: string;
}

export interface DateGroup<T> {
  /** Stable key for `@for` tracking. 'today' | 'yesterday' | 'last7' | 'last30' | 'YYYY-MM'. */
  key: string;
  /** Human-readable label. 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days' | '2026-Aug'. */
  label: string;
  items: T[];
}

/**
 * Buckets a list of dated items into the six bucket types the history panel
 * renders. Items are assumed to be sorted newest-first already; this function
 * preserves that order within each bucket.
 *
 * Boundary logic:
 *   Today         — lastMessageAt >= start of today (local time)
 *   Yesterday     — lastMessageAt >= start of yesterday
 *   Last 7 days   — lastMessageAt >= 7 days ago (start of day)
 *   Last 30 days  — lastMessageAt >= 30 days ago (start of day)
 *   Monthly       — anything older, bucketed by calendar month, newest first
 *
 * Empty buckets are omitted entirely.
 */
export function groupByDate<T extends DatedItem>(items: T[]): DateGroup<T>[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startOfYesterday = addDays(startOfToday, -1);
  const sevenDaysAgo = addDays(startOfToday, -7);
  const thirtyDaysAgo = addDays(startOfToday, -30);

  const today: T[] = [];
  const yesterday: T[] = [];
  const last7: T[] = [];
  const last30: T[] = [];
  const monthBuckets = new Map<string, T[]>();

  for (const item of items) {
    const d = new Date(item.lastMessageAt);
    if (d >= startOfToday) {
      today.push(item);
    } else if (d >= startOfYesterday) {
      yesterday.push(item);
    } else if (d >= sevenDaysAgo) {
      last7.push(item);
    } else if (d >= thirtyDaysAgo) {
      last30.push(item);
    } else {
      const key = monthKey(d);
      if (!monthBuckets.has(key)) monthBuckets.set(key, []);
      monthBuckets.get(key)!.push(item);
    }
  }

  const result: DateGroup<T>[] = [];
  if (today.length)     result.push({ key: 'today',     label: 'Today',        items: today });
  if (yesterday.length) result.push({ key: 'yesterday', label: 'Yesterday',    items: yesterday });
  if (last7.length)     result.push({ key: 'last7',     label: 'Last 7 days',  items: last7 });
  if (last30.length)    result.push({ key: 'last30',    label: 'Last 30 days', items: last30 });

  // Month keys are 'YYYY-MM', so a descending string sort puts the newest
  // month first. The label is derived separately.
  const sortedMonths = Array.from(monthBuckets.entries())
    .sort((a, b) => b[0].localeCompare(a[0]));

  for (const [key, monthItems] of sortedMonths) {
    result.push({
      key,
      label: monthLabel(key),
      items: monthItems,
    });
  }

  return result;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const name = d.toLocaleDateString('en-US', { month: 'short' });
  return `${year}-${name}`;
}

/**
 * Relative time for the item's meta line.
 *   <1 min       → "just now"
 *   <1 hour      → "42m ago"
 *   <24 hours    → "3h ago"
 *   <7 days      → "4d ago"
 *   older        → "15 Aug" (day + 3-letter month)
 */
export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now - then);
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr  = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}