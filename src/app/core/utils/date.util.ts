function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** "HH:mm:ss" for the current moment — mirrors nowStamp() in the HTML console. */
export function nowStamp(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** "19 Sep 2026 20:15" — mirrors nowLong(). */
export function nowLong(): string {
  const d = new Date();
  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}

/** "HH:mm:ss" from a total-seconds value. Used by the elapsed timer. */
export function fmtHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** "142 ms" or "1.42 s" — mirrors fmtMs(). */
export function fmtMs(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Formats an ISO 8601 timestamp for display in the operator's local
 * timezone. Compact — drops the date when the value is from today, drops
 * the year when it's from this year.
 *
 *   Same day   → "11:29:21"
 *   Same year  → "16 Oct 11:29:21"
 *   Older      → "16 Oct 2025 11:29:21"
 *
 * Returns the input unchanged if it isn't a parseable date, so the
 * console never crashes on malformed data.
 */
export function formatLocalStamp(iso: string | null | undefined): string {
  if (!iso) return '—';

  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const sameYear = d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  if (sameDay) return time;

  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  });

  return `${date} ${time}`;
}