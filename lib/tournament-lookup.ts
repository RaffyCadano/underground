import { prisma } from '@/lib/prisma';

export function tournamentPublicPath(tournament: { id: string; slug?: string | null }) {
  return `/tournaments/${tournament.slug ?? tournament.id}`;
}

export async function findTournamentByIdOrSlug(idOrSlug: string) {
  return prisma.tournament.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  });
}
