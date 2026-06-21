/** Format 24h `HH:mm` (from `<input type="time">`) as `11:00 AM`. */
export function formatEventTime(time: string | null | undefined): string | null {
  if (!time?.trim()) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time.trim();

  const hours24 = Number(match[1]);
  const minutes = match[2];
  if (Number.isNaN(hours24) || hours24 < 0 || hours24 > 23) return time.trim();

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

export function formatScheduleLine(
  label: string,
  time: string | null | undefined,
): string | null {
  const formatted = formatEventTime(time);
  if (!formatted) return null;
  return `${label}: ${formatted}`;
}
