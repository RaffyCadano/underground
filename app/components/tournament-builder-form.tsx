'use client';

import { DollarSign, Gamepad2, Gift, Users } from 'lucide-react';
import { TournamentDescriptionEditor } from '@/app/components/tournament-description-editor';
import {
  FieldLabel,
  FormSection,
  SelectionCard,
  TOURNAMENT_FORMAT_OPTIONS,
  TOURNAMENT_RANKING_OPTIONS,
  selectionCardClass,
} from '@/app/components/tournament-form-ui';
import { TournamentFormatStages, TournamentStageTypeSelector } from '@/app/components/tournament-format-stages';
import { GAME_TYPE_OPTIONS } from '@/lib/tournament-options';
import type { RoundRobinRankBy } from '@/lib/tournament-options';
import type { TournamentPlanLimits } from '@/lib/tournament-plan-limits';
import { playerCapHelperText } from '@/lib/tournament-plan-limits';
import { TournamentPlanLimitNotice } from '@/app/components/tournament-plan-limit-notice';

import type { SwissScoringFormFields } from '@/lib/swiss-scoring';
import { DEFAULT_SWISS_SCORING_FORM } from '@/lib/swiss-scoring';

export type TournamentBuilderFields = {
  name: string;
  description: string;
  gameType: string;
  format: string;
  groupStageEnabled: boolean;
  deSplitLosersBracket: boolean;
  deBreakTiesPlacement: boolean;
  groupSize: string;
  advancePerGroup: string;
  grandFinalsModifier: string;
  entryFee: string;
  prizePool: string;
  playerCap: string;
  isRanked: boolean;
  roundRobinRankBy: RoundRobinRankBy;
} & SwissScoringFormFields;

type FieldUpdater = <K extends keyof TournamentBuilderFields>(
  key: K,
  value: TournamentBuilderFields[K],
) => void;

