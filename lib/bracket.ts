import { prisma } from '@/lib/prisma';
import { generateSeedPairs, nextPowerOf2 } from '@/lib/bracket-seeding';
import {
  buildRoundRobinSchedule,
  roundRobinPairingKey,
  roundRobinRoundCount,
  roundRobinTotalPairings,
} from '@/lib/round-robin-schedule';
import {
  computeSwissPlayerStats,
  swissScoringFromTournament,
} from '@/lib/swiss-scoring';

export async function generateSingleElimination(tournamentId: string, participantIds?: string[]) {
  return generateSingleEliminationBracket(tournamentId, participantIds);
}

export async function generateSingleEliminationBracket(
  tournamentId: string,
  participantIds?: string[],
  options?: { keepGroupMatches?: boolean },
) {
  let ids = participantIds;
  if (!ids) {
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
    });
    ids = participants.map((p) => p.userId);
  }

  if (ids.length < 2) throw new Error('Need at least 2 participants to generate a bracket.');

  if (options?.keepGroupMatches) {
    await prisma.match.deleteMany({ where: { tournamentId, bracketSide: { not: 'group' } } });
  } else {
    await prisma.match.deleteMany({ where: { tournamentId } });
  }

  const n = ids.length;
  const size = nextPowerOf2(n);
  const totalRounds = Math.log2(size);
  const pairs = generateSeedPairs(size);
  const seedToId = new Map(ids.map((id, i) => [i + 1, id]));

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round);
    for (let idx = 0; idx < matchesInRound; idx++) {
      let p1Id: string | null = null;
      let p2Id: string | null = null;
      let winnerId: string | null = null;
      let status = 'pending';

      if (round === 1) {
        const [seed1, seed2] = pairs[idx];
        p1Id = seedToId.get(seed1) ?? null;
        p2Id = seedToId.get(seed2) ?? null;

        if (p1Id && !p2Id) {
          winnerId = p1Id;
          status = 'complete';
        } else if (!p1Id && p2Id) {
          winnerId = p2Id;
          status = 'complete';
        } else if (!p1Id && !p2Id) {
          status = 'bye';
        }
      }

      await prisma.match.create({
        data: { tournamentId, round, matchIndex: idx, player1Id: p1Id, player2Id: p2Id, winnerId, status },
      });
    }
  }

  const byeMatches = await prisma.match.findMany({
    where: { tournamentId, round: 1, status: 'complete' },
  });
  for (const m of byeMatches) {
    if (m.winnerId) await advanceWinner(tournamentId, m.round, m.matchIndex, m.winnerId);
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { deBreakTiesPlacement: true },
  });
  if (tournament?.deBreakTiesPlacement && totalRounds >= 3) {
    await prisma.match.create({
      data: {
        tournamentId,
        round: totalRounds,
        matchIndex: 1,
        bracketSide: 'third_place',
        status: 'pending',
      },
    });
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'active', ...(options?.keepGroupMatches ? { phase: 'playoffs' } : {}) },
  });
}

