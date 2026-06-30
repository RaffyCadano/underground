import { prisma } from '@/lib/prisma';
import {
  createAdvancementMatch,
  findAdvancementMatch,
  findAdvancementMatches,
  findWinnersRoundOneByes,
  updateAdvancementMatch,
  updateAdvancementMatchSlot,
} from '@/lib/match-advancement';
import { parseGrandFinalsModifier, type GrandFinalsModifier } from '@/lib/tournament-options';
import {
  deleteBracketMatchesExceptGroup,
  findTournamentDeSettings,
  findTournamentGrandFinalsModifier,
  updateTournamentPhase,
} from '@/lib/tournament-de-settings';
import { generateSeedPairs, nextPowerOf2 } from '@/lib/bracket-seeding';

export type BracketSide = 'winners' | 'losers' | 'grand_final' | 'reset';

type DeMatch = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: BracketSide;
  player1Id: string | null;
  player2Id: string | null;
  winnerNextId: string | null;
  winnerNextSlot: number | null;
  loserNextId: string | null;
  loserNextSlot: number | null;
};

function createWinnersBracket(bracketSize: number, rounds: number, idFactory: () => string): DeMatch[] {
  const matches: DeMatch[] = [];
  const idMap = new Map<string, string>();

  for (let round = 1; round <= rounds; round++) {
    const matchCount = bracketSize / Math.pow(2, round);
    for (let pos = 0; pos < matchCount; pos++) {
      const id = idFactory();
      idMap.set(`${round}-${pos}`, id);
      matches.push({
        id,
        round,
        matchIndex: pos,
        bracketSide: 'winners',
        player1Id: null,
        player2Id: null,
        winnerNextId: null,
        winnerNextSlot: null,
        loserNextId: null,
        loserNextSlot: null,
      });
    }
  }

  for (const match of matches) {
    if (match.round < rounds) {
      const nextPos = Math.floor(match.matchIndex / 2);
      const nextSlot = (match.matchIndex % 2) + 1;
      match.winnerNextId = idMap.get(`${match.round + 1}-${nextPos}`) ?? null;
      match.winnerNextSlot = nextSlot;
    }
  }

  return matches;
}

function countLbR1PairMatches(winnersMatches: DeMatch[], bracketSize: number): number {
  let count = 0;
  for (let i = 0; i < bracketSize / 2; i += 2) {
    const m0 = winnersMatches.find((m) => m.round === 1 && m.matchIndex === i);
    const m1 = winnersMatches.find((m) => m.round === 1 && m.matchIndex === i + 1);
    if (!m0 || !m1) continue;
    if (m0.player1Id && m0.player2Id && m1.player1Id && m1.player2Id) count++;
  }
  return count;
}

function countSoloWBR1Drops(winnersMatches: DeMatch[], bracketSize: number): number {
  let count = 0;
  for (let i = 0; i < bracketSize / 2; i += 2) {
    const m0 = winnersMatches.find((m) => m.round === 1 && m.matchIndex === i);
    const m1 = winnersMatches.find((m) => m.round === 1 && m.matchIndex === i + 1);
    if (!m0 || !m1) continue;
    const dual0 = !!(m0.player1Id && m0.player2Id);
    const dual1 = !!(m1.player1Id && m1.player2Id);
    if (dual0 && dual1) continue;
    if (dual0) count++;
    if (dual1) count++;
  }
  return count;
}

function countLbR1OpenerMatches(winnersMatches: DeMatch[], bracketSize: number): number {
  const lbR1PairMatches = countLbR1PairMatches(winnersMatches, bracketSize);
  if (lbR1PairMatches > 0) return lbR1PairMatches;

  const dualR1 = winnersMatches.filter(
    (m) => m.round === 1 && m.player1Id && m.player2Id,
  );
  if (dualR1.length > 0) {
    let maxPos = 0;
    for (const m of dualR1) {
      maxPos = Math.max(maxPos, Math.floor(m.matchIndex / 2));
    }
    return maxPos + 1;
  }

  const soloDrops = countSoloWBR1Drops(winnersMatches, bracketSize);
  return Math.max(1, Math.ceil(soloDrops / 2));
}

