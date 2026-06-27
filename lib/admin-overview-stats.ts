import { prisma } from '@/lib/prisma';
import { registeredAccountsWhere } from '@/lib/search';

function countByRole(groups: { role: string; _count: { _all: number } }[], role: string) {
  return groups.find((group) => group.role === role)?._count._all ?? 0;
}

function countByTournamentStatus(
  groups: { status: string; _count: { _all: number } }[],
  status: string,
) {
  return groups.find((group) => group.status === status)?._count._all ?? 0;
}

export async function getAdminOverviewStats() {
  const [
    registeredCount,
    roleGroups,
    premierCount,
    tournamentGroups,
    clubCount,
    pendingClubRequests,
    pendingOrganizerRequests,
    pendingContactMessages,
  ] = await Promise.all([
    prisma.user.count({ where: registeredAccountsWhere() }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    }),
    prisma.user.count({
      where: {
        subscriptionPlan: 'premier',
        OR: [
          { subscriptionStatus: null },
          { subscriptionStatus: { in: ['active', 'trialing'] } },
        ],
      },
    }),
    prisma.tournament.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.communityClub.count(),
    prisma.clubRequest.count({ where: { status: 'pending' } }),
    prisma.organizerRequest.count({ where: { status: 'pending' } }),
    prisma.contactMessage.count({ where: { status: 'pending' } }),
  ]);

  const tournamentCount = tournamentGroups.reduce((sum, group) => sum + group._count._all, 0);

  return {
    registeredCount,
    guestCount: countByRole(roleGroups, 'guest'),
    playerCount: countByRole(roleGroups, 'player'),
    adminCount: countByRole(roleGroups, 'admin'),
    organizerCount: countByRole(roleGroups, 'organizer'),
    premierCount,
    tournamentCount,
    openTournamentCount: countByTournamentStatus(tournamentGroups, 'open'),
    activeTournamentCount: countByTournamentStatus(tournamentGroups, 'active'),
    completeTournamentCount: countByTournamentStatus(tournamentGroups, 'complete'),
    clubCount,
    pendingClubRequests,
    pendingOrganizerRequests,
    pendingContactMessages,
  };
}
