'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowRight, BookmarkPlus, CheckCircle2, Loader2, RotateCcw, Swords, UserPlus, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { joinTournament, leaveTournament, generateBracket, generateNextSwissRound, generatePlayoffs, regenerateRound1, resetBracketForRegistration, completeTournament } from '@/app/actions/tournaments';
import { saveTournamentAsTemplate } from '@/app/actions/tournament-templates';
import { roundRobinRoundCount } from '@/lib/round-robin-schedule';
import { reportResult, correctScore } from '@/app/actions/matches';
import { MatchResultInlineForm } from './match-result-modal';
import { formatPlayerCapLabel, isTournamentFull } from '@/lib/tournament-registration';

type PendingAction = 'join' | 'leave' | 'generate' | 'generate-next' | 'playoffs' | 'reset-roster' | 'regenerate-round-1' | 'complete' | 'save-template' | 'report' | 'edit' | null;

type Player = { id: string; username: string } | null;

type Match = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide?: string;
  status: string;
  score: string | null;
  player1: Player;
  player2: Player;
  winner: Player;
};

const BRACKET_LABELS: Record<string, string> = {
  winners: 'WB',
  losers: 'LB',
  grand_final: 'GF',
  reset: 'Reset',
};

function matchLabel(m: Match, format: string) {
  const vs = `${m.player1?.username ?? 'TBD'} vs ${m.player2?.username ?? 'TBD'}`;
  if (format !== 'double_elimination' || !m.bracketSide) return vs;
  const tag = BRACKET_LABELS[m.bracketSide] ?? m.bracketSide;
  return `[${tag}] ${vs}`;
}

function getGenerateLabel(
  tournamentFormat: string,
  groupStageEnabled: boolean,
): string {
  if (groupStageEnabled) return 'Start group stage';
  if (tournamentFormat === 'swiss' || tournamentFormat === 'round_robin') return 'Generate Round 1';
  return 'Generate bracket';
}

function TournamentActionCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  buttonLabel,
  pendingLabel,
  onClick,
  disabled = false,
  isPending = false,
  tone = 'brand',
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  pendingLabel: string;
  onClick: () => void;
  disabled?: boolean;
  isPending?: boolean;
  tone?: 'brand' | 'admin';
}) {
  const panelClass =
    tone === 'admin'
      ? 'border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-slate-950/40 to-slate-950'
      : 'border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-slate-950/40 to-slate-950';
  const iconClass =
    tone === 'admin'
      ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
      : 'border-brand-500/30 bg-brand-500/10 text-brand-300';
  const buttonClass =
    tone === 'admin'
      ? 'border border-violet-500/40 bg-violet-500/15 text-violet-100 hover:border-violet-400/50 hover:bg-violet-500/25'
      : 'bg-brand-500 text-white hover:bg-brand-400';

  return (
    <div className={`overflow-hidden rounded-xl border p-4 ${panelClass}`}>
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          <p className="mt-1 text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isPending}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-60 ${buttonClass}`}
      >
        {isPending ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {pendingLabel}
          </>
        ) : (
          <>
            {buttonLabel}
            <ArrowRight size={15} className="opacity-80" />
          </>
        )}
      </button>
    </div>
  );
}

