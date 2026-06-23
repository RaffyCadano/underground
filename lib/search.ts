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

export type AccountRoleFilter = 'all' | 'player' | 'organizer' | 'admin' | 'guest';

export function parseRoleFilter(value?: string): AccountRoleFilter {
  if (value === 'player' || value === 'organizer' || value === 'admin' || value === 'guest') return value;
  return 'all';
}

/** Real site accounts — excludes internal walk-in guest records. */
export function registeredAccountsWhere(): Prisma.UserWhereInput {
  return { role: { not: 'guest' } };
}

export function accountSearchWhere(
  query: string,
  role: AccountRoleFilter,
): Prisma.UserWhereInput {
  const searchOr: Prisma.UserWhereInput['OR'] = [
    { username: { contains: query, mode: 'insensitive' } },
    { email: { contains: query, mode: 'insensitive' } },
  ];

  if (role === 'all') {
    return { ...registeredAccountsWhere(), ...(query ? { OR: searchOr } : {}) };
  }

  const where: Prisma.UserWhereInput = { role };

  if (query) {
    where.OR = searchOr;
  }

  return where;
}

export function buildListUrl(
  pathname: string,
  params: { page?: number; q?: string; status?: string; role?: string },
) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.role && params.role !== 'all') searchParams.set('role', params.role);
  if (params.page && params.page > 1) searchParams.set('page', String(params.page));
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
