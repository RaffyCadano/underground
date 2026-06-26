'use client';

import { useMemo, useState } from 'react';
import { BracketTree, type BracketMatch } from './bracket-tree';
import { BracketShareActions } from './bracket-share-actions';
import { TournamentPodium } from './tournament-podium';
import {
  computeTournamentPodium,
  computeTournamentStandings,
  statusBadgeClass,
  type TournamentMatch,
  type TournamentParticipant,
} from '@/lib/tournament-stats';
import { isWalkInDisplay } from '@/lib/tournament-participant';

type Tab = 'bracket' | 'standings';

type Props = {
  tournamentId: string;
  rounds: [number, BracketMatch[]][];
  matches: TournamentMatch[];
  participants: TournamentParticipant[];
  tournamentStatus: string;
  isAdmin: boolean;
  userId: string | null;
  showShareActions?: boolean;
};

export function TournamentSingleElimTabs({
  tournamentId,
  rounds,
  matches,
  participants,
  tournamentStatus,
  isAdmin,
  userId,
  showShareActions = true,
}: Props) {
  const [tab, setTab] = useState<Tab>('bracket');

  const standings = useMemo(
    () => computeTournamentStandings(participants, matches, tournamentStatus, 'single_elimination'),
    [participants, matches, tournamentStatus],
  );

  const walkInUserIds = useMemo(
    () => new Set(participants.filter(isWalkInDisplay).map((p) => p.userId)),
    [participants],
  );

  const podium = useMemo(
    () => computeTournamentPodium(matches, tournamentStatus, 'single_elimination'),
    [matches, tournamentStatus],
  );

  return (
    <div>
      {tournamentStatus === 'complete' && podium.length > 0 && (
        <TournamentPodium entries={podium} walkInUserIds={walkInUserIds} />
      )}

      {showShareActions && (
        <div className="mb-4 flex justify-end print:hidden">
          <BracketShareActions tournamentId={tournamentId} />
        </div>
      )}

      <div className="mb-5 flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
        {(['bracket', 'standings'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
              tab === t
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'bracket' ? 'Bracket' : 'Standings'}
          </button>
        ))}
      </div>

      {tab === 'bracket' && (
        <BracketTree
          rounds={rounds}
          format="single_elimination"
          isAdmin={isAdmin}
          userId={userId}
          interactive
        />
      )}

      {tab === 'standings' && (
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
