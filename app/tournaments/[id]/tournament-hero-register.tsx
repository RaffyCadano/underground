'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight, CheckCircle2, Loader2, LogIn, UserPlus } from 'lucide-react';
import { joinTournament, leaveTournament } from '@/app/actions/tournaments';
import { formatPlayerCapLabel, isTournamentFull } from '@/lib/tournament-registration';

type Props = {
  tournamentId: string;
  status: string;
  isLoggedIn: boolean;
  isJoined: boolean;
  isAdmin: boolean;
  participantCount: number;
  playerCap: number | null;
  isRanked: boolean;
};

export function TournamentHeroRegister({
  tournamentId,
  status,
  isLoggedIn,
  isJoined,
  isAdmin,
  participantCount,
  playerCap,
  isRanked,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  if (isAdmin || status !== 'open') return null;

  const registrationFull = isTournamentFull(participantCount, playerCap);
  const playerCountLabel = formatPlayerCapLabel(participantCount, playerCap);
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/tournaments/${tournamentId}`)}`;

  function handleJoin() {
    setError('');
    startTransition(async () => {
      try {
        await joinTournament(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to register.');
      }
    });
  }

  function handleLeave() {
    setError('');
    startTransition(async () => {
      try {
        await leaveTournament(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to leave.');
      }
    });
  }

  return (
    <div className="mt-6">
      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {!isLoggedIn ? (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-slate-950/40 to-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Open registration
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Want to compete in this event?</p>
            <p className="mt-1 text-xs text-slate-400">
              {playerCountLabel} so far.{!isRanked ? ' Unranked event.' : ''}
            </p>
          </div>
          <Link
            href={loginHref}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
          >
            <LogIn size={16} />
            Sign in to register
            <ArrowRight size={15} className="opacity-80" />
          </Link>
        </div>
      ) : isJoined ? (
        <div className="flex flex-col gap-4 rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-slate-950/40 to-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Registered
              </p>
              <p className="mt-1 text-sm font-semibold text-white">You&apos;re in the bracket pool</p>
              <p className="mt-1 text-xs text-slate-400">
                {playerCountLabel} — waiting for the bracket to start.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLeave}
            disabled={isPending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:border-red-400/50 hover:bg-red-500/15 disabled:opacity-60"
          >
            {isPending ? (
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
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Registration full
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{playerCountLabel}</p>
          <p className="mt-1 text-xs text-slate-400">
            This event has reached its player cap. Check back if someone drops out.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-slate-950/40 to-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
              <UserPlus size={18} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Open registration
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Join this tournament</p>
              <p className="mt-1 text-xs text-slate-400">
                {playerCountLabel} so far. Claim your spot before the bracket is generated.
                {!isRanked ? ' Unranked — no rank points.' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleJoin}
            disabled={isPending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Registering…
              </>
            ) : (
              <>
                Register for this tournament
                <ArrowRight size={15} className="opacity-80" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
