import type { Prisma } from '@prisma/client';
import { rankedPlayerWhere } from '@/lib/rankings';

export function parseSearchQuery(value?: string) {
  return value?.trim() ?? '';
}

export function playerSearchWhere(query: string): Prisma.UserWhereInput {
  if (!query) return rankedPlayerWhere;
  return {
    ...rankedPlayerWhere,
    username: { contains: query, mode: 'insensitive' },
  };
}

export type TournamentStatusFilter = 'all' | 'open' | 'active' | 'complete';

export function parseStatusFilter(value?: string): TournamentStatusFilter {
  if (value === 'open' || value === 'active' || value === 'complete') return value;
  return 'all';
}

export function tournamentSearchWhere(
  query: string,
  status: TournamentStatusFilter,
): Prisma.TournamentWhereInput {
  const where: Prisma.TournamentWhereInput = {};

  if (status !== 'all') {
    where.status = status;
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { location: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  return where;
}

export function buildListUrl(
  pathname: string,
  params: { page?: number; q?: string; status?: string },
) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.page && params.page > 1) searchParams.set('page', String(params.page));
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
