import type { Prisma } from '@prisma/client';

/** Users shown on public leaderboards and ranking lists. */
export const rankedPlayerWhere: Prisma.UserWhereInput = {
  role: 'player',
};

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
