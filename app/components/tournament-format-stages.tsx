'use client';

import { Info, Layers, RefreshCw, Trophy, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FieldLabel } from '@/app/components/tournament-form-ui';
import {
  GRAND_FINALS_OPTIONS,
  ROUND_ROBIN_RANK_BY_OPTIONS,
  isPowerOfTwo,
  type RoundRobinRankBy,
} from '@/lib/tournament-options';
import {
  DEFAULT_SWISS_SCORING_FORM,
  type SwissScoringFormFields,
} from '@/lib/swiss-scoring';

export type TournamentStageType = 'single' | 'two';

export const TOURNAMENT_STAGE_TYPE_OPTIONS: {
  value: TournamentStageType;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: 'single',
    label: 'Single Stage Tournament',
    description: 'One bracket or league — all players compete in the same stage.',
    icon: Trophy,
  },
  {
    value: 'two',
    label: 'Two Stage Tournament',
    description: 'Groups compete separately, winners proceed to a final stage (e.g. World Cup).',
    icon: Layers,
  },
];

const FORMAT_META: Record<
  string,
  { label: string; icon: LucideIcon; groupHint?: string; finalNotes: string[] }
> = {
  single_elimination: {
    label: 'Single Elimination',
    icon: Trophy,
    groupHint:
      'Participants advance from each group — must be a power of 2 for single & double elim (1, 2, 4, 8, 16, …).',
    finalNotes: ['Optional 3rd place match between semifinal losers.'],
  },
  double_elimination: {
    label: 'Double Elimination',
    icon: Layers,
    groupHint:
      'Participants advance from each group — must be a power of 2 for single & double elim (1, 2, 4, 8, 16, …).',
    finalNotes: [
      'Split participants — losers bracket starts with half the playoff field.',
      'Break ties with placement matches.',
    ],
  },
  round_robin: {
    label: 'Round Robin',
    icon: RefreshCw,
    groupHint: 'Participants compete in each group — 20 max per group for round robin.',
    finalNotes: [],
  },
  swiss: {
    label: 'Swiss',
    icon: Users,
    groupHint: 'Participants compete in each group, then advance to the final stage.',
    finalNotes: [],
  },
};

const SWISS_SCORING_ROWS: { key: keyof SwissScoringFormFields; label: string }[] = [
  { key: 'swissPointsPerMatchWin', label: 'Points per match win' },
  { key: 'swissPointsPerMatchTie', label: 'Points per match tie' },
  { key: 'swissPointsPerGameWin', label: 'Points per game/set win' },
  { key: 'swissPointsPerGameTie', label: 'Points per game/set tie' },
  { key: 'swissPointsPerBye', label: 'Points per bye' },
];

const ADVANCE_OPTIONS = ['1', '2', '4', '8', '16'] as const;
const GROUP_SIZE_OPTIONS = ['3', '4', '5', '6', '7', '8'] as const;

