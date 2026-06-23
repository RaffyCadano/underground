'use client';

import { useMemo, useState, useTransition } from 'react';
import { reportResult, correctScore } from '@/app/actions/matches';
import { MatchResultModal } from './match-result-modal';

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

import { participantDisplayName } from '@/lib/tournament-participant';

type Participant = {
  userId: string;
  walkInName?: string | null;
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
  const [modalMatch, setModalMatch] = useState<SwissMatch | null>(null);
  const [modalMode, setModalMode] = useState<'report' | 'edit'>('report');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const maxRound = useMemo(
    () => (rounds.length > 0 ? Math.max(...rounds.map(([r]) => r)) : 0),
    [rounds],
  );

  function openReport(match: SwissMatch) {
    setModalMatch(match);
    setModalMode('report');
    setScore('');
    setError('');
  }

  function openEdit(match: SwissMatch) {
    setModalMatch(match);
    setModalMode('edit');
    setScore(match.score ?? '');
    setError('');
  }

  function closeModal() {
    setModalMatch(null);
    setScore('');
    setError('');
  }

  function handleReport(winnerId: string) {
    if (!modalMatch) return;
    setError('');
    startTransition(async () => {
      try {
        await reportResult(modalMatch.id, winnerId, score);
        closeModal();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to report result.');
      }
    });
  }

  function handleEditScore() {
    if (!modalMatch) return;
    setError('');
    startTransition(async () => {
      try {
        await correctScore(modalMatch.id, score);
        closeModal();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to update score.');
      }
    });
  }

  const stats = new Map(
    participants.map((p) => [
      p.userId,
      {
        username: participantDisplayName(p),
        rankPoints: p.user.rankPoints,
        wins: 0,
        losses: 0,
      },
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

      {tab === 'rounds' && (
        <div className="overflow-x-auto pb-2">
          {rounds.length === 0 ? (
            <p className="text-sm text-slate-400">No rounds generated yet.</p>
          ) : (
            <div className="flex min-w-fit gap-5">
              {rounds.map(([round, matches]) => {
                const isLatestRound = round === maxRound;
                return (
                  <div key={round} className="flex w-44 shrink-0 flex-col">
                    <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Round {round}
                    </p>
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
                          m.player1 &&
                          m.player2 &&
                          (isAdmin || userId === m.player1.id || userId === m.player2.id);
                        const canEdit = isDone && isAdmin && isLatestRound;
                        const clickable = canReport || canEdit;

                        return (
                          <div
                            key={m.id}
                            role={clickable ? 'button' : undefined}
                            tabIndex={clickable ? 0 : undefined}
                            onClick={
                              clickable
                                ? () => (canReport ? openReport(m) : openEdit(m))
                                : undefined
                            }
                            onKeyDown={
                              clickable
                                ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      if (canReport) openReport(m);
                                      else openEdit(m);
                                    }
                                  }
                                : undefined
                            }
                            className={`overflow-hidden rounded-lg border text-xs ${
                              isDone ? 'border-slate-700 bg-slate-900' : 'border-slate-800 bg-slate-900/70'
                            } ${clickable ? 'cursor-pointer transition hover:border-sky-500/50 hover:shadow-md' : ''} ${
                              canReport ? 'ring-1 ring-inset ring-sky-500/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                              <span className={`truncate font-medium ${p1Won ? 'text-white' : 'text-slate-400'}`}>
                                {m.player1?.username ?? 'TBD'}
                              </span>
                              {p1Score !== null && (
                                <span
                                  className={`ml-2 shrink-0 rounded px-1.5 py-0.5 tabular-nums font-bold ${
                                    p1Won ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
                                  }`}
                                >
                                  {p1Score}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between px-3 py-2">
                              <span className={`truncate font-medium ${p2Won ? 'text-white' : 'text-slate-400'}`}>
                                {m.player2?.username ?? 'TBD'}
                              </span>
                              {p2Score !== null && (
                                <span
                                  className={`ml-2 shrink-0 rounded px-1.5 py-0.5 tabular-nums font-bold ${
                                    p2Won ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
                                  }`}
                                >
                                  {p2Score}
                                </span>
                              )}
                            </div>

                            {canReport && (
                              <div className="border-t border-slate-800 px-3 py-1.5 text-center">
                                <span className="text-[10px] font-semibold text-brand-300">Report result</span>
                              </div>
                            )}

                            {canEdit && (
                              <div className="flex justify-end border-t border-slate-800 px-3 py-1">
                                <span className="text-[10px] text-slate-400">Edit score</span>
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

      <MatchResultModal
        open={modalMatch !== null}
        mode={modalMode}
        player1={modalMatch?.player1 ?? null}
        player2={modalMatch?.player2 ?? null}
        score={score}
        onScoreChange={setScore}
        onReport={handleReport}
        onSaveEdit={handleEditScore}
        onClose={closeModal}
        isPending={isPending}
        error={error}
      />
    </div>
  );
}
