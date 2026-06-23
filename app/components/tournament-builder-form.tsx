'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  DollarSign,
  Medal,
  Settings2,
  Shield,
  Trophy,
  Users,
  Gift,
  MapPin,
} from 'lucide-react';
import { TournamentDescriptionEditor } from '@/app/components/tournament-description-editor';
import { GAME_TYPE_OPTIONS, GRAND_FINALS_OPTIONS } from '@/lib/tournament-options';

const FORMAT_OPTIONS = [
  { value: 'single_elimination', label: 'Single Elimination' },
  { value: 'double_elimination', label: 'Double Elimination' },
  { value: 'swiss', label: 'Swiss Format' },
  { value: 'round_robin', label: 'Round Robin' },
] as const;

const RANKING_OPTIONS = [
  { value: 'true', label: 'Ranked' },
  { value: 'false', label: 'Unranked' },
] as const;

type AdvancedTab = 'bracket' | 'permissions' | 'notifications' | 'misc';

export type TournamentBuilderFields = {
  name: string;
  description: string;
  gameType: string;
  stageType: 'single' | 'two';
  format: string;
  groupStageEnabled: boolean;
  groupSize: string;
  advancePerGroup: string;
  grandFinalsModifier: string;
  registrationFeeType: 'free' | 'paid';
  entryFee: string;
  prizePool: string;
  hasPlayerCap: boolean;
  playerCap: string;
  isRanked: boolean;
  date: string;
  checkInTime: string;
  eventStartTime: string;
  location: string;
  requireCheckIn: boolean;
};

type FieldUpdater = <K extends keyof TournamentBuilderFields>(
  key: K,
  value: TournamentBuilderFields[K],
) => void;

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300">
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{children}</p>;
}

function LabsBadge() {
  return (
    <span className="rounded border border-orange-500/45 bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
      Labs
    </span>
  );
}

function DisabledLabsRow({ label, hint }: { label: string; hint?: string }) {
  return (
    <label className="flex cursor-not-allowed items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-900/30 p-3 opacity-60">
      <input type="checkbox" disabled className="mt-0.5 rounded border-slate-700" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">{label}</span>
          <LabsBadge />
        </span>
        {hint && <span className="mt-1 block text-xs text-slate-600">{hint}</span>}
      </span>
    </label>
  );
}

function SegmentedControl<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              selected
                ? 'border-brand-500/50 bg-brand-500/15 text-brand-200'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