function computeLosersRoundCounts(
  winnersRounds: number,
  winnersMatches: DeMatch[],
  bracketSize: number,
): number[] {
  const lbR1PairMatches = countLbR1PairMatches(winnersMatches, bracketSize);
  const soloDrops = countSoloWBR1Drops(winnersMatches, bracketSize);
  const dualLosers = countDualWinnersRoundOne(winnersMatches);
  const openerMatches = countLbR1OpenerMatches(winnersMatches, bracketSize);
  const counts: number[] = [openerMatches];

  for (let lbRound = 2; lbRound <= (winnersRounds - 1) * 2; lbRound++) {
    const prev = counts[counts.length - 1] ?? 0;
    if (lbRound % 2 === 0) {
      const wbRound = lbRound / 2 + 1;
      const wbMatchCount = Math.pow(2, winnersRounds - wbRound);
      let next: number;
      if (lbRound === 2) {
        const byeSideMatches = wbMatchCount / 2;
        if (soloDrops === 0 && openerMatches * 2 === dualLosers) {
          next = wbMatchCount;
        } else {
          const evenDualTrim = dualLosers % 2 === 0 ? 1 : 0;
          const oddSoloTrim = soloDrops % 2 === 1 ? 1 : 0;
          next = openerMatches + byeSideMatches - evenDualTrim - oddSoloTrim;
          next = Math.max(next, wbMatchCount / 2);
        }
      } else if (openerMatches >= wbMatchCount) {
        next = wbMatchCount;
      } else {
        next = wbMatchCount / 2;
      }
      counts.push(Math.max(prev, next, 1));
    } else {
      counts.push(Math.max(1, Math.ceil(prev / 2)));
    }
  }
  return counts;
}

function countDualWinnersRoundOne(winnersMatches: DeMatch[]) {
  return winnersMatches.filter((m) => m.round === 1 && m.player1Id && m.player2Id).length;
}

function wireLosersBracketWinners(matches: DeMatch[], idMap: Map<string, string>, totalRounds: number) {
  const countInRound = (round: number) => matches.filter((m) => m.round === round).length;

  for (const match of matches) {
    if (match.round >= totalRounds) continue;

    const currentCount = countInRound(match.round);
    const nextCount = countInRound(match.round + 1);
    const mergesNextRound = nextCount < currentCount;

    let nextPos: number;
    let nextSlot: number;

    if (mergesNextRound) {
      // Consolidation round — pair survivors (e.g. LB R2 → R3)
      nextPos = Math.floor(match.matchIndex / 2);
      nextSlot = (match.matchIndex % 2) + 1;
    } else {
      // Drop-in round — survivor waits for incoming bracket loser in the next slot
      nextPos = match.matchIndex;
      nextSlot = 1;
    }

    const nextId = idMap.get(`${match.round + 1}-${nextPos}`);
    if (nextId) {
      match.winnerNextId = nextId;
      match.winnerNextSlot = nextSlot;
    }
  }
}

function createLosersBracket(
  losersRoundCounts: number[],
  idFactory: () => string,
): DeMatch[] {
  const matches: DeMatch[] = [];
  const idMap = new Map<string, string>();
  const totalRounds = losersRoundCounts.length;

  for (let round = 1; round <= totalRounds; round++) {
    const matchCount = losersRoundCounts[round - 1] ?? 0;
    for (let pos = 0; pos < matchCount; pos++) {
      const id = idFactory();
      idMap.set(`${round}-${pos}`, id);
      matches.push({
        id,
        round,
        matchIndex: pos,
        bracketSide: 'losers',
        player1Id: null,
        player2Id: null,
        winnerNextId: null,
        winnerNextSlot: null,
        loserNextId: null,
        loserNextSlot: null,
      });
    }
  }

  wireLosersBracketWinners(matches, idMap, totalRounds);
  return matches;
}

