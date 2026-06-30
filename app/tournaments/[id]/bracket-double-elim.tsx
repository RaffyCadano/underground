'use client';

import { useMemo } from 'react';
import { DraggablePan } from '@/app/components/draggable-pan';
import { buildBracketMatchNumbers } from '@/lib/bracket-match-numbers';
import { bracketDisplaySize, bracketTreeHeight } from '@/lib/bracket-round-labels';
import { buildBracketSlotHints } from '@/lib/losers-bracket-labels';
import {
  BracketHqTree,
  HQ_GAP_R1,
  HQ_UNIT,
  type HqBracketRound,
} from './bracket-hq-tree';
import type { BracketMatch } from './bracket-tree';
import './bracket-hq.css';

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
  winnerNextId?: string | null;
  winnerNextSlot?: number | null;
  loserNextId?: string | null;
  loserNextSlot?: number | null;
};

type ParticipantSeed = {
  userId: string;
  seed: number | null;
};

function toBracketMatch(m: RawMatch, hints?: { slot1?: string; slot2?: string }): BracketMatch {
  return {
    id: m.id,
    round: m.round,
    matchIndex: m.matchIndex,
    bracketSide: m.bracketSide ?? undefined,
    player1: m.player1,
    player2: m.player2,
    player1Id: m.player1Id,
    player2Id: m.player2Id,
    player1Hint: m.player1 ? undefined : hints?.slot1,
    player2Hint: m.player2 ? undefined : hints?.slot2,
    winner: m.winner,
    score: m.score,
    status: m.status,
  };
}

/** Show every generated match except byes (full Bracket HQ tree). */
function isBracketDisplayMatch(m: RawMatch): boolean {
  return m.status !== 'bye';
}

function groupRounds(
  matches: RawMatch[],
  side: string,
  slotHints?: Map<string, { slot1?: string; slot2?: string }>,
): HqBracketRound[] {
  const sideMatches = matches.filter((m) => m.bracketSide === side);
  const byRound = new Map<number, RawMatch[]>();
  for (const m of sideMatches) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }

  const sortedRounds = [...byRound.keys()].sort((a, b) => a - b);
  const rounds: HqBracketRound[] = [];

  for (const roundNum of sortedRounds) {
    const ms = (byRound.get(roundNum) ?? [])
      .sort((a, b) => a.matchIndex - b.matchIndex)
      .filter(isBracketDisplayMatch);

    if (ms.length === 0) continue;

    rounds.push({
      round: roundNum,
      matches: ms.map((m) => toBracketMatch(m, slotHints?.get(m.id))),
    });
  }
  return rounds;
}

interface Props {
  matches: RawMatch[];
  participants?: ParticipantSeed[];
  isAdmin: boolean;
  userId: string | null;
  view?: 'full' | 'winners' | 'losers';
}

