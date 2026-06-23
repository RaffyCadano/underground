export type ParticipantNameSource = {
  userId: string;
  walkInName?: string | null;
  user: { username: string };
};

export function isWalkInParticipant(participant: { walkInName?: string | null }): boolean {
  return Boolean(participant.walkInName?.trim());
}

export function isWalkInDisplay(
  participant: ParticipantNameSource & { user: { role?: string } },
): boolean {
  return isWalkInParticipant(participant) || participant.user.role === 'guest';
}

export function participantDisplayName(participant: ParticipantNameSource): string {
  const walkIn = participant.walkInName?.trim();
  if (walkIn) return walkIn;
  return participant.user.username;
}

export function buildPlayerNameMap(participants: ParticipantNameSource[]): Record<string, string> {
  return Object.fromEntries(
    participants.map((participant) => [participant.userId, participantDisplayName(participant)]),
  );
}

export function playerDisplayName(
  player: { id: string; username: string } | null | undefined,
  playerNames: Record<string, string>,
): string {
  if (!player) return 'TBD';
  return playerNames[player.id] ?? player.username;
}
