import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAdminRole } from '@/lib/roles';

export type TournamentHostRef = {
  createdById: string | null;
};

export function canManageTournament(
  tournament: TournamentHostRef,
  userId: string | undefined,
  role: string,
): boolean {
  if (!userId) return false;
  if (isAdminRole(role)) return true;
  return tournament.createdById === userId;
}

/** Non-admins only see tournaments they created. */
export function hostedTournamentsWhere(
  userId: string,
  role: string,
): Prisma.TournamentWhereInput | undefined {
  if (isAdminRole(role)) return undefined;
  return { createdById: userId };
}

export function mergeTournamentHostScope(
  base: Prisma.TournamentWhereInput,
  userId: string,
  role: string,
): Prisma.TournamentWhereInput {
  const scope = hostedTournamentsWhere(userId, role);
  if (!scope) return base;
  return { AND: [base, scope] };
}

export async function assertCanManageTournament(
  tournamentId: string,
  userId: string,
  role: string,
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, createdById: true },
  });
  if (!tournament) throw new Error('Tournament not found.');
  if (!canManageTournament(tournament, userId, role)) {
    throw new Error('Unauthorized.');
  }
  return tournament;
}