function wireLoserRouting(
  winnersMatches: DeMatch[],
  losersMatches: DeMatch[],
  winnersRounds: number,
  startFromWbRound: number,
  losersRoundCounts: number[],
) {
  const losersIdMap = new Map<string, string>();
  for (const m of losersMatches) {
    losersIdMap.set(`${m.round}-${m.matchIndex}`, m.id);
  }

  for (const match of winnersMatches) {
    if (match.round === 1) continue;

    const routing = getLoserDestination(
      match.round,
      match.matchIndex,
      winnersRounds,
      startFromWbRound,
      losersRoundCounts,
    );
    if (routing) {
      const targetId = losersIdMap.get(`${routing.lbRound}-${routing.lbPosition}`);
      if (targetId) {
        match.loserNextId = targetId;
        match.loserNextSlot = routing.slot;
      }
    }
  }
}

/** Pair WB R1 losers by bracket slot (matches 0+1, 2+3, …), not dual-game order. */
function wireWBR1LosersToLBR1(
  winnersMatches: DeMatch[],
  losersMatches: DeMatch[],
  bracketSize: number,
) {
  const lbR1PairMatches = countLbR1PairMatches(winnersMatches, bracketSize);

  const lbR1 = losersMatches
    .filter((m) => m.round === 1)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  if (lbR1PairMatches === 0) {
    const lbR1ByPos = new Map(lbR1.map((m) => [m.matchIndex, m]));
    for (const wb of winnersMatches) {
      if (wb.round !== 1 || !wb.player1Id || !wb.player2Id) continue;
      const lbPosition = Math.floor(wb.matchIndex / 2);
      const slot = (wb.matchIndex % 2) + 1;
      const target = lbR1ByPos.get(lbPosition) ?? lbR1[lbPosition];
      if (target) {
        wb.loserNextId = target.id;
        wb.loserNextSlot = slot;
      }
    }
    return;
  }

  const soloTargetRound = 2;
  const soloTargets = losersMatches
    .filter((m) => m.round === soloTargetRound)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  let lbR1Idx = 0;
  let soloIdx = 0;
  const soloPending: DeMatch[] = [];

  function pairSoloDrop(wb: DeMatch) {
    soloPending.push(wb);
    if (soloPending.length >= 2) {
      const a = soloPending.shift()!;
      const b = soloPending.shift()!;
      const target = soloTargets[soloIdx++];
      if (target) {
        a.loserNextId = target.id;
        a.loserNextSlot = 1;
        b.loserNextId = target.id;
        b.loserNextSlot = 2;
      }
    }
  }

  for (let i = 0; i < bracketSize / 2; i += 2) {
    const m0 = winnersMatches.find((m) => m.round === 1 && m.matchIndex === i);
    const m1 = winnersMatches.find((m) => m.round === 1 && m.matchIndex === i + 1);
    if (!m0 || !m1) continue;

    const dual0 = !!(m0.player1Id && m0.player2Id);
    const dual1 = !!(m1.player1Id && m1.player2Id);

    if (dual0 && dual1) {
      const target = lbR1[lbR1Idx++];
      if (target) {
        m0.loserNextId = target.id;
        m0.loserNextSlot = 1;
        m1.loserNextId = target.id;
        m1.loserNextSlot = 2;
      }
    } else if (dual0) {
      pairSoloDrop(m0);
    } else if (dual1) {
      pairSoloDrop(m1);
    }
  }

  for (const wb of soloPending) {
    if (lbR1PairMatches > 0) {
      const target = soloTargets[soloIdx++];
      if (target) {
        wb.loserNextId = target.id;
        wb.loserNextSlot = 1;
      }
    } else {
      const lbR2 = losersMatches
        .filter((m) => m.round === 2)
        .sort((a, b) => a.matchIndex - b.matchIndex);
      const target = lbR2[soloIdx++];
      if (target) {
        wb.loserNextId = target.id;
        wb.loserNextSlot = 1;
      }
    }
  }
}

