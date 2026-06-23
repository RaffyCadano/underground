import { prisma } from '@/lib/prisma';
import { generateDoubleEliminationBracket } from '@/lib/double-elim';
import { isPowerOfTwo } from '@/lib/tournament-options';
import { participantDisplayName } from '@/lib/tournament-participant';

/** Snake-draft participants into balanced groups (Challonge-style). */
export function assignSnakeGroups(
  participantIds: string[],
  groupCount: number,
): Map<number, string[]> {
  const groups = new Map<number, string[]>();
  for (let g = 0; g < groupCount; g++) groups.set(g, []);

  let groupIdx = 0;
  let direction = 1;

  for (const id of participantIds) {
    groups.get(groupIdx)!.push(id);
    if (direction === 1) {
      if (groupIdx === groupCount - 1) direction = -1;
      else groupIdx++;
    } else {
      if (groupIdx === 0) direction = 1;
      else groupIdx--;
    }
  }

  return groups;
}

function roundRobinPairings(playerIds: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      pairs.push([playerIds[i], playerIds[j]]);
    }
  }
  return pairs;
}

export type GroupStanding = {
  userId: string;
  username: string;
  wins: number;
  losses: number;
  rankPoints: number;
  groupRank: number;
};

export function computeGroupStandings(
  groupId: number,
  memberIds: string[],
  participants: {
    userId: string;
    walkInName?: string | null;
    user: { username: string; rankPoints: number };
  }[],
  matches: {
    bracketSide: string | null;
    groupId?: number | null;
    status: string;
    winnerId: string | null;
    player1Id: string | null;
    player2Id: string | null;
  }[],
): GroupStanding[] {
  const stats = memberIds.map((id) => {
    const p = participants.find((x) => x.userId === id);
    return {
      userId: id,
      username: p ? participantDisplayName(p) : 'Unknown',
      wins: 0,
      losses: 0,
      rankPoints: p?.user.rankPoints ?? 0,
      groupRank: 0,
    };
  });

  const groupMatches = matches.filter(
    (m) => m.bracketSide === 'group' && (m.groupId ?? null) === groupId && m.status === 'complete',
  );

  for (const m of groupMatches) {
    if (!m.winnerId) continue;
    const loserId = m.player1Id === m.winnerId ? m.player2Id : m.player1Id;
    const w = stats.find((s) => s.userId === m.winnerId);
    const l = loserId ? stats.find((s) => s.userId === loserId) : null;
    if (w) w.wins++;
    if (l) l.losses++;
  }

  const sorted = stats.sort(
    (a, b) => b.wins - a.wins || a.losses - b.losses || b.rankPoints - a.rankPoints,
  );

  sorted.forEach((s, i) => {
    s.groupRank = i + 1;
  });

  return sorted;
}

export async function generateGroupStage(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
        include: { user: { select: { rankPoints: true } } },
      },
    },
  });

  if (!tournament) throw new Error('Tournament not found.');
  if (!tournament.groupStageEnabled) {
    throw new Error('Group stage is not enabled for this tournament.');
  }

  const participants = tournament.participants;
  if (participants.length < 4) {
    throw new Error('Need at least 4 participants for a group stage.');
  }

  const { groupSize, advancePerGroup } = tournament;

  if (!isPowerOfTwo(advancePerGroup)) {
    throw new Error('Advancers per group must be a power of 2 (1, 2, 4, …).');
  }

  const groupCount = Math.ceil(participants.length / groupSize);
  const totalAdvancers = groupCount * advancePerGroup;

  if (totalAdvancers < 2) {
    throw new Error('Not enough playoff spots — add more groups or advancers per group.');
  }
  if (totalAdvancers > 2 && !isPowerOfTwo(totalAdvancers)) {
    throw new Error(
      `Total advancers (${totalAdvancers}) must be a power of 2 for double elimination playoffs.`,
    );
  }

  await prisma.match.deleteMany({ where: { tournamentId } });

  const sortedIds = [...participants]
    .sort((a, b) => {
      const sa = a.seed ?? 9999;
      const sb = b.seed ?? 9999;
      if (sa !== sb) return sa - sb;
      return b.user.rankPoints - a.user.rankPoints;
    })
    .map((p) => p.userId);

  const groups = assignSnakeGroups(sortedIds, groupCount);

  for (const [groupId, playerIds] of groups) {
    await prisma.tournamentParticipant.updateMany({
      where: { tournamentId, userId: { in: playerIds } },
      data: { groupId },
    });

    const pairings = roundRobinPairings(playerIds);
    for (let i = 0; i < pairings.length; i++) {
      const [p1, p2] = pairings[i];
      await prisma.match.create({
        data: {
          tournamentId,
          bracketSide: 'group',
          groupId,
          round: 1,
          matchIndex: i,
          player1Id: p1,
          player2Id: p2,
          status: 'pending',
        },
      });
    }
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'active', phase: 'group' },
  });
}

