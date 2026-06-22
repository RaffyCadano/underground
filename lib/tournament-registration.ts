import type { Tournament } from '@prisma/client';

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
