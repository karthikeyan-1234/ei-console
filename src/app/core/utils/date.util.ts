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