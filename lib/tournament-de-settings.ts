import { prisma } from '@/lib/prisma';

/** Tournament fields used by double-elim (explicit so IDE stays correct if Prisma client lags schema). */
export type TournamentDeSettings = {
  id: string;
  groupStageEnabled: boolean;
  groupSize: number;
  advancePerGroup: number;
  grandFinalsModifier: string;
  phase: string | null;
  status: string;
};

export type TournamentPhaseUpdate = {
  status?: string;
  phase?: string | null;
};

export async function findTournamentDeSettings(
  tournamentId: string,
): Promise<TournamentDeSettings | null> {
  const row = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      groupStageEnabled: true,
      groupSize: true,
      advancePerGroup: true,
      grandFinalsModifier: true,
      phase: true,
      status: true,
    } as Record<string, boolean>,
  });
  return row as TournamentDeSettings | null;
}

export async function findTournamentGrandFinalsModifier(
  tournamentId: string,
): Promise<string | null> {
  const row = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { grandFinalsModifier: true } as Record<string, boolean>,
  });
  const settings = row as { grandFinalsModifier: string } | null;
  return settings?.grandFinalsModifier ?? null;
}

export async function updateTournamentPhase(
  tournamentId: string,
  data: TournamentPhaseUpdate,
) {
  return prisma.tournament.update({
    where: { id: tournamentId },
    data: data as never,
  });
}

export async function deleteBracketMatchesExceptGroup(tournamentId: string) {
  return prisma.match.deleteMany({
    where: {
      tournamentId,
      bracketSide: { not: 'group' },
    } as never,
  });
}
