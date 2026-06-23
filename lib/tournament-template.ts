import type { TournamentFormInitial } from '@/lib/tournament-form';

export type TournamentTemplateFormInitial = Omit<
  TournamentFormInitial,
  'date' | 'checkInTime' | 'eventStartTime' | 'location'
>;

export function templateToFormInitial(template: {
  name: string;
  description: string | null;
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
}): TournamentTemplateFormInitial {
  return {
    name: template.name,
    description: template.description ?? '',
    format: template.format,
    groupStageEnabled: template.groupStageEnabled,
    grandFinalsModifier: template.grandFinalsModifier,
    groupSize: String(template.groupSize),
    advancePerGroup: String(template.advancePerGroup),
    entryFee: template.entryFee ?? '',
    prizePool: template.prizePool ?? '',
    playerCap: template.playerCap != null ? String(template.playerCap) : '',
    isRanked: template.isRanked,
    gameType: template.gameType,
  };
}

export function templateToTournamentInitial(
  template: TournamentTemplateFormInitial,
): TournamentFormInitial {
  return {
    ...template,
    date: '',
    checkInTime: '',
    eventStartTime: '',
    location: '',
  };
}
