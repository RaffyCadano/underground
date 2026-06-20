import { prisma } from '@/lib/prisma';

/** Match row shape used by double-elim advancement (explicit so IDE stays correct if Prisma client lags schema). */
export type AdvancementMatch = {
  id: string;
  tournamentId: string;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  score: string | null;
  round: number;
  matchIndex: number;
  status: string;
  bracketSide: string;
  winnerNextId: string | null;
  winnerNextSlot: number | null;
  loserNextId: string | null;
  loserNextSlot: number | null;
};

export type MatchAdvancementCreate = {
  tournamentId: string;
  round: number;
  matchIndex: number;
  bracketSide: string;
  player1Id?: string | null;
  player2Id?: string | null;
  winnerId?: string | null;
  status?: string;
  winnerNextId?: string | null;
  winnerNextSlot?: number | null;
  loserNextId?: string | null;
  loserNextSlot?: number | null;
};

export type MatchAdvancementUpdate = Partial<
  Pick<
    AdvancementMatch,
    | 'player1Id'
    | 'player2Id'
    | 'winnerId'
    | 'status'
    | 'winnerNextId'
    | 'winnerNextSlot'
    | 'loserNextId'
    | 'loserNextSlot'
  >
>;

export async function findAdvancementMatches(tournamentId: string) {
  const rows = await prisma.match.findMany({ where: { tournamentId } });
  return rows as AdvancementMatch[];
}

export async function findAdvancementMatch(matchId: string) {
  const row = await prisma.match.findUnique({ where: { id: matchId } });
  return row as AdvancementMatch | null;
}

export async function findWinnersRoundOneByes(tournamentId: string) {
  const rows = await prisma.match.findMany({
    where: {
      tournamentId,
      bracketSide: 'winners',
      round: 1,
      status: 'complete',
    } as Record<string, unknown>,
  });
  return rows as AdvancementMatch[];
}

export async function createAdvancementMatch(data: MatchAdvancementCreate) {
  return prisma.match.create({ data: data as never });
}

export async function updateAdvancementMatch(matchId: string, data: MatchAdvancementUpdate) {
  return prisma.match.update({ where: { id: matchId }, data: data as never });
}

export async function updateAdvancementMatchSlot(
  matchId: string,
  slot: 1 | 2,
  playerId: string,
) {
  const field = slot === 1 ? 'player1Id' : 'player2Id';
  return updateAdvancementMatch(matchId, { [field]: playerId });
}
