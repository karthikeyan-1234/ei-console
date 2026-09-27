/** "A, B +3 more" — mirrors refList(). */
export function refList(items: string[]): string {
  if (items.length <= 2) return items.join(', ');
  return `${items.slice(0, 2).join(', ')} +${items.length - 2} more`;
}