function mapWinnersLoserToDropInRound(
  wbRound: number,
  wbPosition: number,
  totalWbRounds: number,
  lbRound: number,
  losersRoundCounts: number[],
): { lbRound: number; lbPosition: number; slot: number } | null {
  const wbMatchCount = Math.pow(2, totalWbRounds - wbRound);
  const lbMatchCount = losersRoundCounts[lbRound - 1] ?? 0;
  if (lbMatchCount === 0) return null;

  let lbPosition: number;
  if (lbRound === 2) {
    lbPosition = wbMatchCount - 1 - wbPosition;
  } else {
    lbPosition = wbPosition;
  }

  if (lbPosition < lbMatchCount) {
    return { lbRound, lbPosition, slot: 2 };
  }

  // Winners path had no LB feeder (common with R1 byes) — skip to next LB round
  const nextLbRound = lbRound + 1;
  if (nextLbRound > losersRoundCounts.length) return null;
  const nextCount = losersRoundCounts[nextLbRound - 1] ?? 0;
  if (nextCount === 0) return null;

  return {
    lbRound: nextLbRound,
    lbPosition: Math.min(wbPosition, nextCount - 1),
    slot: 2,
  };
}

function countSoloMergeSlots(losersRoundCounts: number[], lbRound: number): number {
  if (lbRound <= 1) return 0;
  const prev = losersRoundCounts[lbRound - 2] ?? 0;
  const curr = losersRoundCounts[lbRound - 1] ?? 0;
  if (curr >= prev) return 0;
  return curr - Math.floor(prev / 2);
}

function dropLbRoundForWbRelativeRound(
  relativeRound: number,
  losersRoundCounts: number[],
): number {
  let wbDropsSeen = 0;
  for (let i = 1; i < losersRoundCounts.length; i++) {
    const prev = losersRoundCounts[i - 1] ?? 0;
    const curr = losersRoundCounts[i] ?? 0;
    if (curr >= prev) {
      wbDropsSeen++;
      if (wbDropsSeen === relativeRound - 1) return i + 1;
    }
  }
  return losersRoundCounts.length;
}

function routeMergeRoundWbLosers(
  wbPosition: number,
  wbMatchCount: number,
  mergeRound: number,
  losersRoundCounts: number[],
): { lbRound: number; lbPosition: number; slot: number } | null {
  const soloSlots = countSoloMergeSlots(losersRoundCounts, mergeRound);
  if (soloSlots <= 0) return null;

  const half = wbMatchCount / 2;
  const mergeStart = half - soloSlots;
  if (wbPosition < mergeStart || wbPosition >= half) return null;

  const prev = losersRoundCounts[mergeRound - 2] ?? 0;
  const lbPosition = Math.floor(prev / 2) + (wbPosition - mergeStart);
  const mergeCount = losersRoundCounts[mergeRound - 1] ?? 0;
  if (lbPosition < mergeCount) {
    return { lbRound: mergeRound, lbPosition, slot: 2 };
  }
  return null;
}

function routeByeSideWbLosers(
  wbPosition: number,
  wbMatchCount: number,
  dropRound: number,
  dropRoundCount: number,
  openerCount: number,
): { lbRound: number; lbPosition: number; slot: number } | null {
  const extraMatches = dropRoundCount - openerCount;
  if (extraMatches <= 0) return null;

  const half = wbMatchCount / 2;
  if (wbPosition >= half) return null;

  const lbPosition = openerCount + Math.floor(wbPosition / 2);
  const slot = (wbPosition % 2) + 1;
  if (lbPosition < dropRoundCount) {
    return { lbRound: dropRound, lbPosition, slot };
  }
  return null;
}

