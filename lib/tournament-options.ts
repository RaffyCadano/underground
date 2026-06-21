export type GrandFinalsModifier = 'default' | 'single_match' | 'skip';

export const GRAND_FINALS_OPTIONS: { value: GrandFinalsModifier; label: string; description: string }[] = [
  {
    value: 'default',
    label: 'Default (bracket reset)',
    description: 'Losers bracket champion must win twice in grand finals if they win the first set.',
  },
  {
    value: 'single_match',
    label: 'Single grand final',
    description: 'One grand final match decides the champion — winners finalist can lose once.',
  },
  {
    value: 'skip',
    label: 'Skip grand final',
    description: 'Winners bracket champion is crowned when the losers bracket finishes — no grand final match.',
  },
];

export function parseGrandFinalsModifier(value: string | null | undefined): GrandFinalsModifier {
  if (value === 'single_match' || value === 'skip') return value;
  return 'default';
}

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}
