import { prisma } from '@/lib/prisma';
import {
  createAdvancementMatch,
  findAdvancementMatch,
  findAdvancementMatches,
  findWinnersRoundOneByes,
  updateAdvancementMatch,
  updateAdvancementMatchSlot,
} from '@/lib/match-advancement';

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

function nextPowerOf2(n: number) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

function generateSeedPairs(size: number): [number, number][] {
  let positions = [1, 2];
  while (positions.length < size) {
    const sum = positions.length * 2 + 1;
    const next: number[] = [];
    for (const pos of positions) {
      next.push(pos);
      next.push(sum - pos);
    }
    positions = next;
  }
  const pairs: [number, number][] = [];
  for (let i = 0; i < positions.length; i += 2) {
    pairs.push([positions[i], positions[i + 1]]);
  }
  return pairs;
}

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

function computeLosersRoundCounts(winnersRounds: number, dualWBR1Count: number): number[] {
  const lbR1 = Math.max(1, Math.ceil(dualWBR1Count / 2));
  const counts: number[] = [lbR1];

  for (let lbRound = 2; lbRound <= (winnersRounds - 1) * 2; lbRound++) {
    const prev = counts[counts.length - 1];
    if (lbRound % 2 === 0) {
      const wbRound = lbRound / 2 + 1;
      const wbMatchCount = Math.pow(2, winnersRounds - wbRound);
      counts.push(Math.min(prev, wbMatchCount));
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

/** Pair WB R1 losers into LB R1 matches sequentially (handles byes in padded brackets). */
function wireWBR1LosersToLBR1(winnersMatches: DeMatch[], losersMatches: DeMatch[]) {
  const dualWBR1 = winnersMatches
    .filter((m) => m.round === 1 && m.player1Id && m.player2Id)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  const lbR1 = losersMatches
    .filter((m) => m.round === 1)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  dualWBR1.forEach((wb, i) => {
    const lbIdx = Math.floor(i / 2);
    const slot = (i % 2) + 1;
    const target = lbR1[lbIdx];
    if (target) {
      wb.loserNextId = target.id;
      wb.loserNextSlot = slot;
    }
  });
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
    lbPosition: Math.min(lbMatchCount - 1, nextCount - 1),
    slot: 2,
  };
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
    return mapWinnersLoserToDropInRound(
      wbRound,
      wbPosition,
      totalWbRounds,
      2,
      losersRoundCounts,
    );
  }

  const lbRound = (relativeRound - 2) * 2 + 2;
  return mapWinnersLoserToDropInRound(
    wbRound,
    wbPosition,
    totalWbRounds,
    lbRound,
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

function buildDoubleElimStructure(participantIds: string[]): DeMatch[] {
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

  const dualWBR1 = countDualWinnersRoundOne(winnersMatches);
  const losersRoundCounts = computeLosersRoundCounts(winnersRounds, dualWBR1);
  const losersRounds = losersRoundCounts.length;

  const losersMatches =
    losersRounds > 0 ? createLosersBracket(losersRoundCounts, idFactory) : [];

  if (losersMatches.length > 0) {
    wireWBR1LosersToLBR1(winnersMatches, losersMatches);
    wireLoserRouting(
      winnersMatches,
      losersMatches,
      winnersRounds,
      startFromWbRound,
      losersRoundCounts,
    );
  }

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

  const otherSlot = loserNextSlot === 1 ? 2 : 1;
  const otherField = otherSlot === 1 ? 'player1Id' : 'player2Id';
  if (!target[otherField]) {
    await placeInSlot(loserNextId, otherSlot, loserId);
  }
}

/** Auto-advance solo players and collapse dead-end matches (e.g. winners byes). */
export async function resolveSoloByeMatches(tournamentId: string) {
  for (let pass = 0; pass < 24; pass++) {
    const matches = await findAdvancementMatches(tournamentId);
    let changed = false;

    // Matches that will never receive players because all feeders were byes
    for (const match of matches) {
      if (match.status === 'complete' || match.status === 'bye') continue;
      if (match.player1Id || match.player2Id) continue;
      if (match.bracketSide === 'grand_final' || match.bracketSide === 'reset') continue;

      const incoming = matches.filter(
        (m) => m.winnerNextId === match.id || m.loserNextId === match.id,
      );
      if (incoming.length === 0) continue;
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

      // No wired feeder for the empty slot (orphan drop-in) — advance the waiting player
      if (feeders.length === 0) {
        await updateAdvancementMatch(match.id, { status: 'complete', winnerId: soloId });
        await advanceDoubleElimMatch(match.id, soloId, { resolveByes: false });
        changed = true;
        break;
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

export async function generateDoubleElimination(tournamentId: string) {
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
  });

  if (participants.length < 2) {
    throw new Error('Need at least 2 participants to generate a bracket.');
  }

  await prisma.match.deleteMany({ where: { tournamentId } });

  const specs = buildDoubleElimStructure(participants.map((p) => p.userId));
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

  // Advance round-1 bye winners into their next slots
  const byeMatches = await findWinnersRoundOneByes(tournamentId);
  for (const m of byeMatches) {
    if (m.winnerId) await advanceDoubleElimMatch(m.id, m.winnerId);
  }

  await resolveSoloByeMatches(tournamentId);

  await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'active' } });
}

export async function advanceDoubleElimMatch(
  matchId: string,
  winnerId: string,
  options?: { resolveByes?: boolean },
) {
  const match = await findAdvancementMatch(matchId);
  if (!match) return;

  const loserId =
    match.player1Id === winnerId ? match.player2Id : match.player1Id;

  if (match.winnerNextId && match.winnerNextSlot) {
    await placeInSlot(match.winnerNextId, match.winnerNextSlot, winnerId);
  }

  if (match.loserNextId && match.loserNextSlot && loserId) {
    await placeLoserInBracket(
      match.tournamentId,
      match.loserNextId,
      match.loserNextSlot,
      loserId,
    );
  }

  if (options?.resolveByes !== false) {
    await resolveSoloByeMatches(match.tournamentId);
  }

  if (match.bracketSide === 'grand_final') {
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
      await prisma.tournament.update({
        where: { id: match.tournamentId },
        data: { status: 'complete' },
      });
    }
    return;
  }

  if (match.bracketSide === 'reset') {
    await prisma.tournament.update({
      where: { id: match.tournamentId },
      data: { status: 'complete' },
    });
  }
}
