'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Layers,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { createTournament } from '@/app/actions/tournaments';
import { generateTournamentDescription } from '@/lib/tournament-description';
import { GRAND_FINALS_OPTIONS } from '@/lib/tournament-options';

const FORMAT_OPTIONS = [
  {
    value: 'single_elimination',
    label: 'Single Elimination',
    description: 'Win to advance. One loss ends your run.',
    icon: Trophy,
  },
  {
    value: 'double_elimination',
    label: 'Double Elimination',
    description: 'Losers bracket gives everyone a second chance.',
    icon: Layers,
  },
  {
    value: 'swiss',
    label: 'Swiss Format',
    description: 'Players are re-paired each round by record.',
    icon: Users,
  },
  {
    value: 'round_robin',
    label: 'Round Robin',
    description: 'Every player faces everyone in the pool.',
    icon: RefreshCw,
  },
] as const;

const FORMAT_LABELS: Record<string, string> = Object.fromEntries(
  FORMAT_OPTIONS.map((o) => [o.value, o.label]),
);

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card min-w-0 overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-900/50 px-5 py-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </label>
  );
}

function TournamentPreview({
  name,
  date,
  location,
  format,
  description,
}: {
  name: string;
  date: string;
  location: string;
  format: string;
  description: string;
}) {
  const displayName = name.trim() || 'Tournament name';
  const displayDate = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Pick a date';

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-800 bg-gradient-to-br from-brand-500/10 to-transparent px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Preview</p>
      </div>
      <div className="p-4">
        <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
          Open
        </span>
        <h4 className="mt-3 text-base font-semibold text-white">{displayName}</h4>
        <div className="mt-3 space-y-2 text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <Calendar size={13} className="shrink-0 text-slate-500" />
            {displayDate}
          </p>
          {location.trim() && (
            <p className="flex items-center gap-2">
              <MapPin size={13} className="shrink-0 text-slate-500" />
              {location.trim()}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Trophy size={13} className="shrink-0 text-slate-500" />
            {FORMAT_LABELS[format] ?? format}
          </p>
        </div>
        {description.trim() && (
          <p className="mt-4 line-clamp-4 text-xs leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

export function CreateTournamentForm() {
  const [state, action, pending] = useActionState(createTournament, null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [format, setFormat] = useState('single_elimination');
  const [groupStageEnabled, setGroupStageEnabled] = useState(false);
  const [grandFinalsModifier, setGrandFinalsModifier] = useState('default');
  const [description, setDescription] = useState('');

  function handleGenerateDescription() {
    setDescription(
      generateTournamentDescription({
        name,
        date,
        location,
        format,
      }),
    );
  }

  const canGenerate = name.trim().length > 0 && date.length > 0;

  return (
    <div className="w-full min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start xl:gap-8">
      <form action={action} className="min-w-0 space-y-5">
        {state?.error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <FormSection title="Event details" description="Name, date, and where you're hosting.">
          <div>
            <FieldLabel htmlFor="tournament-name">Name *</FieldLabel>
            <input
              id="tournament-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Storm Clash II"
              className="input mt-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="tournament-date">Date *</FieldLabel>
              <div className="relative mt-2">
                <Calendar
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="tournament-date"
                  name="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="tournament-location">Location</FieldLabel>
              <div className="relative mt-2">
                <MapPin
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="tournament-location"
                  name="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Charlotte, NC"
                  className="input pl-9"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Format" description="Choose how matches and advancement work.">
          <div className="grid min-w-0 gap-2 md:grid-cols-2">
            {FORMAT_OPTIONS.map(({ value, label, description: desc, icon: Icon }) => {
              const selected = format === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
                    selected
                      ? 'border-brand-500/60 bg-brand-500/10 ring-1 ring-brand-500/30'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={value}
                    checked={selected}
                    onChange={(e) => setFormat(e.target.value)}
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
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{desc}</span>
                  </span>
                </label>
              );
            })}
          </div>

          {format === 'double_elimination' && (
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Double elimination options
              </p>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition hover:border-slate-700">
                <input
                  type="checkbox"
                  name="groupStageEnabled"
                  checked={groupStageEnabled}
                  onChange={(e) => setGroupStageEnabled(e.target.checked)}
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

              {groupStageEnabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="groupSize">Group size</FieldLabel>
                    <select id="groupSize" name="groupSize" defaultValue={4} className="select mt-2">
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
                      defaultValue={2}
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
                {GRAND_FINALS_OPTIONS.map((opt) => {
                  const selected = grandFinalsModifier === opt.value;
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
                        name="grandFinalsModifier"
                        value={opt.value}
                        checked={selected}
                        onChange={(e) => setGrandFinalsModifier(e.target.value)}
                        className="mt-1 shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-200">{opt.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </FormSection>

        <FormSection title="Description" description="Shown on the public tournament page.">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={!canGenerate}
              title={canGenerate ? 'Generate description from form details' : 'Enter a name and date first'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-300 transition hover:border-brand-400/40 hover:bg-brand-500/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles size={13} />
              Generate
            </button>
          </div>
          <textarea
            id="tournament-description"
            name="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell players what to expect — venue, schedule, prizes, house rules…"
            className="textarea"
          />
        </FormSection>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/dashboard/tournaments" className="btn-secondary text-center">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating…
              </span>
            ) : (
              'Create tournament'
            )}
          </button>
        </div>
      </form>

      <aside className="hidden min-w-0 xl:block">
        <div className="sticky top-24 space-y-3">
          <TournamentPreview
            name={name}
            date={date}
            location={location}
            format={format}
            description={description}
          />
          <p className="px-1 text-[11px] leading-relaxed text-slate-600">
            Updates as you fill in the form. Status starts as Open until you generate a bracket.
          </p>
        </div>
      </aside>
    </div>
  );
}