function getLoserDestination(
  wbRound: number,
  wbPosition: number,
  totalWbRounds: number,
  startFromWbRound: number,
  losersRoundCounts: number[],
): { lbRound: number; lbPosition: number; slot: number } | null {
  if (wbRound === totalWbRounds) return null;
  if (wbRound < startFromWbRound) return null;

  const relativeRound = wbRound - startFromWbRound + 1;

  if (startFromWbRound === totalWbRounds - 1) {
    if (wbRound === totalWbRounds - 1) {
      return { lbRound: 1, lbPosition: 0, slot: wbPosition + 1 };
    }
    return null;
  }

  if (relativeRound === 1) {
    return {
      lbRound: 1,
      lbPosition: Math.floor(wbPosition / 2),
      slot: (wbPosition % 2) + 1,
    };
  }

  if (relativeRound === 2) {
    const dropRound = dropLbRoundForWbRelativeRound(relativeRound, losersRoundCounts);
    const wbMatchCount = Math.pow(2, totalWbRounds - wbRound);
    const dropRoundCount = losersRoundCounts[dropRound - 1] ?? 0;
    const openerCount = losersRoundCounts[0] ?? 0;

    const byeSide = routeByeSideWbLosers(
      wbPosition,
      wbMatchCount,
      dropRound,
      dropRoundCount,
      openerCount,
    );
    if (byeSide) return byeSide;

    if (dropRoundCount >= wbMatchCount && dropRoundCount > 0) {
      const half = wbMatchCount / 2;
      if (wbPosition < half) {
        const lbPosition = half + Math.floor(wbPosition / 2);
        const slot = (wbPosition % 2) + 1;
        if (lbPosition < dropRoundCount) {
          return { lbRound: dropRound, lbPosition, slot };
        }
      }
    }

    return mapWinnersLoserToDropInRound(
      wbRound,
      wbPosition,
      totalWbRounds,
      dropRound,
      losersRoundCounts,
    );
  }

  const dropRound = dropLbRoundForWbRelativeRound(relativeRound, losersRoundCounts);
  const wbMatchCount = Math.pow(2, totalWbRounds - wbRound);
  const mergeRound = dropRound - 1;

  const mergeRoute = routeMergeRoundWbLosers(
    wbPosition,
    wbMatchCount,
    mergeRound,
    losersRoundCounts,
  );
  if (mergeRoute) return mergeRoute;

  const dropRoundCount = losersRoundCounts[dropRound - 1] ?? 0;
  const prevRoundCount = losersRoundCounts[dropRound - 2] ?? 0;

  const byeSide = routeByeSideWbLosers(
    wbPosition,
    wbMatchCount,
    dropRound,
    dropRoundCount,
    prevRoundCount,
  );
  if (byeSide) return byeSide;

  return mapWinnersLoserToDropInRound(
    wbRound,
    wbPosition,
    totalWbRounds,
    dropRound,
    losersRoundCounts,
  );
}

function wireGrandFinal(
  winnersMatches: DeMatch[],
  losersMatches: DeMatch[],
  grandFinal: DeMatch,
  winnersRounds: number,
  losersRounds: number,
) {
  const wbFinal = winnersMatches.find((m) => m.round === winnersRounds && m.matchIndex === 0);
  const lbFinal = losersMatches.find((m) => m.round === losersRounds && m.matchIndex === 0);

  if (wbFinal) {
    wbFinal.winnerNextId = grandFinal.id;
    wbFinal.winnerNextSlot = 1;
    if (lbFinal) {
      wbFinal.loserNextId = lbFinal.id;
      wbFinal.loserNextSlot = 2;
    }
  }

  if (lbFinal) {
    lbFinal.winnerNextId = grandFinal.id;
    lbFinal.winnerNextSlot = 2;
  }
}

function placeParticipants(
  winnersMatches: DeMatch[],
  participantIds: string[],
  bracketSize: number,
) {
  const round1 = winnersMatches.filter((m) => m.round === 1);
  const pairs = generateSeedPairs(bracketSize);
  const seedToId = new Map(participantIds.map((id, i) => [i + 1, id]));

  pairs.forEach(([seed1, seed2], idx) => {
    const match = round1[idx];
    if (!match) return;
    match.player1Id = seedToId.get(seed1) ?? null;
    match.player2Id = seedToId.get(seed2) ?? null;
  });
}

function processRound1Byes(matches: DeMatch[]) {
  const matchMap = new Map(matches.map((m) => [m.id, m]));
  const round1Winners = matches.filter((m) => m.bracketSide === 'winners' && m.round === 1);

  for (const match of round1Winners) {
    const has1 = match.player1Id !== null;
    const has2 = match.player2Id !== null;
    if (!has1 && !has2) continue;
    if (has1 && has2) continue;

    const winnerId = match.player1Id ?? match.player2Id;
    if (match.winnerNextId && match.winnerNextSlot && winnerId) {
      const target = matchMap.get(match.winnerNextId);
      if (target) {
        if (match.winnerNextSlot === 1) target.player1Id = winnerId;
        else target.player2Id = winnerId;
      }
    }
  }
}

