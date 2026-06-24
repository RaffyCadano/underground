'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Clock,
  DollarSign,
  Gamepad2,
  Gift,
  Layers,
  Loader2,
  MapPin,
  Medal,
  RefreshCw,
  Trophy,
  Users,
  X,
  ArrowRight,
} from 'lucide-react';
import { createTournament, updateTournament } from '@/app/actions/tournaments';
import type { TournamentFormInitial } from '@/lib/tournament-form';
import { TournamentDescriptionContent } from '@/app/components/tournament-description-content';
import { TournamentDescriptionEditor } from '@/app/components/tournament-description-editor';
import { generateTournamentDescription } from '@/lib/tournament-description';
import { GAME_TYPE_OPTIONS, GRAND_FINALS_OPTIONS, parseRoundRobinRankBy, type RoundRobinRankBy } from '@/lib/tournament-options';
import { TournamentFormatStages, TournamentStageTypeSelector, type TournamentStageType } from '@/app/components/tournament-format-stages';
import { formatEventTime, formatScheduleLine } from '@/lib/tournament-schedule';
import { formatUsdDisplay } from '@/lib/money';
import {
  DEFAULT_SWISS_SCORING_FORM,
  type SwissScoringFormFields,
} from '@/lib/swiss-scoring';
import { TournamentUrlField } from '@/app/components/tournament-url-field';
import { generateTournamentSlug } from '@/lib/tournament-slug';

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

const GAME_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  GAME_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

const RANKING_OPTIONS = [
  {
    value: 'true',
    label: 'Ranked',
    description: 'Match wins award UGNCBBX rank points.',
    icon: Medal,
  },
  {
    value: 'false',
    label: 'Unranked',
    description: 'Casual or local event — no rank point changes.',
    icon: Users,
  },
] as const;

function FormSection({
  title,
  description,
  children,
  flush = false,
  grouped = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  flush?: boolean;
  grouped?: boolean;
}) {
  const content = (
    <>
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {flush ? <div className="p-4">{children}</div> : <div className="space-y-3 p-4">{children}</div>}
    </>
  );

  if (grouped) {
    return <div className="min-w-0">{content}</div>;
  }

  return <div className="card min-w-0 overflow-hidden">{content}</div>;
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
  checkInTime,
  eventStartTime,
  format,
  description,
  entryFee,
  prizePool,
  playerCap,
  isRanked,
  gameType,
}: {
  name: string;
  date: string;
  location: string;
  checkInTime: string;
  eventStartTime: string;
  format: string;
  description: string;
  entryFee: string;
  prizePool: string;
  playerCap: string;
  isRanked: boolean;
  gameType: string;
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
  const checkInLabel = formatScheduleLine('Check-In Open', checkInTime);
  const eventStartLabel = formatScheduleLine('Event Start', eventStartTime);

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
          {(checkInLabel || eventStartLabel) && (
            <p className="flex items-start gap-2">
              <Clock size={13} className="mt-0.5 shrink-0 text-slate-500" />
              <span className="space-y-0.5">
                {checkInLabel && <span className="block">{checkInLabel}</span>}
                {eventStartLabel && <span className="block">{eventStartLabel}</span>}
              </span>
            </p>
          )}
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
          <p className="flex items-center gap-2">
            <Gamepad2 size={13} className="shrink-0 text-slate-500" />
            {GAME_TYPE_LABELS[gameType] ?? gameType}
          </p>
          <p className="flex items-center gap-2">
            <Medal size={13} className="shrink-0 text-slate-500" />
            {isRanked ? 'Ranked event' : 'Unranked event'}
          </p>
          {(entryFee.trim() || prizePool.trim()) && (
            <p className="flex items-start gap-2">
              <Gift size={13} className="mt-0.5 shrink-0 text-slate-500" />
              <span>
                {entryFee.trim() && <>Entry: {entryFee.trim()}</>}
                {entryFee.trim() && prizePool.trim() && ' · '}
                {prizePool.trim() && <>Prize: {prizePool.trim()}</>}
              </span>
            </p>
          )}
          {playerCap.trim() && (
            <p className="flex items-center gap-2">
              <Users size={13} className="shrink-0 text-slate-500" />
              {playerCap.trim()} player cap
            </p>
          )}
        </div>
        {description.trim() && (
          <div className="mt-4">
            <TournamentDescriptionContent content={description} compact />
          </div>
        )}
      </div>
    </div>
  );
}