export async function generatePlayoffsFromGroups(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        include: { user: { select: { username: true, rankPoints: true } } },
      },
      matches: true,
    },
  });

  if (!tournament) throw new Error('Tournament not found.');
  if (tournament.phase !== 'group') {
    throw new Error('Playoffs can only start after the group stage.');
  }

  if (!isGroupStageComplete(tournament.matches)) {
    throw new Error('All group stage matches must be completed before starting playoffs.');
  }

  const groupCount = Math.ceil(tournament.participants.length / tournament.groupSize);
  const byRank: string[][] = Array.from({ length: tournament.advancePerGroup }, () => []);

  for (let g = 0; g < groupCount; g++) {
    const memberIds = tournament.participants
      .filter((p) => p.groupId === g)
      .map((p) => p.userId);

    const standings = computeGroupStandings(
      g,
      memberIds,
      tournament.participants,
      tournament.matches,
    );

    standings.slice(0, tournament.advancePerGroup).forEach((s, rankIdx) => {
      byRank[rankIdx].push(s.userId);
    });
  }

  const seededAdvancers = byRank.flat();

  if (seededAdvancers.length < 2) {
    throw new Error('Need at least 2 advancers to start playoffs.');
  }

  await generateDoubleEliminationBracket(tournamentId, seededAdvancers, {
    keepGroupMatches: true,
    grandFinalsModifier: tournament.grandFinalsModifier,
  });

  for (let i = 0; i < seededAdvancers.length; i++) {
    await prisma.tournamentParticipant.updateMany({
      where: { tournamentId, userId: seededAdvancers[i] },
      data: { seed: i + 1 },
    });
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { phase: 'playoffs' },
  });
}

export function isGroupStageComplete(
  matches: { bracketSide: string; status: string }[],
): boolean {
  const groupMatches = matches.filter((m) => m.bracketSide === 'group');
  return groupMatches.length > 0 && groupMatches.every((m) => m.status === 'complete');
}

export function buildGroupStageView(
  groupCount: number,
  participants: {
    userId: string;
    groupId?: number | null;
    walkInName?: string | null;
    user: { username: string; rankPoints: number };
  }[],
  matches: {
    id: string;
    bracketSide: string | null;
    groupId?: number | null;
    matchIndex: number;
    status: string;
    score: string | null;
    winnerId: string | null;
    player1Id: string | null;
    player2Id: string | null;
    player1: { id: string; username: string } | null;
    player2: { id: string; username: string } | null;
  }[],
) {
  return Array.from({ length: groupCount }, (_, g) => {
    const memberIds = participants.filter((p) => (p.groupId ?? null) === g).map((p) => p.userId);
    const standings = computeGroupStandings(g, memberIds, participants, matches);
    const groupMatches = matches
      .filter((m) => m.bracketSide === 'group' && (m.groupId ?? null) === g)
      .sort((a, b) => a.matchIndex - b.matchIndex);

    return {
      groupId: g,
      label: `Group ${String.fromCharCode(65 + g)}`,
      standings,
      matches: groupMatches,
    };
  });
}
