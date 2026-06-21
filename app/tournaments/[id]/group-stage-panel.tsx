'use client';

import { useState, useTransition } from 'react';
import { reportResult, correctScore } from '@/app/actions/matches';
import { MatchResultModal } from './match-result-modal';

type GroupMatch = {
  id: string;
  status: string;
  score: string | null;
  player1: { id: string; username: string } | null;
  player2: { id: string; username: string } | null;
};

type GroupView = {
  groupId: number;
  label: string;
  standings: {
    userId: string;
    username: string;
    wins: number;
    losses: number;
    groupRank: number;
  }[];
  matches: GroupMatch[];
};

type Props = {
  groups: GroupView[];
  isAdmin: boolean;
  userId: string | null;
  advancePerGroup: number;
};

export function GroupStagePanel({ groups, isAdmin, userId, advancePerGroup }: Props) {
  const [activeMatch, setActiveMatch] = useState<GroupMatch | null>(null);
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function openMatch(m: GroupMatch) {
    const canReport =
      m.status === 'pending' &&
      m.player1 &&
      m.player2 &&
      (isAdmin || userId === m.player1.id || userId === m.player2.id);
    if (!canReport) return;
    setActiveMatch(m);
    setScore('');
    setError('');
  }

  function handleReport(winnerId: string) {
    if (!activeMatch) return;
    setError('');
    startTransition(async () => {
      try {
        await reportResult(activeMatch.id, winnerId, score);
        setActiveMatch(null);
        setScore('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to report result.');
      }
    });
  }

  if (groups.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No groups yet.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Round robin within each group — top {advancePerGroup} per group advance to double elimination
        playoffs.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.groupId}
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50"
          >
            <div className="border-b border-slate-800 bg-gradient-to-r from-violet-900/40 to-slate-900 px-4 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {group.label}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Top {advancePerGroup} advance ·{' '}
                {group.matches.filter((m) => m.status === 'complete').length}/{group.matches.length}{' '}
                played
              </p>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="w-8 px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Player</th>
                  <th className="px-2 py-2 text-center">W</th>
                  <th className="px-3 py-2 text-center">L</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((s) => (
                  <tr
                    key={s.userId}
                    className={`border-b border-slate-800/80 last:border-0 ${
                      s.groupRank <= advancePerGroup ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="px-3 py-2 tabular-nums text-slate-500">{s.groupRank}</td>
                    <td className="px-3 py-2 font-medium text-white">
                      {s.username}
                      {s.groupRank <= advancePerGroup && (
                        <span className="ml-1.5 text-[9px] font-bold uppercase text-emerald-400">
                          Adv
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold tabular-nums text-emerald-400">
                      {s.wins}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-slate-400">{s.losses}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-800 px-4 py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Matches
              </p>
              <ul className="space-y-1.5">
                {group.matches.map((m) => {
                  const canReport =
                    m.status === 'pending' &&
                    m.player1 &&
                    m.player2 &&
                    (isAdmin || userId === m.player1.id || userId === m.player2.id);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => openMatch(m)}
                        disabled={!canReport}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                          m.status === 'complete'
                            ? 'border-slate-700 bg-slate-900/80 text-slate-300'
                            : canReport
                              ? 'cursor-pointer border-slate-700 bg-slate-900 hover:border-brand-500/40'
                              : 'border-slate-800 bg-slate-950/50 text-slate-500'
                        }`}
                      >
                        <span className="min-w-0 truncate">
                          {m.player1?.username ?? 'TBD'} vs {m.player2?.username ?? 'TBD'}
                        </span>
                        <span className="shrink-0 tabular-nums text-slate-500">
                          {m.status === 'complete' ? (m.score ?? 'Done') : canReport ? 'Report' : '—'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {activeMatch && (
        <MatchResultModal
          open
          mode="report"
          player1={activeMatch.player1}
          player2={activeMatch.player2}
          score={score}
          onScoreChange={setScore}
          onReport={handleReport}
          onSaveEdit={() => {}}
          onClose={() => setActiveMatch(null)}
          isPending={isPending}
          error={error}
        />
      )}
    </div>
  );
}
