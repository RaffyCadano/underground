import { prisma } from '@/lib/prisma';

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

function getLosersMatchCount(bracketSize: number, round: number, startFromWbRound: number, totalWbRounds: number) {
  if (startFromWbRound === totalWbRounds - 1) {
    return round === 1 ? 1 : 0;
  }
  const effectiveBracketSize = bracketSize / Math.pow(2, startFromWbRound - 1);
  return effectiveBracketSize / Math.pow(2, Math.ceil(round / 2) + 1);
}

function wireLosersBracketWinners(matches: DeMatch[], idMap: Map<string, string>, totalRounds: number) {
  for (const match of matches) {
    if (match.round >= totalRounds) continue;
    const isOddRound = match.round % 2 === 1;
    let nextPos: number;
    let nextSlot: number;
    if (isOddRound) {
      nextPos = match.matchIndex;
      nextSlot = 1;
    } else {
      nextPos = Math.floor(match.matchIndex / 2);
      nextSlot = (match.matchIndex % 2) + 1;
    }
    const nextId = idMap.get(`${match.round + 1}-${nextPos}`);
    if (nextId) {
      match.winnerNextId = nextId;
      match.winnerNextSlot = nextSlot;
    }
  }
}

function createLosersBracket(
  bracketSize: number,
  rounds: number,
  startFromWbRound: number,
  idFactory: () => string,
  totalWbRounds: number,
): DeMatch[] {
  const matches: DeMatch[] = [];
  const idMap = new Map<string, string>();

  for (let round = 1; round <= rounds; round++) {
    const matchCount = getLosersMatchCount(bracketSize, round, startFromWbRound, totalWbRounds);
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

  wireLosersBracketWinners(matches, idMap, rounds);
  return matches;
}

function wireLoserRouting(
  winnersMatches: DeMatch[],
  losersMatches: DeMatch[],
  winnersRounds: number,
  startFromWbRound: number,
) {
  const losersIdMap = new Map<string, string>();
  for (const m of losersMatches) {
    losersIdMap.set(`${m.round}-${m.matchIndex}`, m.id);
  }

  for (const match of winnersMatches) {
    const routing = getLoserDestination(match.round, match.matchIndex, winnersRounds, startFromWbRound);
    if (routing) {
      const targetId = losersIdMap.get(`${routing.lbRound}-${routing.lbPosition}`);
      if (targetId) {
        match.loserNextId = targetId;
        match.loserNextSlot = routing.slot;
      }
    }
  }
}

function getLoserDestination(
  wbRound: number,
  wbPosition: number,
  totalWbRounds: number,
  startFromWbRound: number,
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
    const totalWinnersRoundMatches = Math.pow(2, totalWbRounds - wbRound);
    return {
      lbRound: 2,
      lbPosition: totalWinnersRoundMatches - 1 - wbPosition,
      slot: 2,
    };
  }

  const lbRound = (relativeRound - 2) * 2 + 2;
  return { lbRound, lbPosition: wbPosition, slot: 2 };
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
  const feederRounds = winnersRounds - 1;
  const losersRounds = feederRounds * 2 - 1;

  let counter = 0;
  const idFactory = () => `de-${counter++}`;

  const winnersMatches = createWinnersBracket(bracketSize, winnersRounds, idFactory);
  const losersMatches =
    losersRounds > 0
      ? createLosersBracket(bracketSize, losersRounds, startFromWbRound, idFactory, winnersRounds)
      : [];

  if (losersMatches.length > 0) {
    wireLoserRouting(winnersMatches, losersMatches, winnersRounds, startFromWbRound);
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

  placeParticipants(winnersMatches, participantIds, bracketSize);
  const all = [...winnersMatches, ...losersMatches, grandFinal];
  processRound1Byes(all);

  return all;
}

async function placeInSlot(matchId: string, slot: number, playerId: string) {
  const field = slot === 1 ? 'player1Id' : 'player2Id';
  await prisma.match.update({
    where: { id: matchId },
    data: { [field]: playerId },
  });
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
    const created = await prisma.match.create({
      data: {
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
      },
    });
    idMap.set(spec.id, created.id);
  }

  for (const spec of specs) {
    const dbId = idMap.get(spec.id)!;
    await prisma.match.update({
      where: { id: dbId },
      data: {
        winnerNextId: spec.winnerNextId ? idMap.get(spec.winnerNextId) ?? null : null,
        winnerNextSlot: spec.winnerNextSlot,
        loserNextId: spec.loserNextId ? idMap.get(spec.loserNextId) ?? null : null,
        loserNextSlot: spec.loserNextSlot,
      },
    });
  }

  // Advance round-1 bye winners into their next slots
  const byeMatches = await prisma.match.findMany({
    where: { tournamentId, bracketSide: 'winners', round: 1, status: 'complete' },
  });
  for (const m of byeMatches) {
    if (m.winnerId) await advanceDoubleElimMatch(m.id, m.winnerId);
  }

  await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'active' } });
}

export async function advanceDoubleElimMatch(matchId: string, winnerId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const loserId =
    match.player1Id === winnerId ? match.player2Id : match.player1Id;

  if (match.winnerNextId && match.winnerNextSlot) {
    await placeInSlot(match.winnerNextId, match.winnerNextSlot, winnerId);
  }

  if (match.loserNextId && match.loserNextSlot && loserId) {
    await placeInSlot(match.loserNextId, match.loserNextSlot, loserId);
  }

  if (match.bracketSide === 'grand_final') {
    const lbChampWon = match.player2Id === winnerId;
    if (lbChampWon && match.player1Id && match.player2Id) {
      await prisma.match.create({
        data: {
          tournamentId: match.tournamentId,
          bracketSide: 'reset',
          round: 1,
          matchIndex: 0,
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          status: 'pending',
        },
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
