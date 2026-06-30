export type BracketMatchLink = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: string | null;
  status?: string;
  player1: { username: string } | null;
  player2: { username: string } | null;
  winnerNextId?: string | null;
  winnerNextSlot?: number | null;
  loserNextId?: string | null;
  loserNextSlot?: number | null;
};

export type LosersSlotHints = {
  slot1?: string;
  slot2?: string;
};

function wbMatchNumber(matches: BracketMatchLink[], matchId: string): number | null {
  const wb = matches
    .filter((m) => m.bracketSide === 'winners')
    .sort((a, b) => a.round - b.round || a.matchIndex - b.matchIndex);
  const idx = wb.findIndex((m) => m.id === matchId);
  return idx >= 0 ? idx + 1 : null;
}

function lbMatchLabel(m: BracketMatchLink, matchNumbers?: Map<string, number>): string {
  const num = matchNumbers?.get(m.id);
  if (num) return String(num);
  return `LB R${m.round} M${m.matchIndex + 1}`;
}

function feederLabel(
  source: BracketMatchLink,
  allMatches: BracketMatchLink[],
  kind: 'loser' | 'winner',
  matchNumbers?: Map<string, number>,
): string {
  const globalNum = matchNumbers?.get(source.id);

  if (source.bracketSide === 'winners') {
    const p1 = source.player1?.username;
    const p2 = source.player2?.username;
    if (p1 && p2) {
      return kind === 'loser' ? `Loser of ${p1} vs ${p2}` : `Winner of ${p1} vs ${p2}`;
    }
    if (globalNum) {
      return kind === 'loser' ? `Loser of ${globalNum}` : `Winner of ${globalNum}`;
    }
    const num = wbMatchNumber(allMatches, source.id);
    if (num) {
      return kind === 'loser' ? `Loser of ${num}` : `Winner of ${num}`;
    }
    return kind === 'loser' ? `Loser of WB R${source.round}` : `Winner of WB R${source.round}`;
  }

  if (source.bracketSide === 'losers') {
    if (globalNum != null) return `Winner of ${globalNum}`;
    const lb = allMatches
      .filter((m) => m.bracketSide === 'losers' && (m.status ?? 'pending') !== 'bye')
      .sort((a, b) => a.round - b.round || a.matchIndex - b.matchIndex);
    const wbCount = allMatches.filter(
      (m) => m.bracketSide === 'winners' && (m.status ?? 'pending') !== 'bye',
    ).length;
    const lbIdx = lb.findIndex((m) => m.id === source.id);
    if (lbIdx >= 0) return `Winner of ${wbCount + lbIdx + 1}`;
    return 'TBD';
  }

  return 'TBD';
}

/** Map match id → slot hints for empty feeder slots (winners, losers, grand final). */
export function buildBracketSlotHints(
  allMatches: BracketMatchLink[],
  matchNumbers?: Map<string, number>,
): Map<string, LosersSlotHints> {
  const hints = new Map<string, LosersSlotHints>();

  function ensure(id: string): LosersSlotHints {
    const existing = hints.get(id);
    if (existing) return existing;
    const created: LosersSlotHints = {};
    hints.set(id, created);
    return created;
  }

  for (const m of allMatches) {
    if (m.loserNextId && m.loserNextSlot) {
      const h = ensure(m.loserNextId);
      const label = feederLabel(m, allMatches, 'loser', matchNumbers);
      if (m.loserNextSlot === 1) h.slot1 = label;
      else h.slot2 = label;
    }
    if (m.winnerNextId && m.winnerNextSlot) {
      const target = allMatches.find((x) => x.id === m.winnerNextId);
      if (!target || target.bracketSide === 'reset') continue;
      const h = ensure(m.winnerNextId);
      const label = feederLabel(m, allMatches, 'winner', matchNumbers);
      if (m.winnerNextSlot === 1) h.slot1 = label;
      else h.slot2 = label;
    }
  }

  return hints;
}

/** @deprecated Use buildBracketSlotHints */
export function buildLosersSlotHints(allMatches: BracketMatchLink[]): Map<string, LosersSlotHints> {
  return buildBracketSlotHints(allMatches);
}