function formatConfirmDate(date: string) {
  if (!date) return '—';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function ConfirmSummaryRow({
  icon: Icon,
  children,
}: {
  icon: typeof Calendar;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="mt-0.5 shrink-0 text-brand-400/80" />
      <span className="min-w-0 text-sm leading-relaxed text-slate-300">{children}</span>
    </div>
  );
}

function CreateTournamentConfirmModal({
  open,
  onClose,
  onConfirm,
  mode,
  name,
  date,
  location,
  checkInTime,
  eventStartTime,
  format,
  groupStageEnabled,
  groupSize,
  advancePerGroup,
  grandFinalsModifier,
  entryFee,
  prizePool,
  playerCap,
  isRanked,
  gameType,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: 'create' | 'edit';
  name: string;
  date: string;
  location: string;
  checkInTime: string;
  eventStartTime: string;
  format: string;
  groupStageEnabled: boolean;
  groupSize: string;
  advancePerGroup: string;
  grandFinalsModifier: string;
  entryFee: string;
  prizePool: string;
  playerCap: string;
  isRanked: boolean;
  gameType: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const gfLabel = GRAND_FINALS_OPTIONS.find((o) => o.value === grandFinalsModifier)?.label;
  const isEdit = mode === 'edit';
  const displayName = name.trim() || 'Untitled';
  const checkIn = formatEventTime(checkInTime);
  const eventStart = formatEventTime(eventStartTime);

  const whenParts = [formatConfirmDate(date), location.trim()].filter(Boolean);
  const timeParts = [
    checkIn && `Check-in ${checkIn}`,
    eventStart && `Start ${eventStart}`,
  ].filter(Boolean);
  const registrationParts = [
    entryFee.trim() ? `${formatUsdDisplay(entryFee)} entry` : 'Free entry',
    playerCap.trim() ? `${playerCap} player cap` : null,
    prizePool.trim() ? `Prize ${formatUsdDisplay(prizePool)}` : null,
  ].filter(Boolean);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-tournament-confirm-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-brand-500/20 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

        <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-400">
              <Trophy size={18} />
            </span>
            <h2 id="create-tournament-confirm-title" className="text-lg font-semibold text-white">
              {isEdit ? 'Save changes?' : 'Create tournament?'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-brand-500/[0.07] via-slate-900/80 to-slate-950">
            <div className="border-b border-slate-800/80 px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Event</p>
              <p className="mt-1 break-words text-base font-semibold leading-snug text-white">
                {displayName}
              </p>
            </div>

            <div className="space-y-2.5 px-4 py-3.5">
              {whenParts.length > 0 && (
                <ConfirmSummaryRow icon={Calendar}>{whenParts.join(' · ')}</ConfirmSummaryRow>
              )}
              {timeParts.length > 0 && (
                <ConfirmSummaryRow icon={Clock}>{timeParts.join(' · ')}</ConfirmSummaryRow>
              )}

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  <Trophy size={10} className="text-slate-500" />
                  {FORMAT_LABELS[format] ?? format}
                </span>
                {groupStageEnabled && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    <Layers size={10} className="text-slate-500" />
                    Two stage
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  <Gamepad2 size={10} className="text-slate-500" />
                  {GAME_TYPE_LABELS[gameType] ?? gameType}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    isRanked
                      ? 'border-brand-500/35 bg-brand-500/10 text-brand-200'
                      : 'border-slate-700 bg-slate-900/80 text-slate-400'
                  }`}
                >
                  <Medal size={10} className={isRanked ? 'text-brand-400' : 'text-slate-500'} />
                  {isRanked ? 'Ranked' : 'Unranked'}
                </span>
              </div>

              {(groupStageEnabled || (format === 'double_elimination' && gfLabel)) && (
                <ConfirmSummaryRow icon={Layers}>
                  {[
                    groupStageEnabled &&
                      `Groups of ${groupSize}, top ${advancePerGroup} advance`,
                    format === 'double_elimination' && gfLabel,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </ConfirmSummaryRow>
              )}
            </div>

            {registrationParts.length > 0 && (
              <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 py-3">
                <ConfirmSummaryRow icon={DollarSign}>
                  {registrationParts.join(' · ')}
                </ConfirmSummaryRow>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-slate-800 bg-slate-950/90 px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            {isEdit ? 'Save changes' : 'Create tournament'}
            <ArrowRight size={15} className="opacity-80" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CreateTournamentLoadingModal({ message }: { message: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-tournament-loading-title"
      aria-busy="true"
    >
      <div className="card w-full max-w-sm p-8 text-center shadow-2xl shadow-black/40">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-400" aria-hidden="true" />
        <h2 id="create-tournament-loading-title" className="mt-4 text-lg font-semibold text-white">
          {message}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {message === 'Creating tournament' ? 'Setting up your event…' : 'Applying your updates…'}
        </p>
      </div>
    </div>,
    document.body,
  );
}

export function CreateTournamentForm({
  imageUploadEnabled = false,
  tournamentId,
  initial,
  lockFormat = false,
  cancelHref = '/dashboard/tournaments',
  permalinkPrefix,
}: {
  imageUploadEnabled?: boolean;
  tournamentId?: string;
  initial?: TournamentFormInitial;
  lockFormat?: boolean;
  cancelHref?: string;
  permalinkPrefix: string;
}) {
  const isEdit = Boolean(tournamentId);
  const [state, action, pending] = useActionState(
    isEdit ? updateTournament : createTournament,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? generateTournamentSlug());
  const [date, setDate] = useState(initial?.date ?? '');
  const [checkInTime, setCheckInTime] = useState(initial?.checkInTime ?? '');
  const [eventStartTime, setEventStartTime] = useState(initial?.eventStartTime ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [format, setFormat] = useState(initial?.format ?? 'single_elimination');
  const [groupStageEnabled, setGroupStageEnabled] = useState(initial?.groupStageEnabled ?? false);
  const [grandFinalsModifier, setGrandFinalsModifier] = useState(
    initial?.grandFinalsModifier ?? 'default',
  );
  const [deSplitLosersBracket, setDeSplitLosersBracket] = useState(
    initial?.deSplitLosersBracket ?? true,
  );
  const [deBreakTiesPlacement, setDeBreakTiesPlacement] = useState(
    initial?.deBreakTiesPlacement ?? true,
  );
  const [groupSize, setGroupSize] = useState(initial?.groupSize ?? '4');
  const [advancePerGroup, setAdvancePerGroup] = useState(initial?.advancePerGroup ?? '2');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [entryFee, setEntryFee] = useState(initial?.entryFee ?? '');
  const [prizePool, setPrizePool] = useState(initial?.prizePool ?? '');
  const [playerCap, setPlayerCap] = useState(initial?.playerCap ?? '');
  const [isRanked, setIsRanked] = useState(initial?.isRanked ?? true);
  const [gameType, setGameType] = useState(initial?.gameType ?? 'beyblade_x');
  const [swissScoring, setSwissScoring] = useState<SwissScoringFormFields>({
    swissPointsPerMatchWin: initial?.swissPointsPerMatchWin ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerMatchWin,
    swissPointsPerMatchTie: initial?.swissPointsPerMatchTie ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerMatchTie,
    swissPointsPerGameWin: initial?.swissPointsPerGameWin ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerGameWin,
    swissPointsPerGameTie: initial?.swissPointsPerGameTie ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerGameTie,
    swissPointsPerBye: initial?.swissPointsPerBye ?? DEFAULT_SWISS_SCORING_FORM.swissPointsPerBye,
  });
  const [roundRobinRankBy, setRoundRobinRankBy] = useState<RoundRobinRankBy>(
    initial?.roundRobinRankBy ?? 'match_wins',
  );

  function handleSwissScoringChange(key: keyof SwissScoringFormFields, value: string) {
    setSwissScoring((prev) => ({ ...prev, [key]: value }));
  }

  const stageType: TournamentStageType = groupStageEnabled ? 'two' : 'single';

  function handleStageTypeChange(type: TournamentStageType) {
    if (type === 'two') {
      setGroupStageEnabled(true);
    } else {
      setGroupStageEnabled(false);
    }
  }

  useEffect(() => {
    if (isSubmitting && !pending && state?.error) {
      setIsSubmitting(false);
    }
  }, [isSubmitting, pending, state?.error]);

  function handleSubmitClick() {
    if (!formRef.current?.reportValidity()) return;
    setShowConfirm(true);
  }

  function handleConfirmSubmit() {
    setShowConfirm(false);
    setIsSubmitting(true);
    formRef.current?.requestSubmit();
  }

  function handleGenerateDescription() {
    setDescription(
      generateTournamentDescription({
        name,
        date,
        location,
        checkInTime,
        eventStartTime,
        format,
        entryFee,
        prizePool,
        playerCap,
        isRanked,
        gameType,
      }),
    );
  }

  const canGenerate = name.trim().length > 0 && date.length > 0;

  return (
    <div className="w-full min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_240px] xl:items-start xl:gap-6">
      <form ref={formRef} action={action} className="min-w-0">
        {tournamentId && <input type="hidden" name="tournamentId" value={tournamentId} />}
        {state?.error && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <div className="card divide-y divide-slate-800 overflow-hidden">
        <FormSection grouped title="Event details" description="Name, date, schedule, and where you're hosting.">
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

        <TournamentUrlField
          value={slug}
          onChange={setSlug}
          permalinkPrefix={permalinkPrefix}
          excludeTournamentId={tournamentId}
          lockSlug={lockFormat}
        />

        <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="check-in-time">Check-in open</FieldLabel>
              <div className="relative mt-2">
                <Clock
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="check-in-time"
                  name="checkInTime"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="event-start-time">Event start</FieldLabel>
              <div className="relative mt-2">
                <Clock
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="event-start-time"
                  name="eventStartTime"
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
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
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
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
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
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
                value={playerCap}
                onChange={(e) => setPlayerCap(e.target.value)}
                placeholder="Unlimited"
                className="input pl-9"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Leave blank for no limit.</p>
          </div>

          <div>
            <FieldLabel>Ranked or unranked</FieldLabel>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {RANKING_OPTIONS.map(({ value, label, description: desc, icon: Icon }) => {
                const selected = (isRanked ? 'true' : 'false') === value;
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
                      name="isRanked"
                      value={value}
                      checked={selected}
                      onChange={() => setIsRanked(value === 'true')}
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
          </div>

          <div>
            <FieldLabel>Type of game</FieldLabel>
            <div className="mt-2 grid min-w-0 gap-2 md:grid-cols-2">
              {GAME_TYPE_OPTIONS.map(({ value, label, description: desc }) => {
                const selected = gameType === value;
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
                      name="gameType"
                      value={value}
                      checked={selected}
                      onChange={(e) => setGameType(e.target.value)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                        selected
                          ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                          : 'border-slate-700 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Gamepad2 size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </FormSection>

        <FormSection grouped title="Format" description="Choose how matches and advancement work.">
          {lockFormat && (
            <>
              <input type="hidden" name="format" value={format} />
              <input type="hidden" name="groupStageEnabled" value={groupStageEnabled ? 'on' : ''} />
              <input type="hidden" name="groupSize" value={groupSize} />
              <input type="hidden" name="advancePerGroup" value={advancePerGroup} />
              <input type="hidden" name="grandFinalsModifier" value={grandFinalsModifier} />
              <input type="hidden" name="swissPointsPerMatchWin" value={swissScoring.swissPointsPerMatchWin} />
              <input type="hidden" name="swissPointsPerMatchTie" value={swissScoring.swissPointsPerMatchTie} />
              <input type="hidden" name="swissPointsPerGameWin" value={swissScoring.swissPointsPerGameWin} />
              <input type="hidden" name="swissPointsPerGameTie" value={swissScoring.swissPointsPerGameTie} />
              <input type="hidden" name="swissPointsPerBye" value={swissScoring.swissPointsPerBye} />
              <input type="hidden" name="roundRobinRankBy" value={roundRobinRankBy} />
              <input type="hidden" name="deSplitLosersBracket" value={deSplitLosersBracket ? 'on' : ''} />
              <input type="hidden" name="deBreakTiesPlacement" value={deBreakTiesPlacement ? 'on' : ''} />
            </>
          )}

          <TournamentStageTypeSelector
            value={stageType}
            onChange={handleStageTypeChange}
            lockFormat={lockFormat}
          />

          <div className="mt-4">
            <FieldLabel>{stageType === 'two' ? 'Final stage format' : 'Bracket format'}</FieldLabel>
          <div className={`mt-2 grid min-w-0 gap-2 md:grid-cols-2 ${lockFormat ? 'pointer-events-none opacity-60' : ''}`}>
            {FORMAT_OPTIONS.map(({ value, label, description: desc, icon: Icon }) => {
              const selected = format === value;
              return (
                <label
                  key={value}
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
                    name={lockFormat ? undefined : 'format'}
                    value={value}
                    checked={selected}
                    onChange={(e) => {
                      if (lockFormat) return;
                      setFormat(e.target.value);
                    }}
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
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{desc}</span>
                  </span>
                </label>
              );
            })}
        </div>
          </div>

          <TournamentFormatStages
            format={format}
            groupStageEnabled={groupStageEnabled}
            onGroupStageEnabledChange={setGroupStageEnabled}
            groupSize={groupSize}
            onGroupSizeChange={setGroupSize}
            advancePerGroup={advancePerGroup}
            onAdvancePerGroupChange={setAdvancePerGroup}
            grandFinalsModifier={grandFinalsModifier}
            onGrandFinalsModifierChange={setGrandFinalsModifier}
            deSplitLosersBracket={deSplitLosersBracket}
            onDeSplitLosersBracketChange={setDeSplitLosersBracket}
            deBreakTiesPlacement={deBreakTiesPlacement}
            onDeBreakTiesPlacementChange={setDeBreakTiesPlacement}
            swissScoring={swissScoring}
            onSwissScoringChange={handleSwissScoringChange}
            roundRobinRankBy={roundRobinRankBy}
            onRoundRobinRankByChange={setRoundRobinRankBy}
            lockFormat={lockFormat}
            stageTypeControlled
          />
        </FormSection>

        <FormSection
          grouped
          title="Description"
          description="Shown on the public tournament page. Upload images or write text."
          flush
        >
          <TournamentDescriptionEditor
            value={description}
            onChange={setDescription}
            uploadEnabled={imageUploadEnabled}
            onGenerate={handleGenerateDescription}
            canGenerate={canGenerate}
            placeholder="Tell players what to expect — venue, schedule, prizes, house rules…"
          />
        </FormSection>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href={cancelHref} className="btn-secondary text-center">
            Cancel
          </Link>
        <button
            type="button"
            onClick={handleSubmitClick}
            disabled={pending || isSubmitting}
            className="btn-primary disabled:opacity-60"
          >
            {isEdit ? 'Save changes' : 'Create tournament'}
        </button>
        </div>
      </form>

      <CreateTournamentConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        mode={isEdit ? 'edit' : 'create'}
        name={name}
        date={date}
        location={location}
        checkInTime={checkInTime}
        eventStartTime={eventStartTime}
        format={format}
        groupStageEnabled={groupStageEnabled}
        groupSize={groupSize}
        advancePerGroup={advancePerGroup}
        grandFinalsModifier={grandFinalsModifier}
        entryFee={entryFee}
        prizePool={prizePool}
        playerCap={playerCap}
        isRanked={isRanked}
        gameType={gameType}
      />

      {isSubmitting && (
        <CreateTournamentLoadingModal message={isEdit ? 'Saving changes' : 'Creating tournament'} />
      )}

      <aside className="hidden min-w-0 xl:block">
        <div className="sticky top-24 space-y-2">
          <TournamentPreview
            name={name}
            date={date}
            location={location}
            checkInTime={checkInTime}
            eventStartTime={eventStartTime}
            format={format}
            description={description}
            entryFee={entryFee}
            prizePool={prizePool}
            playerCap={playerCap}
            isRanked={isRanked}
            gameType={gameType}
          />
          <p className="px-1 text-[11px] leading-relaxed text-slate-600">
            {isEdit
              ? 'Updates as you edit. Format cannot change after the bracket is generated.'
              : 'Updates as you fill in the form. Status starts as Open until you generate a bracket.'}
          </p>
        </div>
      </aside>
    </div>
  );
}
