import type { Prisma } from '@prisma/client';
import type { Tournament } from '@prisma/client';
import { rankedPlayerWhere } from '@/lib/rankings';

/** Site/staff accounts hidden from the tournament add-player picker. */
const EXCLUDED_PICKER_USERNAMES = ['admin', 'thevandaminator'] as const;

export function tournamentPlayerPickerWhere(excludeUserIds: string[]): Prisma.UserWhereInput {
  return {
    ...rankedPlayerWhere,
    id: { notIn: excludeUserIds },
    NOT: {
      OR: EXCLUDED_PICKER_USERNAMES.map((username) => ({
        username: { equals: username, mode: 'insensitive' as const },
      })),
    },
  };
}

export function isTournamentPickablePlayer(user: { role: string; username: string }): boolean {
  if (user.role !== 'player') return false;
  const normalized = user.username.trim().toLowerCase();
  return !EXCLUDED_PICKER_USERNAMES.some((name) => name === normalized);
}

export function isTournamentFull(
  participantCount: number,
  playerCap: number | null | undefined,
): boolean {
  return playerCap != null && playerCap > 0 && participantCount >= playerCap;
}

export function formatPlayerCapLabel(
  participantCount: number,
  playerCap: number | null | undefined,
): string {
  if (playerCap != null && playerCap > 0) {
    return `${participantCount} / ${playerCap} registered`;
  }
  return `${participantCount} registered`;
}

export function assertCanRegister(
  tournament: Pick<Tournament, 'status' | 'playerCap'>,
  participantCount: number,
  additionalCount = 1,
  options?: { exemptCap?: boolean },
): void {
  if (tournament.status !== 'open') {
    throw new Error('Tournament is not open for registration.');
  }
  if (
    !options?.exemptCap &&
    tournament.playerCap != null &&
    tournament.playerCap > 0 &&
    participantCount + additionalCount > tournament.playerCap
  ) {
    throw new Error(`Player cap reached (${tournament.playerCap}).`);
  }
}
