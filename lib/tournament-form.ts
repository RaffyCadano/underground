export type TournamentFormInitial = {
  name: string;
  description: string;
  date: string;
  checkInTime: string;
  eventStartTime: string;
  location: string;
  format: string;
  groupStageEnabled: boolean;
  grandFinalsModifier: string;
  groupSize: string;
  advancePerGroup: string;
  entryFee: string;
  prizePool: string;
  playerCap: string;
  isRanked: boolean;
  gameType: string;
};

export function toDateInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function tournamentToFormInitial(tournament: {
  name: string;
  description: string | null;
  date: Date;
  checkInTime: string | null;
  eventStartTime: string | null;
  location: string | null;
  format: string;
  groupStageEnabled: boolean;
  grandFinalsModifier: string;
  groupSize: number;
  advancePerGroup: number;
  entryFee: string | null;
  prizePool: string | null;
  playerCap: number | null;
  isRanked: boolean;
  gameType: string;
}): TournamentFormInitial {
  return {
    name: tournament.name,
    description: tournament.description ?? '',
    date: toDateInputValue(tournament.date),
    checkInTime: tournament.checkInTime ?? '',
    eventStartTime: tournament.eventStartTime ?? '',
    location: tournament.location ?? '',
    format: tournament.format,
    groupStageEnabled: tournament.groupStageEnabled,
    grandFinalsModifier: tournament.grandFinalsModifier,
    groupSize: String(tournament.groupSize),
    advancePerGroup: String(tournament.advancePerGroup),
    entryFee: tournament.entryFee ?? '',
    prizePool: tournament.prizePool ?? '',
    playerCap: tournament.playerCap != null ? String(tournament.playerCap) : '',
    isRanked: tournament.isRanked,
    gameType: tournament.gameType,
  };
}