export function BracketDoubleElim({
  matches,
  participants = [],
  isAdmin,
  userId,
  view = 'full',
}: Props) {
  const matchNumbers = useMemo(() => buildBracketMatchNumbers(matches), [matches]);
  const slotHints = useMemo(
    () => buildBracketSlotHints(matches, matchNumbers),
    [matches, matchNumbers],
  );
  const seedByPlayerId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of participants) {
      if (p.seed != null) map.set(p.userId, p.seed);
    }
    return map;
  }, [participants]);

  const participantCount = useMemo(() => {
    if (participants.length > 0) return participants.length;
    const ids = new Set<string>();
    for (const m of matches) {
      if (m.player1Id) ids.add(m.player1Id);
      if (m.player2Id) ids.add(m.player2Id);
    }
    return ids.size;
  }, [participants, matches]);

  const bracketSize = useMemo(
    () => bracketDisplaySize(participantCount),
    [participantCount],
  );

  const winnersRounds = useMemo(
    () => groupRounds(matches, 'winners', slotHints),
    [matches, slotHints],
  );
  const losersRounds = useMemo(
    () => groupRounds(matches, 'losers', slotHints),
    [matches, slotHints],
  );

  const grandFinal = useMemo(
    () => matches.find((m) => m.bracketSide === 'grand_final'),
    [matches],
  );
  const resetMatch = useMemo(
    () => matches.find((m) => m.bracketSide === 'reset'),
    [matches],
  );

  const bracketHeight = useMemo(
    () => bracketTreeHeight(bracketSize, HQ_UNIT, HQ_GAP_R1),
    [bracketSize],
  );

  const showWinners = view === 'full' || view === 'winners';
  const showLosers = view === 'full' || view === 'losers';
  const isFullView = view === 'full';

  const sharedTreeProps = {
    isAdmin,
    userId,
    seedByPlayerId,
    matchNumbers,
    showMatchNumbers: true,
    bhqTitles: true,
    roundTitlesPosition: 'bottom' as const,
    bracketSize,
  };
  const losersTreeProps = {
    ...sharedTreeProps,
    bracketKind: 'losers' as const,
    winnersRounds,
    matchLinks: matches,
  };
  const winnersTreeProps = {
    ...sharedTreeProps,
    bracketKind: 'winners' as const,
  };

  const grandFinalMatches: BracketMatch[] = [];
  if (grandFinal && isBracketDisplayMatch(grandFinal)) {
    grandFinalMatches.push(toBracketMatch(grandFinal, slotHints.get(grandFinal.id)));
  }
  if (resetMatch && isBracketDisplayMatch(resetMatch)) {
    grandFinalMatches.push(toBracketMatch(resetMatch, slotHints.get(resetMatch.id)));
  }

  const grandFinalTrailingLabels =
    resetMatch && isBracketDisplayMatch(resetMatch)
      ? ['Grand Finals', 'Reset (if necessary)']
      : ['Grand Finals'];

  const winnersTrailing =
    grandFinalMatches.length > 0 ? grandFinalMatches : undefined;

  return (
    <div className="space-y-3">
      <div className="bracket-shell overflow-hidden rounded-lg border">
        <DraggablePan className="relative max-h-[min(85vh,1000px)]">
          <div
            className={`min-w-max px-4 py-6 md:px-8 md:py-8 bracket-preview count-${participantCount} bracket-${bracketSize} bracket-${bracketSize}-half type-d`}
          >
            {isFullView ? (
              <div className="flex flex-col gap-10">
                {showWinners && winnersRounds.length > 0 && (
                  <section className="bracket-section bracket-section--winners winners">
                    <p className="bracket-section-label bracket-section-label--winners">
                      Winners Bracket
                    </p>
                    <BracketHqTree
                      rounds={winnersRounds}
                      minHeight={bracketHeight}
                      layout="tree"
                      direction="ltr"
                      trailingMatches={winnersTrailing}
                      trailingLabels={grandFinalTrailingLabels}
                      {...winnersTreeProps}
                    />
                  </section>
                )}

                {showLosers && losersRounds.length > 0 && (
                  <section className="bracket-section bracket-section--losers losers">
                    <p className="bracket-section-label bracket-section-label--losers">
                      Losers Bracket
                    </p>
                    <BracketHqTree
                      rounds={losersRounds}
                      minHeight={bracketHeight}
                      layout="tree"
                      direction="ltr"
                      {...losersTreeProps}
                    />
                  </section>
                )}
              </div>
            ) : (
              <>
                {showWinners && (
                  <section
                    className={`bracket-section bracket-section--winners winners ${showLosers && losersRounds.length > 0 ? 'mb-10' : ''}`}
                  >
                    <p className="bracket-section-label bracket-section-label--winners">
                      Winners Bracket
                    </p>
                    <BracketHqTree
                      rounds={winnersRounds}
                      minHeight={bracketHeight}
                      layout="tree"
                      trailingMatches={winnersTrailing}
                      trailingLabels={grandFinalTrailingLabels}
                      {...winnersTreeProps}
                    />
                  </section>
                )}

                {showLosers && losersRounds.length > 0 && (
                  <section className="bracket-section bracket-section--losers losers">
                    <p className="bracket-section-label bracket-section-label--losers">
                      Losers Bracket
                    </p>
                    <BracketHqTree
                      rounds={losersRounds}
                      minHeight={bracketHeight}
                      layout="tree"
                      direction="ltr"
                      {...losersTreeProps}
                    />
                  </section>
                )}
              </>
            )}
          </div>
        </DraggablePan>
      </div>

      <p className="bracket-footer-hint">
        Drag to pan · Scroll to zoom · Click a match to report or edit results
      </p>
    </div>
  );
}