export function TournamentStageTypeSelector({
  value,
  onChange,
  lockFormat = false,
}: {
  value: TournamentStageType;
  onChange: (type: TournamentStageType) => void;
  lockFormat?: boolean;
}) {
  return (
    <div>
      <FieldLabel>Type</FieldLabel>
      <div
        className={`mt-2 grid min-w-0 gap-2 md:grid-cols-2 ${lockFormat ? 'pointer-events-none opacity-60' : ''}`}
      >
        {TOURNAMENT_STAGE_TYPE_OPTIONS.map(({ value: optionValue, label, description, icon: Icon }) => {
          const selected = value === optionValue;
          return (
            <label
              key={optionValue}
              className={`flex gap-3 rounded-xl border p-3.5 transition ${
                lockFormat ? 'cursor-default' : 'cursor-pointer'
              } ${
                selected
                  ? 'border-brand-500/60 bg-brand-500/10 ring-1 ring-brand-500/30'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tournamentStageType"
                value={optionValue}
                checked={selected}
                onChange={() => onChange(optionValue)}
                disabled={lockFormat}
                className="sr-only"
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                  selected
                    ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400'
                }`}
              >
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function StagePanel({
  title,
  formatLabel,
  icon: Icon,
  children,
}: {
  title: string;
  formatLabel: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-200">
          <Icon size={12} />
          {formatLabel}
        </span>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
      <Info size={14} className="mt-0.5 shrink-0 text-slate-600" />
      <span>{children}</span>
    </p>
  );
}

function FormatOptionCheckbox({
  checked,
  onChange,
  label,
  description,
  name,
  lockFormat,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  name?: string;
  lockFormat: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition ${
        lockFormat ? '' : 'cursor-pointer hover:border-slate-700'
      }`}
    >
      <input
        type="checkbox"
        name={lockFormat ? undefined : name}
        value="on"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={lockFormat}
        className="mt-0.5 rounded border-slate-600"
      />
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
        )}
      </span>
    </label>
  );
}

function SwissScoringInputs({
  values,
  onChange,
  lockFormat,
  fieldNames,
}: {
  values: SwissScoringFormFields;
  onChange: (key: keyof SwissScoringFormFields, value: string) => void;
  lockFormat: boolean;
  fieldNames?: Partial<SwissScoringFormFields>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SWISS_SCORING_ROWS.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
        >
          <label htmlFor={row.key} className="text-xs text-slate-400">
            {row.label}
          </label>
          <input
            id={row.key}
            name={lockFormat ? undefined : fieldNames?.[row.key] ?? row.key}
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            value={values[row.key]}
            onChange={(e) => onChange(row.key, e.target.value)}
            disabled={lockFormat}
            className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-right font-mono text-sm font-semibold tabular-nums text-slate-200 disabled:opacity-60"
          />
        </div>
      ))}
    </div>
  );
}

export function TournamentFormatStages({
  format,
  groupStageEnabled,
  onGroupStageEnabledChange,
  groupSize,
  onGroupSizeChange,
  advancePerGroup,
  onAdvancePerGroupChange,
  grandFinalsModifier,
  onGrandFinalsModifierChange,
  deSplitLosersBracket = true,
  onDeSplitLosersBracketChange,
  deBreakTiesPlacement = true,
  onDeBreakTiesPlacementChange,
  swissScoring = DEFAULT_SWISS_SCORING_FORM,
  onSwissScoringChange,
  roundRobinRankBy = 'match_wins',
  onRoundRobinRankByChange,
  lockFormat = false,
  stageTypeControlled = false,
  fieldNames = {},
}: {
  format: string;
  groupStageEnabled: boolean;
  onGroupStageEnabledChange: (enabled: boolean) => void;
  groupSize: string;
  onGroupSizeChange: (value: string) => void;
  advancePerGroup: string;
  onAdvancePerGroupChange: (value: string) => void;
  grandFinalsModifier: string;
  onGrandFinalsModifierChange: (value: string) => void;
  deSplitLosersBracket?: boolean;
  onDeSplitLosersBracketChange?: (enabled: boolean) => void;
  deBreakTiesPlacement?: boolean;
  onDeBreakTiesPlacementChange?: (enabled: boolean) => void;
  swissScoring?: SwissScoringFormFields;
  onSwissScoringChange?: (key: keyof SwissScoringFormFields, value: string) => void;
  roundRobinRankBy?: RoundRobinRankBy;
  onRoundRobinRankByChange?: (value: RoundRobinRankBy) => void;
  lockFormat?: boolean;
  stageTypeControlled?: boolean;
  fieldNames?: {
    groupStageEnabled?: string;
    groupSize?: string;
    advancePerGroup?: string;
    grandFinalsModifier?: string;
    deSplitLosersBracket?: string;
    deBreakTiesPlacement?: string;
    roundRobinRankBy?: string;
  } & Partial<SwissScoringFormFields>;
}) {
  const meta = FORMAT_META[format] ?? FORMAT_META.single_elimination;
  const supportsGroupStage = stageTypeControlled ? groupStageEnabled : format === 'double_elimination';
  const advanceNum = parseInt(advancePerGroup, 10) || 0;
  const needsPowerOfTwo =
    groupStageEnabled &&
    (format === 'single_elimination' || format === 'double_elimination');
  const advanceInvalid = needsPowerOfTwo && advanceNum > 0 && !isPowerOfTwo(advanceNum);

  const disabledClass = lockFormat ? 'pointer-events-none opacity-60' : '';
  const showGroupStage = stageTypeControlled ? groupStageEnabled : true;

  return (
    <div className={`mt-4 space-y-4 ${disabledClass}`}>
      {stageTypeControlled && !lockFormat && (
        <input type="hidden" name={fieldNames.groupStageEnabled ?? 'groupStageEnabled'} value={groupStageEnabled ? 'on' : ''} />
      )}

      {showGroupStage && (
      <StagePanel title="Group stage" formatLabel="Round Robin" icon={RefreshCw}>
        {supportsGroupStage ? (
          <>
            {!stageTypeControlled && (
            <label
              className={`flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition ${
                lockFormat ? '' : 'cursor-pointer hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                name={lockFormat ? undefined : fieldNames.groupStageEnabled ?? 'groupStageEnabled'}
                checked={groupStageEnabled}
                onChange={(e) => onGroupStageEnabledChange(e.target.checked)}
                disabled={lockFormat}
                className="mt-0.5 rounded border-slate-600"
              />
              <span>
                <span className="block text-sm font-medium text-slate-200">Enable group stage</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Round robin pools, then top players advance to the final stage bracket.
                </span>
              </span>
            </label>
            )}

            {(stageTypeControlled || groupStageEnabled) && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="groupSize">Participants per group</FieldLabel>
                    <select
                      id="groupSize"
                      name={lockFormat ? undefined : fieldNames.groupSize ?? 'groupSize'}
                      value={groupSize}
                      onChange={(e) => onGroupSizeChange(e.target.value)}
                      disabled={lockFormat}
                      className="select mt-2"
                    >
                      {GROUP_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-500">Participants compete in each group.</p>
                  </div>
                  <div>
                    <FieldLabel htmlFor="advancePerGroup">Advance per group</FieldLabel>
                    <select
                      id="advancePerGroup"
                      name={lockFormat ? undefined : fieldNames.advancePerGroup ?? 'advancePerGroup'}
                      value={advancePerGroup}
                      onChange={(e) => onAdvancePerGroupChange(e.target.value)}
                      disabled={lockFormat}
                      className={`select mt-2 ${advanceInvalid ? 'border-amber-500/50 ring-1 ring-amber-500/30' : ''}`}
                    >
                      {ADVANCE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    {meta.groupHint && <p className="mt-1.5 text-xs text-slate-500">{meta.groupHint}</p>}
                    {advanceInvalid && (
                      <p className="mt-1.5 text-xs text-amber-400">
                        Use 1, 2, 4, 8, or 16 so playoff brackets seed correctly.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <Hint>
            Select <span className="text-slate-400">Two Stage Tournament</span> above to configure
            round robin groups before the final stage.
          </Hint>
        )}
      </StagePanel>
      )}

      <StagePanel title="Final stage" formatLabel={meta.label} icon={meta.icon}>
        {format === 'round_robin' && (
          <div className="space-y-3">
            <Hint>Participants play each other once.</Hint>
            <div>
              <FieldLabel htmlFor="roundRobinRankBy">Rank by</FieldLabel>
              <select
                id="roundRobinRankBy"
                name={lockFormat ? undefined : fieldNames.roundRobinRankBy ?? 'roundRobinRankBy'}
                value={roundRobinRankBy}
                onChange={(e) => onRoundRobinRankByChange?.(e.target.value as RoundRobinRankBy)}
                disabled={lockFormat}
                className="select mt-2"
              >
                {ROUND_ROBIN_RANK_BY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                {ROUND_ROBIN_RANK_BY_OPTIONS.find((o) => o.value === roundRobinRankBy)?.description}
              </p>
            </div>
          </div>
        )}

        {format === 'single_elimination' && (
          <div className="space-y-2">
            <FormatOptionCheckbox
              checked={deBreakTiesPlacement}
              onChange={(enabled) => onDeBreakTiesPlacementChange?.(enabled)}
              label="3rd place match"
              description="Semifinal losers play for bronze. Requires at least 5 players (semifinal round)."
              lockFormat={lockFormat}
              name={fieldNames.deBreakTiesPlacement ?? 'deBreakTiesPlacement'}
            />
            {!groupStageEnabled && (
              <Hint>One loss eliminates a player. Winners advance until one champion remains.</Hint>
            )}
          </div>
        )}

        {format === 'double_elimination' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <FormatOptionCheckbox
                checked={deSplitLosersBracket}
                onChange={(enabled) => onDeSplitLosersBracketChange?.(enabled)}
                label="Split participants"
                description="Start with half of the participants in the losers bracket."
                lockFormat={lockFormat}
                name={fieldNames.deSplitLosersBracket ?? 'deSplitLosersBracket'}
              />
              <FormatOptionCheckbox
                checked={deBreakTiesPlacement}
                onChange={(enabled) => onDeBreakTiesPlacementChange?.(enabled)}
                label="Break ties with placement matches"
                lockFormat={lockFormat}
                name={fieldNames.deBreakTiesPlacement ?? 'deBreakTiesPlacement'}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Grand finals</FieldLabel>
              <p className="text-xs text-slate-500">
                Winners bracket finalist must be defeated twice by the losers bracket finalist
                (default), unless you choose a single match or skip grand finals.
              </p>
              {GRAND_FINALS_OPTIONS.map((opt) => {
                const selected = grandFinalsModifier === opt.value;
                const shortLabel =
                  opt.value === 'default'
                    ? '1–2 matches'
                    : opt.value === 'single_match'
                      ? '1 match'
                      : 'None';
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                      selected
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={lockFormat ? undefined : fieldNames.grandFinalsModifier ?? 'grandFinalsModifier'}
                      value={opt.value}
                      checked={selected}
                      onChange={(e) => onGrandFinalsModifierChange(e.target.value)}
                      disabled={lockFormat}
                      className="mt-1 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="text-sm font-medium text-slate-200">{shortLabel}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {format === 'swiss' && (
          <div className="space-y-2">
            <FieldLabel>Swiss scoring</FieldLabel>
            <SwissScoringInputs
              values={swissScoring}
              onChange={(key, value) => onSwissScoringChange?.(key, value)}
              lockFormat={lockFormat}
              fieldNames={fieldNames}
            />
            <Hint>Pairings update each round based on record. Adjust points to match your house rules.</Hint>
          </div>
        )}
      </StagePanel>
    </div>
  );
}