/** @internal Exported for bracket structure verification scripts. */
export function buildDoubleElimStructure(
  participantIds: string[],
  grandFinalsModifier: GrandFinalsModifier = 'default',
): DeMatch[] {
  const n = participantIds.length;
  if (n < 2) throw new Error('Need at least 2 participants to generate a bracket.');

  const bracketSize = nextPowerOf2(n);
  const winnersRounds = Math.log2(bracketSize);
  const startFromWbRound = 1;

  let counter = 0;
  const idFactory = () => `de-${counter++}`;

  const winnersMatches = createWinnersBracket(bracketSize, winnersRounds, idFactory);
  placeParticipants(winnersMatches, participantIds, bracketSize);
  processRound1Byes(winnersMatches);

  const losersRoundCounts = computeLosersRoundCounts(winnersRounds, winnersMatches, bracketSize);
  const losersRounds = losersRoundCounts.length;

  const losersMatches =
    losersRounds > 0 ? createLosersBracket(losersRoundCounts, idFactory) : [];

  if (losersMatches.length > 0) {
    wireWBR1LosersToLBR1(winnersMatches, losersMatches, bracketSize);
    wireLoserRouting(
      winnersMatches,
      losersMatches,
      winnersRounds,
      startFromWbRound,
      losersRoundCounts,
    );
  }

  const includeGrandFinal = grandFinalsModifier !== 'skip';

  if (includeGrandFinal) {
    const grandFinal: DeMatch = {
      id: idFactory(),
      round: 1,
      matchIndex: 0,
      bracketSide: 'grand_final',
      player1Id: null,
      player2Id: null,
      winnerNextId: null,
      winnerNextSlot: null,
      loserNextId: null,
      loserNextSlot: null,
    };

    wireGrandFinal(winnersMatches, losersMatches, grandFinal, winnersRounds, losersRounds);
    return [...winnersMatches, ...losersMatches, grandFinal];
  }

  return [...winnersMatches, ...losersMatches];
}

async function placeInSlot(matchId: string, slot: number, playerId: string) {
  await updateAdvancementMatchSlot(matchId, slot === 1 ? 1 : 2, playerId);
}

/** Place a loser in the linked LB match slot. */
async function placeLoserInBracket(
  tournamentId: string,
  loserNextId: string,
  loserNextSlot: number,
  loserId: string,
) {
  const target = await findAdvancementMatch(loserNextId);
  if (!target) return;

  const slotField = loserNextSlot === 1 ? 'player1Id' : 'player2Id';
  if (!target[slotField]) {
    await placeInSlot(loserNextId, loserNextSlot, loserId);
    return;
  }

  // Designated slot already filled — do not place in the opposite slot (causes scrambled pairings).
}

