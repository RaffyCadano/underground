import type { TournamentFormInitial } from '@/lib/tournament-form';
import { swissScoringFromTournament, swissScoringToFormFields } from '@/lib/swiss-scoring';
import { parseRoundRobinRankBy } from '@/lib/tournament-options';
import { generateTournamentSlug } from '@/lib/tournament-slug';

export type TournamentTemplateFormInitial = Omit<
  TournamentFormInitial,
  'date' | 'checkInTime' | 'eventStartTime' | 'location' | 'slug'
>;

export function templateToFormInitial(template: {
  name: string;
  description: string | null;
  format: string;
  groupStageEnabled: boolean;
  grandFinalsModifier: string;
  deSplitLosersBracket?: boolean | null;
  deBreakTiesPlacement?: boolean | null;
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
}): TournamentTemplateFormInitial {
  const swissFields = swissScoringToFormFields(swissScoringFromTournament(template));
  return {
    name: template.name,
    description: template.description ?? '',
    format: template.format,
    groupStageEnabled: template.groupStageEnabled,
    grandFinalsModifier: template.grandFinalsModifier,
    deSplitLosersBracket: template.deSplitLosersBracket ?? true,
    deBreakTiesPlacement: template.deBreakTiesPlacement ?? true,
    groupSize: String(template.groupSize),
    advancePerGroup: String(template.advancePerGroup),
    entryFee: template.entryFee ?? '',
    prizePool: template.prizePool ?? '',
    playerCap: template.playerCap != null ? String(template.playerCap) : '',
    isRanked: template.isRanked,
    gameType: template.gameType,
    roundRobinRankBy: parseRoundRobinRankBy(template.roundRobinRankBy),
    ...swissFields,
  };
}

export function templateToTournamentInitial(
  template: TournamentTemplateFormInitial,
): TournamentFormInitial {
  return {
    ...template,
    slug: generateTournamentSlug(),
    date: '',
    checkInTime: '',
    eventStartTime: '',
    location: '',
  };
}
