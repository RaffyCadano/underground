/** Bracket HQ–style round column titles for double elimination. */

export function bracketDisplaySize(participantCount: number): number {
  const n = Math.max(2, participantCount);
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/** Empty left padding tiers for bracket-{size}-half layouts (e.g. 11 → 16 → 2 ghost tiers). */
export function bhqGhostTierCount(bracketSize: number): number {
  return Math.max(0, Math.round(Math.log2(Math.max(4, bracketSize))) - 2);
}

/** Tree height for a power-of-two bracket (half-bracket row count = size / 2). */
export function bracketTreeHeight(
  bracketSize: number,
  unit: number,
  gap: number,
): number {
  const rows = Math.max(1, bracketSize / 2);
  return rows * unit - gap;
}

export function winnersRoundTitle(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Finals';
  if (fromEnd === 1) return 'Semi-Finals';
  if (fromEnd === 2) return 'Quarter-Finals';
  return `Round ${round}`;
}

export function winnersRoundTitleFull(round: number, totalRounds: number): string {
  const short = winnersRoundTitle(round, totalRounds);
  if (short === 'Finals') return 'Winners Finals';
  if (short === 'Semi-Finals') return 'Winners Semi-Finals';
  if (short === 'Quarter-Finals') return 'Winners Quarter-Finals';
  return `Winners ${short}`;
}

export function losersRoundTitle(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Losers Finals';
  return `Losers Round ${round}`;
}

export type BhqRoundTitleParts = { prefix: string; label: string };

export function winnersBhqRoundTitle(round: number, totalRounds: number): BhqRoundTitleParts {
  return { prefix: 'Winners', label: winnersRoundTitle(round, totalRounds) };
}

export function losersBhqRoundTitle(round: number, totalRounds: number): BhqRoundTitleParts {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return { prefix: 'Losers', label: 'Finals' };
  return { prefix: 'Losers', label: `Round ${round}` };
}
