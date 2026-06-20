'use client';

import { useState, useTransition } from 'react';
import { reportResult, correctScore } from '@/app/actions/matches';

type Player = { id: string; username: string } | null;

export type SwissMatch = {
  id: string;
  round: number;
  matchIndex: number;
  player1: Player;
  player2: Player;
  winner: Player;
  score: string | null;
  status: string;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
};

type Participant = {
  userId: string;
  user: { id: string; username: string; rankPoints: number };
};

interface BracketSwissProps {
  rounds: [number, SwissMatch[]][];
  participants: Participant[];
  allMatches: SwissMatch[];
  isAdmin: boolean;
  userId: string | null;
}

export function BracketSwiss({ rounds, participants, allMatches, isAdmin, userId }: BracketSwissProps) {
  const [tab, setTab] = useState<'standings' | 'rounds'>('standings');
  const [activeMatch, setActiveMatch] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [editMatch, setEditMatch] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleReport(matchId: string, winnerId: string) {
    setError('');
    startTransition(async () => {
      try {
        await reportResult(matchId, winnerId, score);
        setActiveMatch(null);
        setScore('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to report result.');
      }
    });
  }

  function handleEditScore(matchId: string) {
    setError('');
    startTransition(async () => {
      try {
        await correctScore(matchId, editScore);
        setEditMatch(null);
        setEditScore('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to update score.');
      }
    });
  }

  // Compute per-tournament W/L from match history
  const stats = new Map(
    participants.map((p) => [
      p.userId,
      { username: p.user.username, rankPoints: p.user.rankPoints, wins: 0, losses: 0 },
    ]),
  );

  for (const m of allMatches) {
    if (m.status !== 'complete' || !m.winnerId) continue;
    const loserId = m.player1Id === m.winnerId ? m.player2Id : m.player1Id;
    const w = stats.get(m.winnerId);
    const l = loserId ? stats.get(loserId) : null;
    if (w) w.wins++;
    if (l) l.losses++;
  }

  const standings = [...stats.values()].sort(
    (a, b) => b.wins - a.wins || b.rankPoints - a.rankPoints,
  );

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">{error}</p>
      )}
      {/* Tab bar */}
      <div className="mb-5 flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
        {(['standings', 'rounds'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
              tab === t
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'rounds' ? `Rounds (${rounds.length})` : 'Standings'}
          </button>
        ))}
      </div>

      {/* Standings tab */}
      {tab === 'standings' && (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="w-10 px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">#</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Player</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">W</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">L</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.username} className={`border-b border-slate-800 last:border-0 ${i < 3 ? 'bg-brand-500/10' : ''}`}>
                  <td className="px-4 py-2.5 tabular-nums text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-semibold text-white">{s.username}</td>
                  <td className="px-4 py-2.5 text-center font-bold tabular-nums text-emerald-400">{s.wins}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-400">{s.losses}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">{s.rankPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rounds tab - horizontal bracket columns, Challonge-style */}
      {tab === 'rounds' && (
        <div className="overflow-x-auto pb-2">
          {rounds.length === 0 ? (
            <p className="text-sm text-slate-400">No rounds generated yet.</p>
          ) : (
            <div className="flex min-w-fit gap-5">
              {rounds.map(([round, matches]) => {
                const maxRound = Math.max(...rounds.map(([r]) => r));
                const isLatestRound = round === maxRound;
                return (
                <div key={round} className="flex w-44 shrink-0 flex-col">
                  {/* Round header */}
                  <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Round {round}
                  </p>
                  {/* Match cards */}
                  <div className="flex flex-col gap-2">
                    {matches.map((m) => {
                      const p1Won = !!m.winner && m.winner.id === m.player1?.id;
                      const p2Won = !!m.winner && m.winner.id === m.player2?.id;
                      const isDone = m.status === 'complete';
                      const scoreParts = m.score ? m.score.split('-') : [];
                      const p1Score = scoreParts[0] ?? null;
                      const p2Score = scoreParts[1] ?? null;
                      const canReport =
                        m.status === 'pending' &&
                        isLatestRound &&
                        m.player1 && m.player2 &&
                        (isAdmin || userId === m.player1.id || userId === m.player2.id);
                      const isActive = activeMatch === m.id;
                      const isEditing = editMatch === m.id;

                      return (
                        <div
                          key={m.id}
                          className={`overflow-hidden rounded-lg border text-xs ${
                            isDone ? 'border-slate-700 bg-slate-900' : 'border-slate-800 bg-slate-900/70'
                          }`}
                        >
                          {/* Player 1 */}
                          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                            <span className={`truncate font-medium ${p1Won ? 'text-white' : 'text-slate-400'}`}>
                              {m.player1?.username ?? 'TBD'}
                            </span>
                            {p1Score !== null && (
                              <span className={`ml-2 shrink-0 rounded px-1.5 py-0.5 tabular-nums font-bold ${
                                p1Won ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
                              }`}>
                                {p1Score}
                              </span>
                            )}
                          </div>

                          {/* Player 2 */}
                          <div className="flex items-center justify-between px-3 py-2">
                            <span className={`truncate font-medium ${p2Won ? 'text-white' : 'text-slate-400'}`}>
                              {m.player2?.username ?? 'TBD'}
                            </span>
                            {p2Score !== null && (
                              <span className={`ml-2 shrink-0 rounded px-1.5 py-0.5 tabular-nums font-bold ${
                                p2Won ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
                              }`}>
                                {p2Score}
                              </span>
                            )}
                          </div>

                          {/* Edit button (admin, latest round, done) */}
                          {isDone && !isEditing && isAdmin && isLatestRound && (
                            <div className="flex justify-end border-t border-slate-800 px-3 py-1">
                              <button
                                onClick={() => { setEditMatch(m.id); setEditScore(m.score ?? ''); }}
                                className="text-[10px] text-slate-400 transition hover:text-brand-300"
                              >
                                Edit
                              </button>
                            </div>
                          )}

                          {/* Edit score form */}
                          {isEditing && (
                            <div className="border-t border-slate-800 p-2.5">
                              <input
                                autoFocus
                                type="text"
                                value={editScore}
                                onChange={(e) => setEditScore(e.target.value)}
                                placeholder="Score e.g. 3-1"
                                className="input mb-2 text-xs"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditScore(m.id)}
                                  disabled={isPending}
                                  className="rounded-lg bg-brand-600 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
                                >
                                  {isPending ? '...' : 'Save'}
                                </button>
                                <button onClick={() => setEditMatch(null)} className="text-[10px] text-slate-400 transition hover:text-slate-200">Cancel</button>
                              </div>
                            </div>
                          )}

                          {/* Enter result button */}
                          {canReport && !isActive && (
                            <div className="border-t border-slate-800 px-3 py-1.5">
                              <button
                                onClick={() => { setActiveMatch(m.id); setScore(''); }}
                                className="text-[10px] font-semibold text-brand-300 transition hover:text-brand-200"
                              >
                                Enter result
                              </button>
                            </div>
                          )}

                          {/* Inline report form */}
                          {isActive && (
                            <div className="border-t border-slate-800 p-2.5">
                              <input
                                autoFocus
                                type="text"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder="Score e.g. 3-1"
                                className="input mb-2 text-xs"
                              />
                              <div className="flex flex-col gap-1.5">
                                {m.player1 && (
                                  <button
                                    onClick={() => handleReport(m.id, m.player1!.id)}
                                    disabled={isPending}
                                    className="w-full rounded-lg bg-brand-600 px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
                                  >
                                    {isPending ? '...' : `${m.player1.username} wins`}
                                  </button>
                                )}
                                {m.player2 && (
                                  <button
                                    onClick={() => handleReport(m.id, m.player2!.id)}
                                    disabled={isPending}
                                    className="w-full rounded-lg bg-brand-600 px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
                                  >
                                    {isPending ? '...' : `${m.player2.username} wins`}
                                  </button>
                                )}
                                  <button onClick={() => { setActiveMatch(null); setScore(''); }} className="text-[10px] text-slate-400 transition hover:text-slate-200">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
