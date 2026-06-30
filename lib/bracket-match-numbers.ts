type NumberedMatch = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: string | null;
  status: string;
};

/** Global display numbers (winners first, then losers, then grand finals). */
export function buildBracketMatchNumbers(matches: NumberedMatch[]): Map<string, number> {
  const order = (side: string) =>
    matches
      .filter((m) => m.bracketSide === side && m.status !== 'bye')
      .sort((a, b) => a.round - b.round || a.matchIndex - b.matchIndex);

  const numbered = [...order('winners'), ...order('losers')];
  const grandFinal = matches.find((m) => m.bracketSide === 'grand_final' && m.status !== 'bye');
  const reset = matches.find((m) => m.bracketSide === 'reset' && m.status !== 'bye');
  if (grandFinal) numbered.push(grandFinal);
  if (reset) numbered.push(reset);

  const map = new Map<string, number>();
  numbered.forEach((m, i) => map.set(m.id, i + 1));
  return map;
}
