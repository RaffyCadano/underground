'use client';

import { useState, useTransition } from 'react';
import { joinTournament, leaveTournament, generateBracket, generateNextSwissRound } from '@/app/actions/tournaments';
import { reportResult, correctScore } from '@/app/actions/matches';

type Player = { id: string; username: string } | null;

type Match = {
  id: string;
  round: number;
  matchIndex: number;
  status: string;
  score: string | null;
  player1: Player;
  player2: Player;
  winner: Player;
};

interface Props {
  tournamentId: string;
  tournamentStatus: string;
  tournamentFormat: string;
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
  const [error, setError] = useState('');
  const [reportingMatch, setReportingMatch] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');

  function handleJoin() {
    setError('');
    startTransition(async () => {
      try {
        await joinTournament(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to join.');
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

  function handleGenerate() {
    setError('');
    startTransition(async () => {
      try {
        await generateBracket(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to generate bracket.');
      }
    });
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
    startTransition(async () => {
      try {
        await generateNextSwissRound(tournamentId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to generate next round.');
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

  // Matches where this user is a participant (or all if admin)
  const myPendingMatches = isAdmin
    ? pendingMatches
    : pendingMatches.filter(
        (m) => m.player1?.id === userId || m.player2?.id === userId,
      );

  return (
    <div className="space-y-4">
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
              {isPending ? 'Leaving...' : 'Leave tournament'}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="btn-primary disabled:opacity-60"
            >
              {isPending ? 'Registering...' : 'Register for this tournament'}
            </button>
          )}
        </div>
      )}

      {/* Admin: Generate bracket / Swiss round */}
      {isAdmin && tournamentStatus === 'open' && (
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="btn-secondary disabled:opacity-60"
        >
          {isPending
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
          {isPending ? 'Generating...' : `Generate Round ${currentRound + 1}`}
        </button>
      )}

      {/* Report result for pending matches - hidden for Swiss (handled inline in bracket) */}
      {myPendingMatches.length > 0 && tournamentFormat !== 'swiss' && tournamentFormat !== 'round_robin' && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Report match result
          </p>
          {myPendingMatches.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-white">
                {m.player1?.username ?? 'TBD'} vs {m.player2?.username ?? 'TBD'}
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
      {isAdmin && completedMatches.length > 0 && tournamentFormat !== 'swiss' && tournamentFormat !== 'round_robin' && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Edit match scores
          </p>
          {completedMatches.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {m.player1?.username ?? '?'} vs {m.player2?.username ?? '?'}
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
