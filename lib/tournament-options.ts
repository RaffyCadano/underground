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

export type GameType = 'beyblade_x' | 'beyblade_x_3on3' | 'beyblade_burst' | 'custom';

export const GAME_TYPE_OPTIONS: {
  value: GameType;
  label: string;
  description: string;
}[] = [
  {
    value: 'beyblade_x',
    label: 'Beyblade X',
    description: 'Standard 1v1 Beyblade X — Xtreme battle format.',
  },
  {
    value: 'beyblade_x_3on3',
    label: 'Beyblade X 3v3',
    description: 'Each blader uses 3 Beyblades — deck-style 3v3 format.',
  },
  {
    value: 'beyblade_burst',
    label: 'Beyblade Burst',
    description: 'Classic Burst format and ruleset.',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'House rules — describe specifics in the event description.',
  },
];

export const GAME_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  GAME_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export function parseGameType(value: string | null | undefined): GameType {
  if (value === 'beyblade_x_3on3' || value === 'beyblade_burst' || value === 'custom') return value;
  return 'beyblade_x';
}
