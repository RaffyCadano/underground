import type { Prisma } from '@prisma/client';

/** Staff accounts hidden from public leaderboards and account lists. */
export const HIDDEN_STAFF_USERNAMES = ['admin', 'TheVandaminator'] as const;

export function isHiddenStaffUsername(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  return HIDDEN_STAFF_USERNAMES.some((name) => name.toLowerCase() === normalized);
}

function hiddenStaffUsernameWhere(): Prisma.UserWhereInput {
  return {
    NOT: {
      OR: HIDDEN_STAFF_USERNAMES.map((username) => ({
        username: { equals: username, mode: 'insensitive' as const },
      })),
    },
  };
}

/** Users shown on public leaderboards and ranking lists. */
export const rankedPlayerWhere: Prisma.UserWhereInput = {
  AND: [{ role: 'player' }, hiddenStaffUsernameWhere()],
};

/** Ranked players who have earned at least one circuit point (podium / featured lists). */
export const rankedPlayerWithPointsWhere: Prisma.UserWhereInput = {
  AND: [rankedPlayerWhere, { rankPoints: { gt: 0 } }],
};

export function rankingsListWhere(searchQuery: string): Prisma.UserWhereInput {
  const query = searchQuery.trim();
  if (!query) return rankedPlayerWithPointsWhere;
  return {
    AND: [
      rankedPlayerWithPointsWhere,
      { username: { contains: query, mode: 'insensitive' as const } },
    ],
  };
}

export const rankedPlayerOrderBy: Prisma.UserOrderByWithRelationInput[] = [
  { rankPoints: 'desc' },
  { wins: 'desc' },
];

export const rankedPlayerSelect = {
  id: true,
  username: true,
  avatar: true,
  rankPoints: true,
  wins: true,
  losses: true,
} as const;