/** Auto-advance solo players and collapse dead-end matches (e.g. winners byes). */
export async function resolveSoloByeMatches(tournamentId: string) {
  for (let pass = 0; pass < 24; pass++) {
    const matches = await findAdvancementMatches(tournamentId);
    let changed = false;

    // Matches that will never receive players because all feeders were byes or are unreachable
    for (const match of matches) {
      if (match.status === 'complete' || match.status === 'bye') continue;
      if (match.player1Id || match.player2Id) continue;
      if (match.bracketSide === 'grand_final' || match.bracketSide === 'reset') continue;

      const incoming = matches.filter(
        (m) => m.winnerNextId === match.id || m.loserNextId === match.id,
      );
      if (incoming.length === 0) {
        await updateAdvancementMatch(match.id, { status: 'bye' });
        changed = true;
        break;
      }
      if (!incoming.every((m) => m.status === 'complete' || m.status === 'bye')) continue;

      await updateAdvancementMatch(match.id, { status: 'bye' });
      changed = true;
      break;
    }
    if (changed) continue;

    for (const match of matches) {
      if (match.status === 'complete' || match.status === 'bye') continue;
      if (match.bracketSide === 'grand_final' || match.bracketSide === 'reset') continue;

      const soloId = match.player1Id ?? match.player2Id;
      if (!soloId || (match.player1Id && match.player2Id)) continue;

      const emptySlot = match.player1Id ? 2 : 1;
      const feeders = matches.filter(
        (m) =>
          (m.loserNextId === match.id && m.loserNextSlot === emptySlot) ||
          (m.winnerNextId === match.id && m.winnerNextSlot === emptySlot),
      );

      const pendingIncoming = matches.filter(
        (m) =>
          (m.winnerNextId === match.id || m.loserNextId === match.id) &&
          m.status !== 'complete' &&
          m.status !== 'bye',
      );
      if (pendingIncoming.length > 0) continue;

      // Orphan drop-in on winners bracket only — losers bracket must wait for the paired slot.
      if (feeders.length === 0) {
        if (match.bracketSide === 'losers') {
          const allIncoming = matches.filter(
            (m) => m.winnerNextId === match.id || m.loserNextId === match.id,
          );
          if (
            allIncoming.length > 0 &&
            allIncoming.every((m) => m.status === 'complete' || m.status === 'bye')
          ) {
            await updateAdvancementMatch(match.id, { status: 'complete', winnerId: soloId });
            await advanceDoubleElimMatch(match.id, soloId, { resolveByes: false });
            changed = true;
            break;
          }
        } else {
          await updateAdvancementMatch(match.id, { status: 'complete', winnerId: soloId });
          await advanceDoubleElimMatch(match.id, soloId, { resolveByes: false });
          changed = true;
          break;
        }
        continue;
      }

      if (!feeders.every((m) => m.status === 'complete' || m.status === 'bye')) continue;

      await updateAdvancementMatch(match.id, { status: 'complete', winnerId: soloId });
      await advanceDoubleElimMatch(match.id, soloId, { resolveByes: false });
      changed = true;
      break;
    }

    if (!changed) break;
  }
}

export type GenerateDeOptions = {
  keepGroupMatches?: boolean;
  grandFinalsModifier?: string;
};

export async function generateDoubleEliminationBracket(
  tournamentId: string,
  participantIds?: string[],
  options?: GenerateDeOptions,
) {
  const tournament = await findTournamentDeSettings(tournamentId);
  if (!tournament) throw new Error('Tournament not found.');

  let ids = participantIds;
  if (!ids) {
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
    });
    ids = participants.map((p) => p.userId);
  }

  if (ids.length < 2) {
    throw new Error('Need at least 2 participants to generate a bracket.');
  }

  const modifier = parseGrandFinalsModifier(
    options?.grandFinalsModifier ?? tournament.grandFinalsModifier,
  );

  if (options?.keepGroupMatches) {
    await deleteBracketMatchesExceptGroup(tournamentId);
  } else {
    await prisma.match.deleteMany({ where: { tournamentId } });
  }

  const specs = buildDoubleElimStructure(ids, modifier);
  const idMap = new Map<string, string>();

  for (const spec of specs) {
    const created = await createAdvancementMatch({
      tournamentId,
      round: spec.round,
      matchIndex: spec.matchIndex,
      bracketSide: spec.bracketSide,
      player1Id: spec.player1Id,
      player2Id: spec.player2Id,
      status:
        spec.bracketSide === 'winners' &&
        spec.round === 1 &&
        ((spec.player1Id && !spec.player2Id) || (!spec.player1Id && spec.player2Id))
          ? 'complete'
          : spec.player1Id || spec.player2Id
            ? 'pending'
            : 'pending',
      winnerId:
        spec.bracketSide === 'winners' &&
        spec.round === 1 &&
        ((spec.player1Id && !spec.player2Id) || (!spec.player1Id && spec.player2Id))
          ? (spec.player1Id ?? spec.player2Id)
          : null,
    });
    idMap.set(spec.id, created.id);
  }

  for (const spec of specs) {
    const dbId = idMap.get(spec.id)!;
    await updateAdvancementMatch(dbId, {
      winnerNextId: spec.winnerNextId ? idMap.get(spec.winnerNextId) ?? null : null,
      winnerNextSlot: spec.winnerNextSlot,
      loserNextId: spec.loserNextId ? idMap.get(spec.loserNextId) ?? null : null,
      loserNextSlot: spec.loserNextSlot,
    });
  }

  const byeMatches = await findWinnersRoundOneByes(tournamentId);
  for (const m of byeMatches) {
    if (m.winnerId) await advanceDoubleElimMatch(m.id, m.winnerId);
  }

  await resolveSoloByeMatches(tournamentId);

  await updateTournamentPhase(tournamentId, {
    status: 'active',
    ...(!options?.keepGroupMatches ? { phase: 'playoffs' } : {}),
  });
}