export async function advanceWinner(
  tournamentId: string,
  completedRound: number,
  completedMatchIndex: number,
  winnerId: string,
) {
  const completedMatch = await prisma.match.findFirst({
    where: {
      tournamentId,
      round: completedRound,
      matchIndex: completedMatchIndex,
      bracketSide: { not: 'third_place' },
    },
  });
  if (!completedMatch) return;

  const loserId =
    completedMatch.player1Id === winnerId ? completedMatch.player2Id : completedMatch.player1Id;

  const [tournament, participantCount] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { deBreakTiesPlacement: true, format: true },
    }),
    prisma.tournamentParticipant.count({ where: { tournamentId } }),
  ]);

  const size = nextPowerOf2(participantCount);
  const totalRounds = Math.log2(size);

  if (
    tournament?.format === 'single_elimination' &&
    tournament.deBreakTiesPlacement &&
    totalRounds >= 3 &&
    completedRound === totalRounds - 1 &&
    loserId
  ) {
    const slot = completedMatchIndex === 0 ? 'player1Id' : 'player2Id';
    const thirdPlace = await prisma.match.findFirst({
      where: { tournamentId, bracketSide: 'third_place' },
    });
    if (thirdPlace) {
      await prisma.match.update({
        where: { id: thirdPlace.id },
        data: { [slot]: loserId },
      });
    } else {
      await prisma.match.create({
        data: {
          tournamentId,
          round: totalRounds,
          matchIndex: 1,
          bracketSide: 'third_place',
          [slot]: loserId,
          status: 'pending',
        },
      });
    }
  }

  const nextRound = completedRound + 1;
  const nextMatchIndex = Math.floor(completedMatchIndex / 2);
  const slot = completedMatchIndex % 2 === 0 ? 'player1Id' : 'player2Id';

  const nextMatch = await prisma.match.findFirst({
    where: {
      tournamentId,
      round: nextRound,
      matchIndex: nextMatchIndex,
      bracketSide: { not: 'third_place' },
    },
  });

  if (!nextMatch) {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'complete' } });
    return;
  }

  await prisma.match.update({
    where: { id: nextMatch.id },
    data: { [slot]: winnerId },
  });
}

export async function generateSwissRound(tournamentId: string, options?: { playoffsOnly?: boolean }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: { include: { user: { select: { id: true, rankPoints: true } } } },
      matches: true,
    },
  });
  if (!tournament) throw new Error('Tournament not found.');

  const playoffParticipants =
    options?.playoffsOnly || tournament.phase === 'playoffs'
      ? tournament.participants.filter((p) => p.seed != null)
      : tournament.participants;

  if (playoffParticipants.length < 2) throw new Error('Need at least 2 participants.');

  const existingMatches = tournament.matches.filter((m) =>
    options?.playoffsOnly || tournament.phase === 'playoffs' ? m.bracketSide !== 'group' : true,
  );
  const currentMaxRound =
    existingMatches.length > 0 ? Math.max(...existingMatches.map((m) => m.round)) : 0;

  // All matches in the current round must be complete before generating next
  if (currentMaxRound > 0) {
    const incomplete = existingMatches.filter(
      (m) => m.round === currentMaxRound && m.status !== 'complete',
    );
    if (incomplete.length > 0) throw new Error('Finish all matches in the current round first.');
  }

  const nextRound = currentMaxRound + 1;

  const scoring = swissScoringFromTournament(tournament);

  // Tally Swiss points and track who has already played whom
  const record = new Map<string, number>();
  const faced = new Map<string, Set<string>>();
  for (const p of playoffParticipants) {
    record.set(p.userId, 0);
    faced.set(p.userId, new Set());
  }
  for (const p of playoffParticipants) {
    const stats = computeSwissPlayerStats(p.userId, existingMatches, scoring);
    record.set(p.userId, stats.points);
  }
  for (const m of existingMatches) {
    if (m.player1Id && m.player2Id) {
      faced.get(m.player1Id)?.add(m.player2Id);
      faced.get(m.player2Id)?.add(m.player1Id);
    }
  }

  // Sort by Swiss points desc, then by seed rankPoints desc
  const sorted = [...playoffParticipants].sort((a, b) => {
    const diff = (record.get(b.userId) ?? 0) - (record.get(a.userId) ?? 0);
    if (diff !== 0) return diff;
    return b.user.rankPoints - a.user.rankPoints;
  });

  // Greedy pairing: prefer opponents with similar record who haven't been faced
  const paired = new Set<string>();
  const pairs: { p1: string; p2: string }[] = [];

  for (const p1 of sorted) {
    if (paired.has(p1.userId)) continue;
    let opponent = sorted.find(
      (p2) => p2.userId !== p1.userId && !paired.has(p2.userId) && !faced.get(p1.userId)?.has(p2.userId),
    ) ?? sorted.find((p2) => p2.userId !== p1.userId && !paired.has(p2.userId)) ?? null;

    if (opponent) {
      paired.add(p1.userId);
      paired.add(opponent.userId);
      pairs.push({ p1: p1.userId, p2: opponent.userId });
    }
  }

  for (let i = 0; i < pairs.length; i++) {
    await prisma.match.create({
      data: {
        tournamentId,
        round: nextRound,
        matchIndex: i,
        player1Id: pairs[i].p1,
        player2Id: pairs[i].p2,
        status: 'pending',
      },
    });
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'active' },
  });
}

