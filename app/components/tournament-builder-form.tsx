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
import { GAME_TYPE_OPTIONS, GRAND_FINALS_OPTIONS } from '@/lib/tournament-options';

export type TournamentBuilderFields = {
  name: string;
  description: string;
  gameType: string;
  format: string;
  groupStageEnabled: boolean;
  groupSize: string;
  advancePerGroup: string;
  grandFinalsModifier: string;
  entryFee: string;
  prizePool: string;
  playerCap: string;
  isRanked: boolean;
};

type FieldUpdater = <K extends keyof TournamentBuilderFields>(
  key: K,
  value: TournamentBuilderFields[K],
) => void;

export function TournamentBuilderForm({
  fields,
  update,
  lockFormat = false,
  imageUploadEnabled = false,
  onGenerateDescription,
  canGenerateDescription = false,
}: {
  fields: TournamentBuilderFields;
  update: FieldUpdater;
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
              value={fields.playerCap}
              onChange={(e) => update('playerCap', e.target.value)}
              placeholder="Unlimited"
              className="input pl-9"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">Leave blank for no limit.</p>
        </div>

        <div>
          <FieldLabel>Ranked or unranked</FieldLabel>
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
          </>
        )}
        <div className={`grid min-w-0 gap-2 md:grid-cols-2 ${lockFormat ? 'pointer-events-none opacity-60' : ''}`}>
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
                    const next = e.target.value;
                    update('format', next);
                    if (next !== 'double_elimination' && fields.groupStageEnabled) {
                      update('groupStageEnabled', false);
                    }
                  }}
                  disabled={lockFormat}
                  className="sr-only"
                />
                <SelectionCard selected={selected} icon={Icon} label={label} description={desc} disabled={lockFormat} />
              </label>
            );
          })}
        </div>

        {fields.format === 'double_elimination' && (
          <div
            className={`space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 ${
              lockFormat ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Double elimination options
            </p>

            <label
              className={`flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition ${
                lockFormat ? '' : 'cursor-pointer hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                name={lockFormat ? undefined : 'groupStageEnabled'}
                checked={fields.groupStageEnabled}
                onChange={(e) => update('groupStageEnabled', e.target.checked)}
                disabled={lockFormat}
                className="mt-0.5 rounded border-slate-600"
              />
              <span>
                <span className="block text-sm font-medium text-slate-200">
                  Two-stage: Group stage → playoffs
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Round robin groups first, then top players advance to double elimination.
                </span>
              </span>
            </label>

            {fields.groupStageEnabled && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="groupSize">Group size</FieldLabel>
                  <select
                    id="groupSize"
                    name={lockFormat ? undefined : 'groupSize'}
                    value={fields.groupSize}
                    onChange={(e) => update('groupSize', e.target.value)}
                    disabled={lockFormat}
                    className="select mt-2"
                  >
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="advancePerGroup">Advance per group</FieldLabel>
                  <select
                    id="advancePerGroup"
                    name={lockFormat ? undefined : 'advancePerGroup'}
                    value={fields.advancePerGroup}
                    onChange={(e) => update('advancePerGroup', e.target.value)}
                    disabled={lockFormat}
                    className="select mt-2"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <FieldLabel>Grand finals</FieldLabel>
              {GRAND_FINALS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                    fields.grandFinalsModifier === opt.value
                      ? 'border-brand-500/50 bg-brand-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  } ${lockFormat ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name={lockFormat ? undefined : 'grandFinalsModifier'}
                    value={opt.value}
                    checked={fields.grandFinalsModifier === opt.value}
                    onChange={(e) => update('grandFinalsModifier', e.target.value)}
                    disabled={lockFormat}
                    className="mt-1 shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-200">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
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
  groupSize?: string;
  advancePerGroup?: string;
  entryFee?: string;
  prizePool?: string;
  playerCap?: string;
  isRanked?: boolean;
  gameType?: string;
}): TournamentBuilderFields {
  return {
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    gameType: initial?.gameType ?? 'beyblade_x',
    format: initial?.format ?? 'single_elimination',
    groupStageEnabled: initial?.groupStageEnabled ?? false,
    groupSize: initial?.groupSize ?? '4',
    advancePerGroup: initial?.advancePerGroup ?? '2',
    grandFinalsModifier: initial?.grandFinalsModifier ?? 'default',
    entryFee: initial?.entryFee ?? '',
    prizePool: initial?.prizePool ?? '',
    playerCap: initial?.playerCap ?? '',
    isRanked: initial?.isRanked ?? true,
  };
}