export async function generateDoubleElimination(tournamentId: string) {
  const tournament = await findTournamentDeSettings(tournamentId);
  if (!tournament) throw new Error('Tournament not found.');

  if (tournament.groupStageEnabled) {
    const { generateGroupStage } = await import('@/lib/group-stage');
    await generateGroupStage(tournamentId);
    return;
  }
 
  await generateDoubleEliminationBracket(tournamentId, undefined, {
    grandFinalsModifier: tournament.grandFinalsModifier,
  });
}

export async function advanceDoubleElimMatch(
  matchId: string,
  winnerId: string,
  options?: { resolveByes?: boolean; forceReplace?: boolean },
) {
  const match = await findAdvancementMatch(matchId);
  if (!match) return;

  const loserId =
    match.player1Id === winnerId ? match.player2Id : match.player1Id;

  if (match.winnerNextId && match.winnerNextSlot) {
    await placeInSlot(match.winnerNextId, match.winnerNextSlot, winnerId);
  }

  if (match.loserNextId && match.loserNextSlot && loserId) {
    if (options?.forceReplace) {
      await placeInSlot(match.loserNextId, match.loserNextSlot, loserId);
    } else {
      await placeLoserInBracket(
        match.tournamentId,
        match.loserNextId,
        match.loserNextSlot,
        loserId,
      );
    }
  }

  if (options?.resolveByes !== false) {
    await resolveSoloByeMatches(match.tournamentId);
  }

  if (match.bracketSide === 'grand_final') {
    const modifier = parseGrandFinalsModifier(
      await findTournamentGrandFinalsModifier(match.tournamentId),
    );

    if (modifier === 'single_match') {
      await updateTournamentPhase(match.tournamentId, {
        status: 'complete',
        phase: 'complete',
      });
      return;
    }

    const lbChampWon = match.player2Id === winnerId;
    if (lbChampWon && match.player1Id && match.player2Id) {
      await createAdvancementMatch({
        tournamentId: match.tournamentId,
        bracketSide: 'reset',
        round: 1,
        matchIndex: 0,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        status: 'pending',
      });
    } else {
      await updateTournamentPhase(match.tournamentId, {
        status: 'complete',
        phase: 'complete',
      });
    }
    return;
  }

  if (match.bracketSide === 'reset') {
    await updateTournamentPhase(match.tournamentId, {
      status: 'complete',
      phase: 'complete',
    });
    return;
  }

  // Skip grand finals: tournament ends when losers bracket final completes
  if (match.bracketSide === 'losers') {
    if (parseGrandFinalsModifier(await findTournamentGrandFinalsModifier(match.tournamentId)) === 'skip') {
      const allMatches = await findAdvancementMatches(match.tournamentId);
      const lbRounds = allMatches.filter((m) => m.bracketSide === 'losers').map((m) => m.round);
      const maxLbRound = lbRounds.length > 0 ? Math.max(...lbRounds) : 0;
      const isLbFinal = match.round === maxLbRound && match.matchIndex === 0;

      if (isLbFinal) {
        await updateTournamentPhase(match.tournamentId, {
          status: 'complete',
          phase: 'complete',
        });
      }
    }
  }
}
