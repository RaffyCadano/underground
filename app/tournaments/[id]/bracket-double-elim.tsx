'use client';

import { useMemo } from 'react';
import { BracketHqTree, type HqBracketRound } from './bracket-hq-tree';
import type { BracketMatch } from './bracket-tree';

type RawMatch = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: string | null;
  score: string | null;
  status: string;
  player1Id: string | null;
  player2Id: string | null;
  player1: { id: string; username: string } | null;
  player2: { id: string; username: string } | null;
  winner: { id: string; username: string } | null;
};

function toBracketMatch(m: RawMatch): BracketMatch {
  return {
    id: m.id,
    round: m.round,
    matchIndex: m.matchIndex,
    player1: m.player1,
    player2: m.player2,
    player1Id: m.player1Id,
    player2Id: m.player2Id,
    winner: m.winner,
    score: m.score,
    status: m.status,
  };
}

function isVisibleMatch(m: RawMatch): boolean {
  return Boolean(
    m.player1 ||
      m.player2 ||
      m.winner ||
      m.status === 'complete' ||
      m.status === 'in_progress'
  );
}

function groupRounds(matches: RawMatch[], side: string): HqBracketRound[] {
  const sideMatches = matches.filter((m) => m.bracketSide === side);
  const byRound = new Map<number, RawMatch[]>();
  for (const m of sideMatches) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }

  const sortedRounds = [...byRound.keys()].sort((a, b) => a - b);
  const rounds: HqBracketRound[] = [];
  let displayNum = 1;

  for (const roundNum of sortedRounds) {
    const ms = (byRound.get(roundNum) ?? [])
      .sort((a, b) => a.matchIndex - b.matchIndex)
      .filter(isVisibleMatch);

    if (ms.length === 0) continue;

    rounds.push({
      round: roundNum,
      matches: ms.map((m) => ({
        ...toBracketMatch(m),
        displayNumber: displayNum++,
      })),
    });
  }
  return rounds;
}

const HQ_UNIT = 68; // MATCH_H (56) + GAP_R1 (12)

function computeSectionHeight(rounds: HqBracketRound[]): number {
  const r1Count = rounds[0]?.matches.length ?? 0;
  if (r1Count <= 0) return 120;
  return Math.max(r1Count * HQ_UNIT - 12, 120);
}

interface Props {
  matches: RawMatch[];
  isAdmin: boolean;
  userId: string | null;
  view?: 'full' | 'winners' | 'losers';
}

export function BracketDoubleElim({ matches, isAdmin, userId, view = 'full' }: Props) {
  const winnersRounds = useMemo(() => groupRounds(matches, 'winners'), [matches]);
  const losersRounds = useMemo(() => groupRounds(matches, 'losers'), [matches]);

  const grandFinal = useMemo(
    () => matches.find((m) => m.bracketSide === 'grand_final'),
    [matches]
  );
  const resetMatch = useMemo(
    () => matches.find((m) => m.bracketSide === 'reset'),
    [matches]
  );

  const winnersHeight = useMemo(() => computeSectionHeight(winnersRounds), [winnersRounds]);
  const losersHeight = useMemo(() => computeSectionHeight(losersRounds), [losersRounds]);

  const grandFinalVisible = grandFinal && isVisibleMatch(grandFinal);
  const resetVisible = resetMatch && isVisibleMatch(resetMatch);

  const showWinners = view === 'full' || view === 'winners';
  const showLosers = view === 'full' || view === 'losers';
  const gfOnWinners = view === 'full' || view === 'winners';

  const trailingMatches: BracketMatch[] = [];
  const trailingLabels: string[] = [];
  if (gfOnWinners && grandFinalVisible) {
    trailingMatches.push(toBracketMatch(grandFinal));
    trailingLabels.push('Grand Final');
  }
  if (gfOnWinners && resetVisible) {
    trailingMatches.push(toBracketMatch(resetMatch));
    trailingLabels.push('Reset');
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-[#0f1419] shadow-xl">
        <div className="min-w-max p-4 md:p-6">
          {showWinners && (
            <section className={showLosers ? 'mb-8' : ''}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 items-center rounded-md bg-gradient-to-r from-sky-600 to-sky-500 px-4 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Winners Bracket
                  </span>
                </div>
                <div className="h-px flex-1 bg-slate-700/60" />
              </div>
              <BracketHqTree
                rounds={winnersRounds}
                isAdmin={isAdmin}
                userId={userId}
                trailingMatches={trailingMatches.length > 0 ? trailingMatches : undefined}
                trailingLabels={trailingLabels}
                minHeight={winnersHeight}
              />
            </section>
          )}

          {showLosers && losersRounds.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 items-center rounded-md bg-gradient-to-r from-amber-600 to-orange-500 px-4 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Losers Bracket
                  </span>
                </div>
                <div className="h-px flex-1 bg-slate-700/60" />
              </div>
              <BracketHqTree
                rounds={losersRounds}
                isAdmin={isAdmin}
                userId={userId}
                minHeight={losersHeight}
              />
            </section>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Scroll horizontally to view the full bracket · Click a match to report or edit results
      </p>
    </div>
  );
}
