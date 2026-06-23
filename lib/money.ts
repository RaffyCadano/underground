export function formatUsdDisplay(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('$')) return trimmed;
  return `$${trimmed}`;
}
