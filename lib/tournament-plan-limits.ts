import { isAdminRole } from '@/lib/roles';
import { userHasActivePremier } from '@/lib/sync-stripe-subscription';
import { prisma } from '@/lib/prisma';

export const STANDARD_MAX_HOSTED_TOURNAMENTS = 3;
export const STANDARD_MAX_PLAYER_CAP = 256;

export type TournamentPlanLimits = {
  isPremier: boolean;
  canCreateRanked: boolean;
  maxPlayerCap: number | null;
  maxHostedTournaments: number | null;
};

export function tournamentPlanLimitsFromSubscription(
  subscriptionPlan: string,
  subscriptionStatus: string | null | undefined,
  role: string,
): TournamentPlanLimits {
  if (isAdminRole(role) || userHasActivePremier(subscriptionPlan, subscriptionStatus)) {
    return {
      isPremier: true,
      canCreateRanked: true,
      maxPlayerCap: null,
      maxHostedTournaments: null,
    };
  }

  return {
    isPremier: false,
    canCreateRanked: false,
    maxPlayerCap: STANDARD_MAX_PLAYER_CAP,
    maxHostedTournaments: STANDARD_MAX_HOSTED_TOURNAMENTS,
  };
}

export async function getTournamentPlanLimitsForUser(userId: string, role: string) {
  if (isAdminRole(role)) {
    return tournamentPlanLimitsFromSubscription('premier', 'active', role);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true, subscriptionStatus: true },
  });

  if (!user) {
    return tournamentPlanLimitsFromSubscription('free', null, role);
  }

  return tournamentPlanLimitsFromSubscription(
    user.subscriptionPlan,
    user.subscriptionStatus,
    role,
  );
}

export async function countHostedTournaments(userId: string) {
  return prisma.tournament.count({ where: { createdById: userId } });
}

export function tournamentCreateLimitError(
  hostedCount: number,
  limits: TournamentPlanLimits,
): string | null {
  if (limits.maxHostedTournaments == null) return null;
  if (hostedCount >= limits.maxHostedTournaments) {
    return `Standard plan includes up to ${limits.maxHostedTournaments} hosted tournaments. Upgrade to Premier to create more.`;
  }
  return null;
}

export function playerCapLimitError(
  playerCap: number | null,
  limits: TournamentPlanLimits,
): string | null {
  if (limits.maxPlayerCap == null) return null;
  if (playerCap != null && playerCap > limits.maxPlayerCap) {
    return `Standard plan allows up to ${limits.maxPlayerCap} players per tournament. Upgrade to Premier for larger events.`;
  }
  return null;
}

export function normalizeIsRankedForPlan(
  isRanked: boolean,
  limits: TournamentPlanLimits,
): boolean {
  if (!limits.canCreateRanked) return false;
  return isRanked;
}

/** Standard: blank cap defaults to 256; Premier: blank means unlimited. */
export function normalizePlayerCapForPlan(
  playerCap: number | null,
  limits: TournamentPlanLimits,
): number | null {
  if (limits.maxPlayerCap == null) return playerCap;
  if (playerCap == null) return limits.maxPlayerCap;
  return Math.min(playerCap, limits.maxPlayerCap);
}

export function playerCapHelperText(limits: TournamentPlanLimits): string {
  if (limits.maxPlayerCap == null) return 'Leave blank for no limit.';
  return `Standard plan: up to ${limits.maxPlayerCap} players. Leave blank to use the maximum.`;
}

export function hostedTournamentsHelperText(
  hostedCount: number,
  limits: TournamentPlanLimits,
): string | null {
  if (limits.maxHostedTournaments == null) return null;
  return `${hostedCount} of ${limits.maxHostedTournaments} tournaments used on Standard.`;
}
