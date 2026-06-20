'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, Swords, X } from 'lucide-react';
import { joinTournament, leaveTournament, generateBracket, generateNextSwissRound } from '@/app/actions/tournaments';
import { reportResult, correctScore } from '@/app/actions/matches';

type PendingAction = 'join' | 'leave' | 'generate' | 'generate-next' | 'report' | 'edit' | null;

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

function GenerateBracketConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  error,
  tournamentFormat,
  participantCount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: string;
  tournamentFormat: string;
  participantCount: number;
}) {
  const [mounted, setMounted] = useState(false);
  const isSwiss = tournamentFormat === 'swiss' || tournamentFormat === 'round_robin';
  const title = isSwiss ? 'Generate round 1?' : 'Generate bracket?';
  const confirmLabel = isSwiss ? 'Generate round 1' : 'Generate bracket';

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
            {(isSwiss
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
  tournamentStatus: string;
  tournamentFormat: string;
  participantCount: number;
  isJoined: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userId: string | null;
  pendingMatches: Match[];
  completedMatches: Match[];
  currentRound: number;
  allCurrentRoundComplete: boolean;
}

export function TournamentActions({
  tournamentId,
  tournamentStatus,
  tournamentFormat,
  participantCount,
  isJoined,
  isLoggedIn,
  isAdmin,
  userId,
  pendingMatches,
  completedMatches,
  currentRound,
  allCurrentRoundComplete,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [error, setError] = useState('');
  const [reportingMatch, setReportingMatch] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');

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

  function handleCorrectScore(matchId: string) {
    setError('');
    startTransition(async () => {
      try {
        await correctScore(matchId, editScore);
        setEditingMatch(null);
        setEditScore('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to update score.');
      }
    });
  }

  function handleGenerateNextRound() {
    setError('');
    setPendingAction('generate-next');
    startTransition(async () => {
      try {
        await generateNextSwissRound(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to generate next round.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleReport(matchId: string, winnerId: string) {
    setError('');
    startTransition(async () => {
      try {
        await reportResult(matchId, winnerId, score);
        setReportingMatch(null);
        setScore('');
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

  const showJoinLeave = tournamentStatus === 'open' && isLoggedIn;
  const showGenerate = isAdmin && tournamentStatus === 'open';
  const showSwissNext =
    isAdmin &&
    tournamentStatus === 'active' &&
    (tournamentFormat === 'swiss' || tournamentFormat === 'round_robin') &&
    allCurrentRoundComplete;
  const showReport = myPendingMatches.length > 0 && !inlineBracketFormat;
  const showEdit = isAdmin && completedMatches.length > 0 && !inlineBracketFormat;
  const hasContent = showJoinLeave || showGenerate || showSwissNext || showReport || showEdit;

  if (!hasContent && !error) return null;

  return (
    <div className="space-y-4">
      <GenerateBracketConfirmModal
        open={showGenerateConfirm}
        onClose={closeGenerateConfirm}
        onConfirm={handleGenerate}
        isPending={isPending && pendingAction === 'generate'}
        error={error}
        tournamentFormat={tournamentFormat}
        participantCount={participantCount}
      />

      {pendingAction === 'join' ||
      pendingAction === 'leave' ||
      pendingAction === 'generate' ||
      pendingAction === 'generate-next' ? (
        <ActionLoadingModal
          action={pendingAction}
          tournamentFormat={tournamentFormat}
          currentRound={currentRound}
        />
      ) : null}

      {error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      {/* Join / Leave */}
      {tournamentStatus === 'open' && isLoggedIn && (
        <div>
          {isJoined ? (
            <button
              onClick={handleLeave}
              disabled={isPending}
              className="btn-secondary border-red-500/40 text-red-300 hover:border-red-400/60 hover:text-red-200 disabled:opacity-60"
            >
              {isPending && pendingAction === 'leave' ? 'Leaving...' : 'Leave tournament'}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="btn-primary disabled:opacity-60"
            >
              {isPending && pendingAction === 'join' ? 'Registering...' : 'Register for this tournament'}
            </button>
          )}
        </div>
      )}

      {/* Admin: Generate bracket / Swiss round */}
      {isAdmin && tournamentStatus === 'open' && (
        <button
          onClick={openGenerateConfirm}
          disabled={isPending}
          className="btn-secondary disabled:opacity-60"
        >
          {isPending && pendingAction === 'generate'
            ? 'Generating...'
            : (tournamentFormat === 'swiss' || tournamentFormat === 'round_robin')
            ? 'Generate Round 1'
            : 'Generate bracket'}
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
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    placeholder="Score (e.g. 3-1)"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="input"
                  />
                  <div className="flex flex-wrap gap-2">
                    {m.player1 && (
                      <button
                        onClick={() => handleReport(m.id, m.player1!.id)}
                        disabled={isPending}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                      >
                        {m.player1.username} wins
                      </button>
                    )}
                    {m.player2 && (
                      <button
                        onClick={() => handleReport(m.id, m.player2!.id)}
                        disabled={isPending}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                      >
                        {m.player2.username} wins
                      </button>
                    )}
                    <button
                      onClick={() => { setReportingMatch(null); setScore(''); }}
                      className="rounded-lg px-4 py-2 text-xs text-slate-400 transition hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="New score (e.g. 3-1)"
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => handleCorrectScore(m.id)}
                    disabled={isPending}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingMatch(null); setEditScore(''); }}
                    className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingMatch(m.id); setEditScore(m.score ?? ''); }}
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