export function TournamentBuilderForm({
  fields,
  update,
  planLimits,
  lockFormat = false,
  imageUploadEnabled = false,
  onGenerateDescription,
  canGenerateDescription = false,
}: {
  fields: TournamentBuilderFields;
  update: FieldUpdater;
  planLimits: TournamentPlanLimits;
  lockFormat?: boolean;
  imageUploadEnabled?: boolean;
  onGenerateDescription?: () => void;
  canGenerateDescription?: boolean;
}) {
  return (
    <div className="card divide-y divide-slate-800 overflow-hidden">
      <FormSection grouped title="Template details" description="Name and how this template appears in your library.">
        <div>
          <FieldLabel htmlFor="template-name">Name *</FieldLabel>
          <input
            id="template-name"
            name="name"
            type="text"
            required
            value={fields.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="My Swiss Night Template"
            className="input mt-2"
          />
        </div>
      </FormSection>

      <FormSection
        grouped
        title="Registration & rules"
        description="Entry, prizes, player limits, and whether wins count for rank."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="entry-fee">Entry fee</FieldLabel>
            <div className="relative mt-2">
              <DollarSign
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="entry-fee"
                name="entryFee"
                type="text"
                value={fields.entryFee}
                onChange={(e) => update('entryFee', e.target.value)}
                placeholder="Free"
                className="input pl-9"
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="prize-pool">Prize pool</FieldLabel>
            <div className="relative mt-2">
              <Gift
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="prize-pool"
                name="prizePool"
                type="text"
                value={fields.prizePool}
                onChange={(e) => update('prizePool', e.target.value)}
                placeholder="Booster box for 1st, TT for 2nd…"
                className="input pl-9"
              />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="player-cap">Player cap</FieldLabel>
          <div className="relative mt-2 max-w-xs">
            <Users
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              id="player-cap"
              name="playerCap"
              type="number"
              min={2}
              max={planLimits.maxPlayerCap ?? undefined}
              value={fields.playerCap}
              onChange={(e) => update('playerCap', e.target.value)}
              placeholder={planLimits.maxPlayerCap != null ? String(planLimits.maxPlayerCap) : 'Unlimited'}
              className="input pl-9"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{playerCapHelperText(planLimits)}</p>
        </div>

        <div>
          <FieldLabel>Ranked or unranked</FieldLabel>
          {!planLimits.canCreateRanked && (
            <>
              <input type="hidden" name="isRanked" value="false" />
              <div className="mt-2 space-y-3">
                <TournamentPlanLimitNotice
                  title="Ranked events are a Premier feature"
                  body="Standard tournaments are unranked. Upgrade to"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  {TOURNAMENT_RANKING_OPTIONS.map(({ value, label, description: desc, icon: Icon }) => {
                    const selected = value === 'false';
                    const disabled = value === 'true';
                    return (
                      <div
                        key={value}
                        className={selectionCardClass(selected, disabled)}
                        aria-disabled={disabled}
                      >
                        <SelectionCard
                          selected={selected}
                          icon={Icon}
                          label={label}
                          description={desc}
                          disabled={disabled}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {planLimits.canCreateRanked && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {TOURNAMENT_RANKING_OPTIONS.map(({ value, label, description: desc, icon: Icon }) => {
                const selected = (fields.isRanked ? 'true' : 'false') === value;
                return (
                  <label key={value} className={selectionCardClass(selected)}>
                    <input
                      type="radio"
                      name="isRanked"
                      value={value}
                      checked={selected}
                      onChange={() => update('isRanked', value === 'true')}
                      className="sr-only"
                    />
                    <SelectionCard selected={selected} icon={Icon} label={label} description={desc} />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <FieldLabel>Type of game</FieldLabel>
          <div className="mt-2 grid min-w-0 gap-2 md:grid-cols-2">
            {GAME_TYPE_OPTIONS.map(({ value, label, description: desc }) => {
              const selected = fields.gameType === value;
              return (
                <label key={value} className={selectionCardClass(selected)}>
                  <input
                    type="radio"
                    name="gameType"
                    value={value}
                    checked={selected}
                    onChange={(e) => update('gameType', e.target.value)}
                    className="sr-only"
                  />
                  <SelectionCard selected={selected} icon={Gamepad2} label={label} description={desc} />
                </label>
              );
            })}
          </div>
        </div>
      </FormSection>

      <FormSection grouped title="Format" description="Choose how matches and advancement work.">
        {lockFormat && (
          <>
            <input type="hidden" name="format" value={fields.format} />
            <input type="hidden" name="groupStageEnabled" value={fields.groupStageEnabled ? 'on' : ''} />
            <input type="hidden" name="groupSize" value={fields.groupSize} />
            <input type="hidden" name="advancePerGroup" value={fields.advancePerGroup} />
            <input type="hidden" name="grandFinalsModifier" value={fields.grandFinalsModifier} />
            <input type="hidden" name="deSplitLosersBracket" value={fields.deSplitLosersBracket ? 'on' : ''} />
            <input type="hidden" name="deBreakTiesPlacement" value={fields.deBreakTiesPlacement ? 'on' : ''} />
          </>
        )}

        <TournamentStageTypeSelector
          value={fields.groupStageEnabled ? 'two' : 'single'}
          onChange={(type) => {
            update('groupStageEnabled', type === 'two');
          }}
          lockFormat={lockFormat}
        />

        <div className="mt-4">
          <FieldLabel>
            {fields.groupStageEnabled ? 'Final stage format' : 'Bracket format'}
          </FieldLabel>
        <div className={`mt-2 grid min-w-0 gap-2 md:grid-cols-2 ${lockFormat ? 'pointer-events-none opacity-60' : ''}`}>
          {TOURNAMENT_FORMAT_OPTIONS.map(({ value, label, description: desc, icon: Icon }) => {
            const selected = fields.format === value;
            return (
              <label
                key={value}
                className={selectionCardClass(selected, lockFormat)}
              >
                <input
                  type="radio"
                  name={lockFormat ? undefined : 'format'}
                  value={value}
                  checked={selected}
                  onChange={(e) => {
                    if (lockFormat) return;
                    update('format', e.target.value);
                  }}
                  disabled={lockFormat}
                  className="sr-only"
                />
                <SelectionCard selected={selected} icon={Icon} label={label} description={desc} disabled={lockFormat} />
              </label>
            );
          })}
        </div>
        </div>

        <TournamentFormatStages
          format={fields.format}
          groupStageEnabled={fields.groupStageEnabled}
          onGroupStageEnabledChange={(enabled) => update('groupStageEnabled', enabled)}
          groupSize={fields.groupSize}
          onGroupSizeChange={(value) => update('groupSize', value)}
          advancePerGroup={fields.advancePerGroup}
          onAdvancePerGroupChange={(value) => update('advancePerGroup', value)}
          grandFinalsModifier={fields.grandFinalsModifier}
          onGrandFinalsModifierChange={(value) => update('grandFinalsModifier', value)}
          deSplitLosersBracket={fields.deSplitLosersBracket}
          onDeSplitLosersBracketChange={(enabled) => update('deSplitLosersBracket', enabled)}
          deBreakTiesPlacement={fields.deBreakTiesPlacement}
          onDeBreakTiesPlacementChange={(enabled) => update('deBreakTiesPlacement', enabled)}
          swissScoring={{
            swissPointsPerMatchWin: fields.swissPointsPerMatchWin,
            swissPointsPerMatchTie: fields.swissPointsPerMatchTie,
            swissPointsPerGameWin: fields.swissPointsPerGameWin,
            swissPointsPerGameTie: fields.swissPointsPerGameTie,
            swissPointsPerBye: fields.swissPointsPerBye,
          }}
          onSwissScoringChange={(key, value) => update(key, value)}
          roundRobinRankBy={fields.roundRobinRankBy}
          onRoundRobinRankByChange={(value) => update('roundRobinRankBy', value)}
          lockFormat={lockFormat}
          stageTypeControlled
        />
      </FormSection>

      <FormSection
        grouped
        flush
        title="Description"
        description="Shown on the public tournament page when you create an event from this template."
      >
        <TournamentDescriptionEditor
          value={fields.description}
          onChange={(v) => update('description', v)}
          uploadEnabled={imageUploadEnabled}
          onGenerate={onGenerateDescription}
          canGenerate={canGenerateDescription}
          placeholder="Tell players what to expect — venue, schedule, prizes, house rules…"
        />
      </FormSection>
    </div>
  );
}

export function buildFieldsFromTournamentInitial(initial?: {
  name?: string;
  description?: string;
  format?: string;
  groupStageEnabled?: boolean;
  grandFinalsModifier?: string;
  deSplitLosersBracket?: boolean;
  deBreakTiesPlacement?: boolean;
  groupSize?: string;
  advancePerGroup?: string;
  entryFee?: string;
  prizePool?: string;
  playerCap?: string;
  isRanked?: boolean;
  gameType?: string;
  roundRobinRankBy?: RoundRobinRankBy;
} & Partial<SwissScoringFormFields>): TournamentBuilderFields {
  return {
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    gameType: initial?.gameType ?? 'beyblade_x',
    format: initial?.format ?? 'single_elimination',
    groupStageEnabled: initial?.groupStageEnabled ?? false,
    groupSize: initial?.groupSize ?? '4',
    advancePerGroup: initial?.advancePerGroup ?? '2',
    grandFinalsModifier: initial?.grandFinalsModifier ?? 'default',
    deSplitLosersBracket: initial?.deSplitLosersBracket ?? true,
    deBreakTiesPlacement: initial?.deBreakTiesPlacement ?? true,
    entryFee: initial?.entryFee ?? '',
    prizePool: initial?.prizePool ?? '',
    playerCap: initial?.playerCap ?? '',
    isRanked: initial?.isRanked ?? true,
    swissPointsPerMatchWin: initial?.swissPointsPerMatchWin ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerMatchWin,
    swissPointsPerMatchTie: initial?.swissPointsPerMatchTie ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerMatchTie,
    swissPointsPerGameWin: initial?.swissPointsPerGameWin ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerGameWin,
    swissPointsPerGameTie: initial?.swissPointsPerGameTie ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerGameTie,
    swissPointsPerBye: initial?.swissPointsPerBye ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerBye,
    roundRobinRankBy: initial?.roundRobinRankBy ?? 'match_wins',
  };
}
