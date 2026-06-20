import { prisma } from '@/lib/prisma';

export async function generateSingleElimination(tournamentId: string) {
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
  });

  if (participants.length < 2) throw new Error('Need at least 2 participants to generate a bracket.');

  // Delete any existing matches for this tournament
  await prisma.match.deleteMany({ where: { tournamentId } });

  const n = participants.length;
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const ids: (string | null)[] = participants.map((p) => p.userId);
  while (ids.length < size) ids.push(null); // pad with byes

  const totalRounds = Math.log2(size);

  // Create all matches for every round
  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round);
    for (let idx = 0; idx < matchesInRound; idx++) {
      let p1Id: string | null = null;
      let p2Id: string | null = null;
      let winnerId: string | null = null;
      let status = 'pending';

      if (round === 1) {
        p1Id = ids[idx * 2];
        p2Id = ids[idx * 2 + 1];

        // Auto-resolve byes
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

  // Advance any auto-completed bye matches into round 2+
  const byeMatches = await prisma.match.findMany({
    where: { tournamentId, round: 1, status: 'complete' },
  });
  for (const m of byeMatches) {
    if (m.winnerId) await advanceWinner(tournamentId, m.round, m.matchIndex, m.winnerId);
  }

  await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'active' } });
}

export async function advanceWinner(
  tournamentId: string,
  completedRound: number,
  completedMatchIndex: number,
  winnerId: string,
) {
  const nextRound = completedRound + 1;
  const nextMatchIndex = Math.floor(completedMatchIndex / 2);
  const slot = completedMatchIndex % 2 === 0 ? 'player1Id' : 'player2Id';

  const nextMatch = await prisma.match.findFirst({
    where: { tournamentId, round: nextRound, matchIndex: nextMatchIndex },
  });

  if (!nextMatch) {
    // This was the final — tournament complete
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'complete' } });
    return;
  }

  await prisma.match.update({
    where: { id: nextMatch.id },
    data: { [slot]: winnerId },
  });
}

export async function generateSwissRound(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: { include: { user: { select: { id: true, rankPoints: true } } } },
      matches: true,
    },
  });
  if (!tournament) throw new Error('Tournament not found.');
  if (tournament.participants.length < 2) throw new Error('Need at least 2 participants.');

  const existingMatches = tournament.matches;
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

  // Tally wins and track who has already played whom
  const wins = new Map<string, number>();
  const faced = new Map<string, Set<string>>();
  for (const p of tournament.participants) {
    wins.set(p.userId, 0);
    faced.set(p.userId, new Set());
  }
  for (const m of existingMatches) {
    if (m.winnerId && m.player1Id && m.player2Id) {
      wins.set(m.winnerId, (wins.get(m.winnerId) ?? 0) + 1);
      faced.get(m.player1Id)?.add(m.player2Id);
      faced.get(m.player2Id)?.add(m.player1Id);
    }
  }

  // Sort by wins desc, then by seed rankPoints desc
  const sorted = [...tournament.participants].sort((a, b) => {
    const diff = (wins.get(b.userId) ?? 0) - (wins.get(a.userId) ?? 0);
    if (diff !== 0) return diff;
    return (b.user.rankPoints) - (a.user.rankPoints);
  });

  // Greedy pairing: prefer opponents with same wins who haven't been faced
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

  await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'active' } });
}
