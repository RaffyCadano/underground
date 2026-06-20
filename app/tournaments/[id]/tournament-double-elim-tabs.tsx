'use client';

import { useMemo, useState } from 'react';
import { BracketDoubleElim } from './bracket-double-elim';
import {
  computeBracketGroups,
  computeTournamentStandings,
  statusBadgeClass,
  type TournamentMatch,
  type TournamentParticipant,
} from '@/lib/tournament-stats';

type Tab = 'bracket' | 'groups' | 'rankings';

type Props = {
  matches: TournamentMatch[];
  participants: TournamentParticipant[];
  tournamentStatus: string;
  isAdmin: boolean;
  userId: string | null;
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'bracket', label: 'Bracket' },
  { id: 'groups', label: 'Group Stage' },
  { id: 'rankings', label: 'Rankings' },
];

function matchSideLabel(side: string | null) {
  switch (side) {
    case 'winners':
      return 'WB';
    case 'losers':
      return 'LB';
    case 'grand_final':
      return 'GF';
    case 'reset':
      return 'Reset';
    default:
      return '';
  }
}

export function TournamentDoubleElimTabs({
  matches,
  participants,
  tournamentStatus,
  isAdmin,
  userId,
}: Props) {
  const [tab, setTab] = useState<Tab>('bracket');

  const standings = useMemo(
    () => computeTournamentStandings(participants, matches, tournamentStatus),
    [participants, matches, tournamentStatus],
  );

  const groups = useMemo(
    () => computeBracketGroups(participants, matches),
    [participants, matches],
  );

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-w-[7rem] flex-1 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'bracket' && (
        <BracketDoubleElim matches={matches} isAdmin={isAdmin} userId={userId} />
      )}

      {tab === 'groups' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Players grouped by winners bracket quarter — same pool that feeds each side of the tree.
          </p>
          {groups.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No groups yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50"
                >
                  <div className="border-b border-slate-800 bg-gradient-to-r from-slate-800/80 to-slate-900 px-4 py-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      {group.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {group.players.length} players · {group.matches.filter((m) => m.status === 'complete').length} matches played
                    </p>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-2 text-left">Player</th>
                        <th className="px-2 py-2 text-center">W</th>
                        <th className="px-4 py-2 text-center">L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.players.map((p) => (
                        <tr key={p.userId} className="border-b border-slate-800/80 last:border-0">
                          <td className="px-4 py-2.5 font-medium text-white">{p.username}</td>
                          <td className="px-2 py-2.5 text-center font-semibold tabular-nums text-emerald-400">
                            {p.wins}
                          </td>
                          <td className="px-4 py-2.5 text-center tabular-nums text-slate-400">
                            {p.losses}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {group.matches.length > 0 && (
                    <div className="border-t border-slate-800 px-4 py-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Pool matches
                      </p>
                      <ul className="space-y-1.5">
                        {group.matches.slice(0, 8).map((m) => {
                          const tag = matchSideLabel(m.bracketSide);
                          return (
                            <li
                              key={m.id}
                              className="flex items-center justify-between gap-2 text-xs text-slate-300"
                            >
                              <span className="min-w-0 truncate">
                                {tag && (
                                  <span className="mr-1.5 text-[10px] font-bold text-slate-500">
                                    [{tag}]
                                  </span>
                                )}
                                {m.player1?.username ?? 'TBD'} vs {m.player2?.username ?? 'TBD'}
                              </span>
                              <span className="shrink-0 tabular-nums text-slate-500">
                                {m.status === 'complete' ? (m.score ?? 'Done') : '—'}
                              </span>
                            </li>
                          );
                        })}
                        {group.matches.length > 8 && (
                          <li className="text-xs text-slate-500">
                            +{group.matches.length - 8} more matches
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'rankings' && (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="w-10 px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  #
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Player
                </th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  W
                </th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  L
                </th>
                <th className="hidden px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:table-cell">
                  Seed
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr
                  key={s.userId}
                  className={`border-b border-slate-800 last:border-0 ${
                    i < 3 && s.status !== 'Eliminated' ? 'bg-brand-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 tabular-nums text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-semibold text-white">{s.username}</td>
                  <td className="px-4 py-2.5 text-center font-bold tabular-nums text-emerald-400">
                    {s.wins}
                  </td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-400">{s.losses}</td>
                  <td className="hidden px-4 py-2.5 text-center tabular-nums text-slate-400 sm:table-cell">
                    {s.seed ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(s.status)}`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