function AdvancedTabs({
  format,
  lockFormat,
  fields,
  update,
}: {
  format: string;
  lockFormat?: boolean;
  fields: TournamentBuilderFields;
  update: FieldUpdater;
}) {
  const [tab, setTab] = useState<AdvancedTab>('bracket');

  const tabs: { id: AdvancedTab; label: string; icon: typeof Trophy }[] = [
    { id: 'bracket', label: 'Bracket', icon: Trophy },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'misc', label: 'Misc', icon: Settings2 },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-white">Advanced Options</h3>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900/40 p-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              tab === id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        {tab === 'bracket' && (
          <fieldset disabled={lockFormat} className={lockFormat ? 'opacity-60' : undefined}>
            {format === 'double_elimination' && (
              <div className="space-y-3">
                <FieldLabel>Grand finals</FieldLabel>
                {GRAND_FINALS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                      fields.grandFinalsModifier === opt.value
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="grandFinalsModifier"
                      value={opt.value}
                      checked={fields.grandFinalsModifier === opt.value}
                      onChange={(e) => update('grandFinalsModifier', e.target.value)}
                      className="mt-1 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-200">{opt.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <DisabledLabsRow label="Break ties with placement matches" />
              <DisabledLabsRow label="Show customizable round labels" />
              <DisabledLabsRow label="Hide the seed numbers" />
              <DisabledLabsRow label="Hide the bracket preview from the public" />
              <DisabledLabsRow label="Quick advance — report winners only, not scores" />
              <DisabledLabsRow label="Allow match attachments" />
            </div>
          </fieldset>
        )}
        {tab === 'permissions' && (
          <p className="text-sm text-slate-500">
            Host permissions and co-organizer access are coming soon in Labs.
          </p>
        )}
        {tab === 'notifications' && (
          <p className="text-sm text-slate-500">
            Match and registration email notifications will be configurable here soon.
          </p>
        )}
        {tab === 'misc' && (
          <div className="space-y-2">
            <DisabledLabsRow label="Enable Custom Fields" />
            <DisabledLabsRow label="Allow custom fields in Predictions" hint="Only works if predictions are activated." />
          </div>
        )}
      </div>
    </section>
  );
}

export function TournamentBuilderForm({
  mode,
  fields,
  update,
  lockFormat = false,
  imageUploadEnabled = false,
  timezoneHint,
  onGenerateDescription,
  canGenerateDescription = false,
  templateName,
  onTemplateNameChange,
}: {
  mode: 'tournament' | 'template';
  fields: TournamentBuilderFields;
  update: FieldUpdater;
  lockFormat?: boolean;
  imageUploadEnabled?: boolean;
  timezoneHint?: string;
  onGenerateDescription?: () => void;
  canGenerateDescription?: boolean;
  templateName?: string;
  onTemplateNameChange?: (value: string) => void;
}) {
  const showEventSchedule = mode === 'tournament';

  function setStageType(stageType: 'single' | 'two') {
    update('stageType', stageType);
    update('groupStageEnabled', stageType === 'two');
  }

  function setRegistrationFeeType(registrationFeeType: 'free' | 'paid') {
    update('registrationFeeType', registrationFeeType);
    if (registrationFeeType === 'free') update('entryFee', '');
  }

  return (
    <div className="space-y-5">
      {mode === 'template' && (
        <SectionCard title="Template Details">
          <div>
            <FieldLabel htmlFor="template-name">Name</FieldLabel>
            <input
              id="template-name"
              name="name"
              type="text"
              required
              value={templateName ?? fields.name}
              onChange={(e) => {
                onTemplateNameChange?.(e.target.value);
                update('name', e.target.value);
              }}
              placeholder="My Swiss Night Template"
              className="input mt-2"
            />
            <FieldHint>How this template appears in your library.</FieldHint>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Tournament Basic Info">
        {mode === 'tournament' && (
          <div>
            <FieldLabel htmlFor="tournament-name">Name</FieldLabel>
            <input
              id="tournament-name"
              name="name"
              type="text"
              required
              value={fields.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Storm Clash II"
              className="input mt-2"
            />
          </div>
        )}
        <div>
          <FieldLabel>Description</FieldLabel>
          <div className="mt-2">
            <TournamentDescriptionEditor
              value={fields.description}
              onChange={(v) => update('description', v)}
              uploadEnabled={imageUploadEnabled}
              onGenerate={onGenerateDescription}
              canGenerate={canGenerateDescription}
              placeholder="Tell players what to expect — venue, schedule, prizes, house rules…"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Tournament Game Info">
        <div>
          <FieldLabel>Game</FieldLabel>
          <select
            name="gameType"
            value={fields.gameType}
            onChange={(e) => update('gameType', e.target.value)}
            className="select mt-2 max-w-md"
          >
            {GAME_TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldHint>
            Putting a game allows your tournament to be discovered easier. Didn&apos;t find your game?
            Use the closest match or describe it in the description.
          </FieldHint>
        </div>

        <div>
          <FieldLabel>Type</FieldLabel>
          <div className="mt-2 space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 p-3 transition hover:border-slate-700">
              <input
                type="radio"
                name="stageType"
                checked={fields.stageType === 'single'}
                onChange={() => setStageType('single')}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-white">Single Stage Tournament</span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                fields.format !== 'double_elimination' ? 'opacity-50' : 'hover:border-slate-700'
              } border-slate-800`}
            >
              <input
                type="radio"
                name="stageType"
                checked={fields.stageType === 'two'}
                onChange={() => setStageType('two')}
                disabled={fields.format !== 'double_elimination'}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-white">Two Stage Tournament</span>
                <span className="mt-1 block text-xs text-slate-500">
                  Groups compete separately, winners proceed to a final stage (e.g. World Cup). Available
                  for double elimination.
                </span>
              </span>
            </label>
          </div>
          {fields.stageType === 'two' && (
            <>
              <input type="hidden" name="groupStageEnabled" value="on" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="groupSize">Group size</FieldLabel>
                  <select
                    id="groupSize"
                    name="groupSize"
                    value={fields.groupSize}
                    onChange={(e) => update('groupSize', e.target.value)}
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
                    name="advancePerGroup"
                    value={fields.advancePerGroup}
                    onChange={(e) => update('advancePerGroup', e.target.value)}
                    className="select mt-2"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          <FieldLabel>Format</FieldLabel>
          <fieldset disabled={lockFormat} className={`mt-2 ${lockFormat ? 'opacity-60' : ''}`}>
            <select
              name="format"
              value={fields.format}
              onChange={(e) => {
                const next = e.target.value;
                update('format', next);
                if (next !== 'double_elimination' && fields.stageType === 'two') {
                  setStageType('single');
                }
              }}
              className="select max-w-md"
            >
              {FORMAT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {lockFormat && (
              <FieldHint>Format is locked after the bracket has been generated.</FieldHint>
            )}
          </fieldset>
        </div>
      </SectionCard>

      <SectionCard title="Tournament Registration">
        <div>
          <FieldLabel>Registration</FieldLabel>
          <p className="mt-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-300">
            Host a sign-up page — players register on UGNCBBX and you manage the roster from your
            dashboard.
          </p>
        </div>

        <div>
          <FieldLabel>Registration fee</FieldLabel>
          <div className="mt-2">
            <SegmentedControl
              name="registrationFeeType"
              value={fields.registrationFeeType}
              options={[
                { value: 'free', label: 'Free' },
                { value: 'paid', label: 'Paid' },
              ]}
              onChange={setRegistrationFeeType}
            />
          </div>
          {fields.registrationFeeType === 'paid' && (
            <div className="relative mt-3 max-w-xs">
              <DollarSign
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                name="entryFee"
                type="text"
                value={fields.entryFee}
                onChange={(e) => update('entryFee', e.target.value)}
                placeholder="10"
                className="input pl-9"
              />
            </div>
          )}
          {fields.registrationFeeType === 'free' && <input type="hidden" name="entryFee" value="" />}
        </div>

        <div>
          <FieldLabel htmlFor="prize-pool">Prize pool</FieldLabel>
          <div className="relative mt-2 max-w-md">
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

        <div>
          <FieldLabel>Ranking</FieldLabel>
          <div className="mt-2">
            <SegmentedControl
              name="isRanked"
              value={fields.isRanked ? 'true' : 'false'}
              options={[...RANKING_OPTIONS]}
              onChange={(v) => update('isRanked', v === 'true')}
            />
          </div>
        </div>

        <div className="space-y-3">
          <DisabledLabsRow
            label="Require participants to register as a team"
            hint="When checked, team captains register and invite members."
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 p-3 transition hover:border-slate-700">
            <input
              type="checkbox"
              checked={fields.hasPlayerCap}
              onChange={(e) => {
                update('hasPlayerCap', e.target.checked);
                if (!e.target.checked) update('playerCap', '');
              }}
              className="mt-0.5 rounded border-slate-600"
            />
            <span className="text-sm text-slate-300">Specify a maximum number of participants</span>
          </label>
          {fields.hasPlayerCap && (
            <div className="relative max-w-xs pl-7">
              <Users
                size={15}
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                name="playerCap"
                type="number"
                min={2}
                value={fields.playerCap}
                onChange={(e) => update('playerCap', e.target.value)}
                placeholder="32"
                className="input"
              />
            </div>
          )}
          {!fields.hasPlayerCap && <input type="hidden" name="playerCap" value="" />}
        </div>

        {showEventSchedule && (
          <>
            <div>
              <FieldLabel>Start Time</FieldLabel>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <Calendar
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      name="date"
                      type="date"
                      required
                      value={fields.date}
                      onChange={(e) => update('date', e.target.value)}
                      className="input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <MapPin
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      name="location"
                      type="text"
                      value={fields.location}
                      onChange={(e) => update('location', e.target.value)}
                      placeholder="Charlotte, NC"
                      className="input pl-9"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Clock
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    name="checkInTime"
                    type="time"
                    value={fields.checkInTime}
                    onChange={(e) => update('checkInTime', e.target.value)}
                    className="input pl-9"
                    placeholder="Check-in"
                  />
                </div>
                <div className="relative">
                  <Clock
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    name="eventStartTime"
                    type="time"
                    value={fields.eventStartTime}
                    onChange={(e) => update('eventStartTime', e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>
              {timezoneHint && (
                <FieldHint>
                  {timezoneHint} —{' '}
                  <Link href="/profile" className="text-brand-400 hover:text-brand-300">
                    set time zone in account settings
                  </Link>
                </FieldHint>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 p-3 transition hover:border-slate-700">
              <input
                type="checkbox"
                checked={fields.requireCheckIn}
                onChange={(e) => update('requireCheckIn', e.target.checked)}
                className="mt-0.5 rounded border-slate-600"
              />
              <span className="text-sm text-slate-300">Require participants to check in</span>
            </label>
          </>
        )}

        <div className="space-y-2 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Experimental Features
            </span>
            <LabsBadge />
          </div>
          <DisabledLabsRow
            label="Require participants to have verified emails before joining"
            hint="Only available for open registration tournaments."
          />
          <DisabledLabsRow label="Allow specific countries for your registration?" />
        </div>
      </SectionCard>

      <AdvancedTabs format={fields.format} lockFormat={lockFormat} fields={fields} update={update} />
    </div>
  );
}

export function buildFieldsFromTournamentInitial(initial?: {
  name?: string;
  description?: string;
  date?: string;
  checkInTime?: string;
  eventStartTime?: string;
  location?: string;
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
  const entryFee = initial?.entryFee ?? '';
  const playerCap = initial?.playerCap ?? '';
  const groupStageEnabled = initial?.groupStageEnabled ?? false;

  return {
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    gameType: initial?.gameType ?? 'beyblade_x',
    stageType: groupStageEnabled ? 'two' : 'single',
    format: initial?.format ?? 'single_elimination',
    groupStageEnabled,
    groupSize: initial?.groupSize ?? '4',
    advancePerGroup: initial?.advancePerGroup ?? '2',
    grandFinalsModifier: initial?.grandFinalsModifier ?? 'default',
    registrationFeeType: entryFee.trim() ? 'paid' : 'free',
    entryFee,
    prizePool: initial?.prizePool ?? '',
    hasPlayerCap: Boolean(playerCap.trim()),
    playerCap,
    isRanked: initial?.isRanked ?? true,
    date: initial?.date ?? '',
    checkInTime: initial?.checkInTime ?? '',
    eventStartTime: initial?.eventStartTime ?? '',
    location: initial?.location ?? '',
    requireCheckIn: Boolean(initial?.checkInTime),
  };
}
