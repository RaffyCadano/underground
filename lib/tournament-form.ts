import type { SwissScoringFormFields } from '@/lib/swiss-scoring';
import { swissScoringToFormFields, swissScoringFromTournament } from '@/lib/swiss-scoring';
import { parseRoundRobinRankBy, type RoundRobinRankBy } from '@/lib/tournament-options';
import { generateTournamentSlug } from '@/lib/tournament-slug';

export type TournamentFormInitial = {
  slug: string;
  name: string;
  description: string;
  date: string;
  checkInTime: string;
  eventStartTime: string;
  location: string;
  format: string;
  groupStageEnabled: boolean;
  grandFinalsModifier: string;
  deSplitLosersBracket: boolean;
  deBreakTiesPlacement: boolean;
  groupSize: string;
  advancePerGroup: string;
  entryFee: string;
  prizePool: string;
  playerCap: string;
  isRanked: boolean;
  gameType: string;
  roundRobinRankBy: RoundRobinRankBy;
} & SwissScoringFormFields;

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
  swissPointsPerMatchWin?: number | null;
  swissPointsPerMatchTie?: number | null;
  swissPointsPerGameWin?: number | null;
  swissPointsPerGameTie?: number | null;
  swissPointsPerBye?: number | null;
  roundRobinRankBy?: string | null;
  slug?: string | null;
  deSplitLosersBracket?: boolean | null;
  deBreakTiesPlacement?: boolean | null;
}): TournamentFormInitial {
  const swissFields = swissScoringToFormFields(swissScoringFromTournament(tournament));
  return {
    slug: tournament.slug ?? generateTournamentSlug(),
    name: tournament.name,
    description: tournament.description ?? '',
    date: toDateInputValue(tournament.date),
    checkInTime: tournament.checkInTime ?? '',
    eventStartTime: tournament.eventStartTime ?? '',
    location: tournament.location ?? '',
    format: tournament.format,
    groupStageEnabled: tournament.groupStageEnabled,
    grandFinalsModifier: tournament.grandFinalsModifier,
    deSplitLosersBracket: tournament.deSplitLosersBracket ?? true,
    deBreakTiesPlacement: tournament.deBreakTiesPlacement ?? true,
    groupSize: String(tournament.groupSize),
    advancePerGroup: String(tournament.advancePerGroup),
    entryFee: tournament.entryFee ?? '',
    prizePool: tournament.prizePool ?? '',
    playerCap: tournament.playerCap != null ? String(tournament.playerCap) : '',
    isRanked: tournament.isRanked,
    gameType: tournament.gameType,
    roundRobinRankBy: parseRoundRobinRankBy(tournament.roundRobinRankBy),
    ...swissFields,
  };
}