export async function generateRoundRobinRound(
  tournamentId: string,
  options?: { playoffsOnly?: boolean },
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
        include: { user: { select: { id: true, rankPoints: true } } },
      },
      matches: true,
    },
  });
  if (!tournament) throw new Error('Tournament not found.');

  const playoffParticipants =
    options?.playoffsOnly || tournament.phase === 'playoffs'
      ? tournament.participants.filter((p) => p.seed != null)
      : tournament.participants;

  if (playoffParticipants.length < 2) throw new Error('Need at least 2 participants.');

  const existingMatches = tournament.matches.filter((m) =>
    options?.playoffsOnly || tournament.phase === 'playoffs' ? m.bracketSide !== 'group' : true,
  );
  const currentMaxRound =
    existingMatches.length > 0 ? Math.max(...existingMatches.map((m) => m.round)) : 0;

  if (currentMaxRound > 0) {
    const incomplete = existingMatches.filter(
      (m) => m.round === currentMaxRound && m.status !== 'complete',
    );
    if (incomplete.length > 0) throw new Error('Finish all matches in the current round first.');
  }

  const nextRound = currentMaxRound + 1;
  const playerIds = playoffParticipants.map((p) => p.userId);
  const totalRounds = roundRobinRoundCount(playerIds.length);
  const totalPairings = roundRobinTotalPairings(playerIds.length);

  if (nextRound > totalRounds) {
    throw new Error('All round robin rounds have been generated.');
  }

  const existingPairingKeys = new Set<string>();
  for (const match of existingMatches) {
    if (match.player1Id && match.player2Id) {
      existingPairingKeys.add(roundRobinPairingKey(match.player1Id, match.player2Id));
    }
  }

  if (existingPairingKeys.size >= totalPairings) {
    throw new Error('All round robin pairings are already on the bracket.');
  }

  const schedule = buildRoundRobinSchedule(playerIds);
  const pairs = schedule[nextRound - 1] ?? [];

  if (pairs.length === 0) {
    throw new Error('Could not build pairings for this round.');
  }

  let matchIndex = 0;
  for (const [p1, p2] of pairs) {
    if (existingPairingKeys.has(roundRobinPairingKey(p1, p2))) {
      continue;
    }
    await prisma.match.create({
      data: {
        tournamentId,
        round: nextRound,
        matchIndex,
        player1Id: p1,
        player2Id: p2,
        status: 'pending',
      },
    });
    matchIndex++;
  }

  if (matchIndex === 0) {
    throw new Error('All pairings for this round already exist on the bracket.');
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'active' },
  });
}

export async function generateRoundRobinBracket(
  tournamentId: string,
  participantIds: string[],
  options?: { keepGroupMatches?: boolean },
) {
  if (participantIds.length < 2) throw new Error('Need at least 2 participants.');

  if (options?.keepGroupMatches) {
    await prisma.match.deleteMany({ where: { tournamentId, bracketSide: { not: 'group' } } });
  } else {
    await prisma.match.deleteMany({ where: { tournamentId } });
  }

  const schedule = buildRoundRobinSchedule(participantIds);
  for (let roundIndex = 0; roundIndex < schedule.length; roundIndex++) {
    const pairs = schedule[roundIndex];
    for (let matchIndex = 0; matchIndex < pairs.length; matchIndex++) {
      const [p1, p2] = pairs[matchIndex];
      await prisma.match.create({
        data: {
          tournamentId,
          round: roundIndex + 1,
          matchIndex,
          player1Id: p1,
          player2Id: p2,
          status: 'pending',
        },
      });
    }
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'active', phase: options?.keepGroupMatches ? 'playoffs' : null },
  });
}