function SaveTemplateModal({
  open,
  onClose,
  onConfirm,
  isPending,
  error,
  defaultName,
  templateName,
  onTemplateNameChange,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: string;
  defaultName: string;
  templateName: string;
  onTemplateNameChange: (value: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-template-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-violet-500/20 bg-violet-500/5 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
                <BookmarkPlus size={20} />
              </span>
              <div>
                <h2 id="save-template-title" className="text-lg font-semibold text-white">
                  Save as template
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Reuse this format, fees, and rules when creating future tournaments.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300 disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="template-save-name" className="mb-1.5 block text-xs font-semibold text-slate-400">
              Template name
            </label>
            <input
              id="template-save-name"
              type="text"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              placeholder={defaultName}
              disabled={isPending}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 disabled:opacity-60"
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Saves format, game, ranking, fees, player cap, group stage, and double-elim settings — not
            date, location, or registered players.
          </p>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending || !templateName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <BookmarkPlus size={15} />
                Save template
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function GenerateBracketConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  error,
  tournamentFormat,
  participantCount,
  groupStageEnabled = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: string;
  tournamentFormat: string;
  participantCount: number;
  groupStageEnabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const isSwiss = tournamentFormat === 'swiss' || tournamentFormat === 'round_robin';
  const isGroupStage = groupStageEnabled;
  const title = isGroupStage
    ? 'Start group stage?'
    : isSwiss
      ? 'Generate round 1?'
      : 'Generate bracket?';
  const confirmLabel = isGroupStage
    ? 'Start group stage'
    : isSwiss
      ? 'Generate round 1'
      : 'Generate bracket';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-bracket-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-brand-500/20 bg-brand-500/5 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-400">
                <Swords size={20} />
              </span>
              <div>
                <h2 id="generate-bracket-title" className="text-lg font-semibold text-white">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Registration will close and the tournament will start.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Participants
            </p>
            <p className="mt-1 font-semibold text-white">
              {participantCount} registered
            </p>
          </div>

          <p className="mt-4 text-sm text-slate-400">This will:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
            {(isGroupStage
              ? [
                  'Assign players to round robin groups',
                  'Close registration for new players',
                  'Start the group stage — playoffs after groups finish',
                ]
              : isSwiss
                ? ['Pair round 1 matchups', 'Close registration for new players', 'Start the tournament']
                : [
                    'Seed all participants into the bracket',
                    'Close registration for new players',
                    'Start the tournament',
                  ]
            ).map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-brand-400/80" />
                {item}
              </li>
            ))}
          </ul>

          {participantCount < 2 && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              You need at least 2 participants to generate a bracket.
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 bg-slate-900/40 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-secondary w-full sm:w-auto disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending || participantCount < 2}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ResetRosterConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  error,
  participantCount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: string;
  participantCount: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-roster-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
                <RotateCcw size={20} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/80">
                  Late player / roster change
                </p>
                <h2 id="reset-roster-title" className="mt-1 text-lg font-semibold text-white">
                  Cancel bracket and edit roster?
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Reopens registration so you can remove no-shows and add walk-ins.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Current roster
            </p>
            <p className="mt-1 font-semibold text-white">{participantCount} registered</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">This will:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
              {[
                'Delete the current bracket (pairings and TBD slots)',
                'Reopen registration on the Bracket tab',
                'Let you add or remove players, then generate again',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/80" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-100/90">
              Only available before any match scores are reported. Once games have results, use score
              correction or continue the event as-is.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 bg-slate-900/40 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-secondary w-full sm:w-auto disabled:opacity-60"
          >
            Keep bracket
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500 disabled:opacity-60 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Resetting…
              </>
            ) : (
              <>
                <RotateCcw size={15} />
                Edit roster
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function RegenerateRound1ConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  error,
  tournamentFormat,
  currentRound,
  targetRound,
  participantCount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: string;
  tournamentFormat: string;
  currentRound: number;
  targetRound: number;
  participantCount: number;
}) {
  const [mounted, setMounted] = useState(false);
  const formatLabel = tournamentFormat === 'round_robin' ? 'round robin' : 'Swiss';
  const keepsEarlierRounds = tournamentFormat === 'round_robin' && targetRound > 1;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="regenerate-round-1-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
                <RotateCcw size={20} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300/80">
                  Bracket reset
                </p>
                <h2 id="regenerate-round-1-title" className="mt-1 text-lg font-semibold text-white">
                  Regenerate Round {targetRound}?
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {keepsEarlierRounds
                    ? `Clear round ${targetRound} and any later rounds, then build fresh Round ${targetRound} pairings. Earlier rounds stay as-is.`
                    : `Wipe all rounds and scores, then build fresh Round ${targetRound} pairings for this ${formatLabel} event.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Current state
            </p>
            <p className="mt-1 font-semibold text-white">
              {participantCount} players · Round {currentRound}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">This will:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
              {[
                keepsEarlierRounds
                  ? `Delete round ${targetRound} and all later matches and scores`
                  : 'Delete every match and reported score from all rounds',
                'Keep registration closed with the same roster',
                `Generate new Round ${targetRound} pairings immediately`,
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400/80" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-400" />
            <p className="text-xs leading-relaxed text-rose-100/90">
              This cannot be undone. Use &ldquo;Edit roster&rdquo; instead if you need to add or remove players.
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Regenerating…
              </>
            ) : (
              <>
                <RotateCcw size={15} />
                Regenerate Round {targetRound}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CompleteTournamentConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  error,
  pendingMatchCount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: string;
  pendingMatchCount: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-tournament-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/80">
                  End event
                </p>
                <h2 id="complete-tournament-title" className="mt-1 text-lg font-semibold text-white">
                  Mark tournament as finished?
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Closes the event and shows final standings. Match results stay as they are.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          {pendingMatchCount > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-100/90">
                {pendingMatchCount} match{pendingMatchCount !== 1 ? 'es' : ''} still pending. You can
                finish anyway — standings only include completed results.
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-slate-400">This will:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
              {[
                'Set the tournament status to Complete',
                'Show podium and final standings where results exist',
                'Prevent further bracket or roster changes',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Finishing…
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Mark as finished
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ActionSuccessNotice({
  action,
  tournamentFormat,
  currentRound,
  regeneratedRound,
  onDismiss,
}: {
  action: 'generate' | 'generate-next' | 'playoffs' | 'reset-roster' | 'regenerate-round-1' | 'complete';
  tournamentFormat: string;
  currentRound: number;
  regeneratedRound?: number;
  onDismiss: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(onDismiss, 6000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [mounted, onDismiss]);

  const copy = (() => {
    switch (action) {
      case 'generate':
        if (tournamentFormat === 'swiss' || tournamentFormat === 'round_robin') {
          return {
            title: 'Round 1 ready',
            body: 'Pairings are live and registration is closed.',
          };
        }
        return {
          title: 'Bracket generated',
          body: 'Matches are seeded and the tournament is now live.',
        };
      case 'generate-next':
        return {
          title: `Round ${currentRound + 1} ready`,
          body: 'New pairings have been added to the bracket.',
        };
      case 'playoffs':
        return {
          title: 'Playoffs started',
          body: 'Advancers are seeded into the elimination bracket.',
        };
      case 'reset-roster':
        return {
          title: 'Roster unlocked',
          body: 'Add or remove players on the Bracket tab, then generate again.',
        };
      case 'regenerate-round-1': {
        const round = regeneratedRound ?? 1;
        return {
          title: `Round ${round} regenerated`,
          body:
            round > 1
              ? `Round ${round} pairings were rebuilt. Earlier round results were kept.`
              : 'All previous rounds were cleared and new pairings are live.',
        };
      }
      case 'complete':
        return {
          title: 'Tournament finished',
          body: 'The event is marked complete. Final standings are now visible.',
        };
    }
  })();

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed bottom-4 left-4 z-[60] w-[min(100vw-2rem,22rem)] transition-all duration-300 sm:bottom-6 sm:left-6 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-950 shadow-2xl shadow-black/40">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="flex items-start gap-3 p-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
            <CheckCircle2 size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{copy.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{copy.body}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ActionLoadingModal({
  action,
  tournamentFormat,
  currentRound,
}: {
  action: Exclude<PendingAction, null>;
  tournamentFormat: string;
  currentRound: number;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const copy = (() => {
    switch (action) {
      case 'join':
        return { title: 'Registering', body: 'Adding you to the tournament…' };
      case 'leave':
        return { title: 'Leaving', body: 'Removing your registration…' };
      case 'generate':
        return {
          title: 'Generating bracket',
          body:
            tournamentFormat === 'swiss' || tournamentFormat === 'round_robin'
              ? 'Building round 1 pairings…'
              : 'Seeding matches and building the bracket…',
        };
      case 'generate-next':
        return {
          title: 'Generating round',
          body: `Pairing round ${currentRound + 1}…`,
        };
      case 'playoffs':
        return {
          title: 'Starting playoffs',
          body: 'Seeding advancers into the double elimination bracket…',
        };
      case 'reset-roster':
        return {
          title: 'Unlocking roster',
          body: 'Clearing the bracket and reopening registration…',
        };
      case 'complete':
        return {
          title: 'Finishing tournament',
          body: 'Updating status and standings…',
        };
      default:
        return { title: 'Please wait', body: 'Working…' };
    }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tournament-action-loading-title"
      aria-busy="true"
    >
      <div className="card w-full max-w-sm p-8 text-center shadow-2xl shadow-black/40">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-400" aria-hidden="true" />
        <h2 id="tournament-action-loading-title" className="mt-4 text-lg font-semibold text-white">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-slate-400">{copy.body}</p>
      </div>
    </div>
  );
}

interface Props {
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: string;
  tournamentFormat: string;
  participantCount: number;
  playerCap?: number | null;
  isRanked?: boolean;
  groupStageEnabled?: boolean;
  phase?: string | null;
  groupStageComplete?: boolean;
  isJoined: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userId: string | null;
  pendingMatches: Match[];
  completedMatches: Match[];
  currentRound: number;
  allCurrentRoundComplete: boolean;
  canResetRoster?: boolean;
}

export function TournamentActions({
  tournamentId,
  tournamentName,
  tournamentStatus,
  tournamentFormat,
  participantCount,
  playerCap = null,
  isRanked = true,
  groupStageEnabled = false,
  phase = null,
  groupStageComplete = false,
  isJoined,
  isLoggedIn,
  isAdmin,
  userId,
  pendingMatches,
  completedMatches,
  currentRound,
  allCurrentRoundComplete,
  canResetRoster = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateSaveName, setTemplateSaveName] = useState('');
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const defaultTemplateName = `${tournamentName} (template)`;
  const [showResetRosterConfirm, setShowResetRosterConfirm] = useState(false);
  const [showRegenerateRound1Confirm, setShowRegenerateRound1Confirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [successAction, setSuccessAction] = useState<
    'generate' | 'generate-next' | 'playoffs' | 'reset-roster' | 'regenerate-round-1' | 'complete' | null
  >(null);
  const [regeneratedRound, setRegeneratedRound] = useState(1);
  const [error, setError] = useState('');
  const [reportingMatch, setReportingMatch] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);

  function handleJoin() {
    setError('');
    setPendingAction('join');
    startTransition(async () => {
      try {
        await joinTournament(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to join.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleLeave() {
    setError('');
    setPendingAction('leave');
    startTransition(async () => {
      try {
        await leaveTournament(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to leave.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleGenerate() {
    setError('');
    setShowGenerateConfirm(false);
    setPendingAction('generate');
    startTransition(async () => {
      try {
        await generateBracket(tournamentId);
        setSuccessAction('generate');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to generate bracket.');
        setShowGenerateConfirm(true);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function openGenerateConfirm() {
    setError('');
    setShowGenerateConfirm(true);
  }

  function closeGenerateConfirm() {
    if (isPending) return;
    setShowGenerateConfirm(false);
    setError('');
  }

  function openSaveTemplateModal() {
    setError('');
    setTemplateSaveName(defaultTemplateName);
    setShowSaveTemplateModal(true);
  }

  function closeSaveTemplateModal() {
    if (isPending) return;
    setShowSaveTemplateModal(false);
    setError('');
  }

  function handleSaveTemplate() {
    setError('');
    setPendingAction('save-template');
    startTransition(async () => {
      try {
        const result = await saveTournamentAsTemplate(tournamentId, templateSaveName);
        if ('error' in result) {
          setError(result.error ?? 'Failed to save template.');
          return;
        }
        setSavedTemplateId(result.templateId);
        setShowSaveTemplateModal(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save template.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleResetRoster() {
    setError('');
    setShowResetRosterConfirm(false);
    setPendingAction('reset-roster');
    startTransition(async () => {
      try {
        await resetBracketForRegistration(tournamentId);
        setSuccessAction('reset-roster');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to reset bracket.');
        setShowResetRosterConfirm(true);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function openResetRosterConfirm() {
    setError('');
    setShowResetRosterConfirm(true);
  }

  function closeResetRosterConfirm() {
    if (isPending) return;
    setShowResetRosterConfirm(false);
    setError('');
  }

  function handleRegenerateRound1() {
    setError('');
    setShowRegenerateRound1Confirm(false);
    setPendingAction('regenerate-round-1');
    setRegeneratedRound(regenerationRound);
    startTransition(async () => {
      try {
        await regenerateRound1(tournamentId, regenerationRound);
        setSuccessAction('regenerate-round-1');
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : `Failed to regenerate Round ${regenerationRound}.`,
        );
        setShowRegenerateRound1Confirm(true);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function openRegenerateRound1Confirm() {
    setError('');
    setShowRegenerateRound1Confirm(true);
  }

  function closeRegenerateRound1Confirm() {
    if (isPending) return;
    setShowRegenerateRound1Confirm(false);
    setError('');
  }

  function handleCompleteTournament() {
    setError('');
    setShowCompleteConfirm(false);
    setPendingAction('complete');
    startTransition(async () => {
      try {
        await completeTournament(tournamentId);
        setSuccessAction('complete');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to mark tournament complete.');
        setShowCompleteConfirm(true);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function openCompleteConfirm() {
    setError('');
    setShowCompleteConfirm(true);
  }

  function closeCompleteConfirm() {
    if (isPending) return;
    setShowCompleteConfirm(false);
    setError('');
  }

  function handleCorrectScore(matchId: string, winnerId: string, updatedScore: string) {
    setError('');
    startTransition(async () => {
      try {
        await correctScore(matchId, updatedScore, winnerId);
        setEditingMatch(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to update score.');
      }
    });
  }

  function handleGeneratePlayoffs() {
    setError('');
    setPendingAction('playoffs');
    startTransition(async () => {
      try {
        await generatePlayoffs(tournamentId);
        setSuccessAction('playoffs');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to start playoffs.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleGenerateNextRound() {
    setError('');
    setPendingAction('generate-next');
    startTransition(async () => {
      try {
        await generateNextSwissRound(tournamentId);
        setSuccessAction('generate-next');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to generate next round.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleReport(matchId: string, winnerId: string, reportedScore: string) {
    setError('');
    startTransition(async () => {
      try {
        await reportResult(matchId, winnerId, reportedScore);
        setReportingMatch(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to report result.');
      }
    });
  }

  const inlineBracketFormat =
    tournamentFormat === 'swiss' ||
    tournamentFormat === 'round_robin' ||
    tournamentFormat === 'double_elimination' ||
    tournamentFormat === 'single_elimination';

  const myPendingMatches = isAdmin
    ? pendingMatches
    : pendingMatches.filter(
        (m) => m.player1?.id === userId || m.player2?.id === userId,
      );

  const showJoinLeave = false;
  const registrationFull = isTournamentFull(participantCount, playerCap);
  const playerCountLabel = formatPlayerCapLabel(participantCount, playerCap);
  const showGenerate =
    isAdmin && tournamentStatus === 'open' && !(groupStageEnabled && phase === 'group');
  const showSaveTemplate = isAdmin && tournamentStatus !== 'complete';
  const showStartPlayoffs =
    isAdmin &&
    groupStageEnabled &&
    phase === 'group' &&
    groupStageComplete;
  const showSwissNext =
    isAdmin &&
    tournamentStatus === 'active' &&
    (tournamentFormat === 'swiss' || tournamentFormat === 'round_robin') &&
    allCurrentRoundComplete &&
    !(groupStageEnabled && phase === 'group');
  const showReport = myPendingMatches.length > 0 && !inlineBracketFormat;
  const showEdit = isAdmin && completedMatches.length > 0 && !inlineBracketFormat;
  const showResetRoster = isAdmin && canResetRoster && tournamentStatus === 'active';
  const roundRobinTotalRounds =
    tournamentFormat === 'round_robin' ? roundRobinRoundCount(participantCount) : 0;
  const regenerationRound =
    tournamentFormat === 'round_robin' &&
    allCurrentRoundComplete &&
    currentRound < roundRobinTotalRounds
      ? currentRound + 1
      : currentRound;
  const showRegenerateRound1 =
    isAdmin &&
    tournamentStatus === 'active' &&
    currentRound > 0 &&
    (tournamentFormat === 'swiss' || tournamentFormat === 'round_robin') &&
    !(groupStageEnabled && phase === 'group');
  const showMarkComplete =
    isAdmin && tournamentStatus === 'active' && currentRound > 0;
  const hasContent =
    showJoinLeave ||
    showGenerate ||
    showSaveTemplate ||
    showStartPlayoffs ||
    showSwissNext ||
    showResetRoster ||
    showRegenerateRound1 ||
    showMarkComplete ||
    showReport ||
    showEdit;

  if (!hasContent && !error) return null;

  return (
    <div className="space-y-4">
      <SaveTemplateModal
        open={showSaveTemplateModal}
        onClose={closeSaveTemplateModal}
        onConfirm={handleSaveTemplate}
        isPending={isPending && pendingAction === 'save-template'}
        error={error}
        defaultName={defaultTemplateName}
        templateName={templateSaveName}
        onTemplateNameChange={setTemplateSaveName}
      />

      <GenerateBracketConfirmModal
        open={showGenerateConfirm}
        onClose={closeGenerateConfirm}
        onConfirm={handleGenerate}
        isPending={isPending && pendingAction === 'generate'}
        error={error}
        tournamentFormat={tournamentFormat}
        participantCount={participantCount}
        groupStageEnabled={groupStageEnabled}
      />

      <ResetRosterConfirmModal
        open={showResetRosterConfirm}
        onClose={closeResetRosterConfirm}
        onConfirm={handleResetRoster}
        isPending={isPending && pendingAction === 'reset-roster'}
        error={error}
        participantCount={participantCount}
      />

      <RegenerateRound1ConfirmModal
        open={showRegenerateRound1Confirm}
        onClose={closeRegenerateRound1Confirm}
        onConfirm={handleRegenerateRound1}
        isPending={isPending && pendingAction === 'regenerate-round-1'}
        error={error}
        tournamentFormat={tournamentFormat}
        currentRound={currentRound}
        targetRound={regenerationRound}
        participantCount={participantCount}
      />

      <CompleteTournamentConfirmModal
        open={showCompleteConfirm}
        onClose={closeCompleteConfirm}
        onConfirm={handleCompleteTournament}
        isPending={isPending && pendingAction === 'complete'}
        error={error}
        pendingMatchCount={pendingMatches.length}
      />

      {pendingAction === 'join' ||
      pendingAction === 'leave' ||
      pendingAction === 'generate' ||
      pendingAction === 'generate-next' ||
      pendingAction === 'playoffs' ||
      pendingAction === 'reset-roster' ||
      pendingAction === 'complete' ? (
        <ActionLoadingModal
          action={pendingAction}
          tournamentFormat={tournamentFormat}
          currentRound={currentRound}
        />
      ) : null}

      {successAction ? (
        <ActionSuccessNotice
          action={successAction}
          tournamentFormat={tournamentFormat}
          currentRound={currentRound}
          regeneratedRound={regeneratedRound}
          onDismiss={() => setSuccessAction(null)}
        />
      ) : null}

      {savedTemplateId && (
        <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-sm font-semibold text-white">Template saved</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Reuse these settings when creating your next tournament.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/profile/tournament-templates/${savedTemplateId}/edit`}
              className="inline-flex items-center rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              Edit template
            </Link>
            <Link
              href="/profile/tournament-templates"
              className="inline-flex items-center rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              All templates
            </Link>
          </div>
        </div>
      )}

      {error && !showSaveTemplateModal && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      {/* Join / Leave */}
      {tournamentStatus === 'open' && isLoggedIn && (
        <div>
          {isJoined ? (
            <div className="overflow-hidden rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-slate-950/40 to-slate-950 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <CheckCircle2 size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Registered
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">You&apos;re in the bracket pool</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {playerCountLabel} — waiting for the bracket to start.
                    {!isRanked && ' Unranked event.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLeave}
                disabled={isPending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:border-red-400/50 hover:bg-red-500/15 disabled:opacity-60"
              >
                {isPending && pendingAction === 'leave' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Leaving…
                  </>
                ) : (
                  'Leave tournament'
                )}
              </button>
            </div>
          ) : registrationFull ? (
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Registration full
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{playerCountLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                This event has reached its player cap. Check back if someone drops out.
              </p>
            </div>
          ) : (
            <TournamentActionCard
              icon={UserPlus}
              eyebrow="Open registration"
              title="Join this tournament"
              description={`${playerCountLabel} so far. Claim your spot before the bracket is generated.${!isRanked ? ' Unranked — no rank points.' : ''}`}
              buttonLabel="Register for this tournament"
              pendingLabel="Registering…"
              onClick={handleJoin}
              disabled={isPending}
              isPending={isPending && pendingAction === 'join'}
              tone="brand"
            />
          )}
        </div>
      )}

      {/* Admin: Generate bracket / Swiss round */}
      {showGenerate && (
        <TournamentActionCard
          icon={Swords}
          eyebrow="Admin"
          title={
            groupStageEnabled
              ? 'Ready to start groups?'
              : tournamentFormat === 'swiss' || tournamentFormat === 'round_robin'
                ? 'Ready for Round 1?'
                : 'Ready to seed the bracket?'
          }
          description={
            participantCount >= 2
              ? `Seed ${participantCount} player${participantCount !== 1 ? 's' : ''} and close registration. This action cannot be undone.`
              : 'Add at least 2 players before you can start the tournament.'
          }
          buttonLabel={getGenerateLabel(tournamentFormat, groupStageEnabled)}
          pendingLabel="Generating…"
          onClick={openGenerateConfirm}
          disabled={isPending || participantCount < 2}
          isPending={isPending && pendingAction === 'generate'}
          tone="admin"
        />
      )}

      {showSaveTemplate && (
        <button
          type="button"
          onClick={openSaveTemplateModal}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-100 disabled:opacity-60"
        >
          {isPending && pendingAction === 'save-template' ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving template…
            </>
          ) : (
            <>
              <BookmarkPlus size={15} />
              Save as tournament template
            </>
          )}
        </button>
      )}

      {showRegenerateRound1 && (
        <TournamentActionCard
          icon={RotateCcw}
          eyebrow="Admin"
          title="Fix pairings or start over?"
          description={
            regenerationRound > 1
              ? `Clear round ${regenerationRound} and any later scores, then regenerate Round ${regenerationRound}. Earlier rounds are kept.`
              : 'Clear all rounds and scores, then regenerate Round 1 with the current roster. Registration stays closed.'
          }
          buttonLabel={`Regenerate Round ${regenerationRound}`}
          pendingLabel="Regenerating…"
          onClick={openRegenerateRound1Confirm}
          disabled={isPending}
          isPending={isPending && pendingAction === 'regenerate-round-1'}
          tone="admin"
        />
      )}

      {showResetRoster && (
        <TournamentActionCard
          icon={RotateCcw}
          eyebrow="Admin"
          title="Late player or no-show?"
          description="Cancel the current bracket, update the roster, and generate again. Only works before any match scores are reported."
          buttonLabel="Edit roster"
          pendingLabel="Resetting…"
          onClick={openResetRosterConfirm}
          disabled={isPending}
          isPending={isPending && pendingAction === 'reset-roster'}
          tone="admin"
        />
      )}

      {showMarkComplete && (
        <TournamentActionCard
          icon={CheckCircle2}
          eyebrow="Admin"
          title="Ready to wrap up?"
          description="Mark the tournament as finished. Standings and podium reflect completed matches only."
          buttonLabel="Mark as finished"
          pendingLabel="Finishing…"
          onClick={openCompleteConfirm}
          disabled={isPending}
          isPending={isPending && pendingAction === 'complete'}
          tone="admin"
        />
      )}

      {showStartPlayoffs && (
        <button
          onClick={handleGeneratePlayoffs}
          disabled={isPending}
          className="btn-primary disabled:opacity-60"
        >
          {isPending && pendingAction === 'playoffs' ? 'Starting...' : 'Start playoffs'}
        </button>
      )}

      {/* Admin: Generate next Swiss round when current round is done */}
      {isAdmin && tournamentStatus === 'active' &&
        (tournamentFormat === 'swiss' || tournamentFormat === 'round_robin') &&
        allCurrentRoundComplete && (
        <button
          onClick={handleGenerateNextRound}
          disabled={isPending}
          className="btn-primary disabled:opacity-60"
        >
          {isPending && pendingAction === 'generate-next' ? 'Generating...' : `Generate Round ${currentRound + 1}`}
        </button>
      )}

      {/* Report result for pending matches - hidden for Swiss (handled inline in bracket) */}
      {myPendingMatches.length > 0 && !inlineBracketFormat && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Report match result
          </p>
          {myPendingMatches.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-white">
                {matchLabel(m, tournamentFormat)}
              </p>
              {reportingMatch === m.id ? (
                m.player1 && m.player2 ? (
                  <div className="mt-3">
                    <MatchResultInlineForm
                      player1={m.player1}
                      player2={m.player2}
                      onSave={(winnerId, reportedScore) => handleReport(m.id, winnerId, reportedScore)}
                      onCancel={() => setReportingMatch(null)}
                      isPending={isPending}
                    />
                  </div>
                ) : null
              ) : (
                <button
                  onClick={() => setReportingMatch(m.id)}
                  className="mt-2 text-xs font-semibold text-brand-300 transition hover:text-brand-200"
                >
                  Enter result
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Admin: Edit scores of completed matches - hidden for Swiss (handled inline in bracket) */}
      {isAdmin && completedMatches.length > 0 && !inlineBracketFormat && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Edit match scores
          </p>
          {completedMatches.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {matchLabel(m, tournamentFormat)}
                </p>
                {m.score && <span className="text-xs text-slate-400">{m.score}</span>}
              </div>
              {editingMatch === m.id ? (
                m.player1 && m.player2 ? (
                  <div className="mt-3">
                    <MatchResultInlineForm
                      key={m.id}
                      player1={m.player1}
                      player2={m.player2}
                      score={m.score ?? ''}
                      winnerId={m.winner?.id ?? null}
                      onSave={(winnerId, updatedScore) =>
                        handleCorrectScore(m.id, winnerId, updatedScore)
                      }
                      onCancel={() => setEditingMatch(null)}
                      isPending={isPending}
                    />
                  </div>
                ) : null
              ) : (
                <button
                  onClick={() => setEditingMatch(m.id)}
                  className="mt-2 text-xs font-semibold text-slate-400 transition hover:text-brand-300"
                >
                  Edit score
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
