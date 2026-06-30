'use client';

import { useMemo, useState } from 'react';
import { BracketDoubleElim } from './bracket-double-elim';
import { BracketShareActions } from './bracket-share-actions';
import { GroupStagePanel } from './group-stage-panel';
import { TournamentPodium } from './tournament-podium';
import { buildGroupStageView } from '@/lib/group-stage';
import {
  computeTournamentPodium,
  computeTournamentStandings,
  statusBadgeClass,
  type TournamentMatch,
  type TournamentParticipant,
} from '@/lib/tournament-stats';
import { isWalkInDisplay } from '@/lib/tournament-participant';

type MainTab = 'bracket' | 'groups' | 'rankings';
type BracketView = 'full' | 'winners' | 'losers';

type Props = {
  tournamentId: string;
  matches: TournamentMatch[];
  participants: TournamentParticipant[];
  tournamentStatus: string;
  phase: string | null;
  groupStageEnabled: boolean;
  groupSize: number;
  advancePerGroup: number;
  grandFinalsModifier: string;
  isAdmin: boolean;
  userId: string | null;
  showShareActions?: boolean;
};

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'bracket', label: 'Bracket' },
  { id: 'groups', label: 'Group Stage' },
  { id: 'rankings', label: 'Standings' },
];

const BRACKET_VIEWS: { id: BracketView; label: string }[] = [
  { id: 'full', label: 'Full Bracket' },
  { id: 'winners', label: 'Winners Bracket' },
  { id: 'losers', label: 'Losers Bracket' },
];

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  size = 'md',
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-1 ${
        size === 'sm' ? 'mb-4' : 'mb-5'
      }`}
    >
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`whitespace-nowrap rounded-lg font-semibold transition ${
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'min-w-[7rem] flex-1 px-3 py-2.5 text-sm'
          } ${
            active === id
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function TournamentDoubleElimTabs({
  tournamentId,
  matches,
  participants,
  tournamentStatus,
  phase,
  groupStageEnabled,
  groupSize,
  advancePerGroup,
  grandFinalsModifier,
  isAdmin,
  userId,
  showShareActions = true,
}: Props) {
  const inGroupPhase = phase === 'group';
  const hasPlayoffs = matches.some(
    (m) => m.bracketSide === 'winners' || m.bracketSide === 'losers',
  );

  const [mainTab, setMainTab] = useState<MainTab>(
    inGroupPhase ? 'groups' : 'bracket',
  );
  const [bracketView, setBracketView] = useState<BracketView>('full');

  const standings = useMemo(
    () => computeTournamentStandings(participants, matches, tournamentStatus),
    [participants, matches, tournamentStatus],
  );

  const walkInUserIds = useMemo(
    () => new Set(participants.filter(isWalkInDisplay).map((p) => p.userId)),
    [participants],
  );

  const podium = useMemo(
    () =>
      computeTournamentPodium(
        matches,
        tournamentStatus,
        'double_elimination',
        grandFinalsModifier,
      ),
    [matches, tournamentStatus, grandFinalsModifier],
  );

  const groupCount = Math.ceil(participants.length / groupSize);
  const groups = useMemo(() => {
    if (!groupStageEnabled) return [];
    return buildGroupStageView(groupCount, participants, matches);
  }, [groupStageEnabled, groupCount, participants, matches]);

  const visibleMainTabs = MAIN_TABS.filter((t) => {
    if (t.id === 'groups') return groupStageEnabled;
    if (t.id === 'bracket') return hasPlayoffs || !inGroupPhase;
    return true;
  });

  const gfLabel =
    grandFinalsModifier === 'single_match'
      ? 'Single grand final'
      : grandFinalsModifier === 'skip'
        ? 'No grand final (WB champ wins)'
        : 'Grand final + bracket reset';

  return (
    <div>
      {tournamentStatus === 'complete' && podium.length > 0 && (
        <TournamentPodium entries={podium} walkInUserIds={walkInUserIds} />
      )}

      <TabBar tabs={visibleMainTabs} active={mainTab} onChange={setMainTab} />

      {mainTab === 'bracket' && (
        <>
          {hasPlayoffs ? (
            <>
              <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-1 print:hidden">
                {BRACKET_VIEWS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBracketView(id)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      bracketView === id
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {showShareActions && (
                  <div className="ml-auto flex shrink-0 items-center gap-2 border-l border-slate-800 pl-2">
                    <BracketShareActions tournamentId={tournamentId} inline />
                  </div>
                )}
              </div>
              <p className="mb-4 text-xs text-slate-500">{gfLabel}</p>
              <BracketDoubleElim
                matches={matches}
                participants={participants}
                isAdmin={isAdmin}
                userId={userId}
                view={bracketView}
              />
            </>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Playoffs bracket will appear after the group stage completes.
            </p>
          )}
        </>
      )}

      {mainTab === 'groups' && groupStageEnabled && (
        <GroupStagePanel
          groups={groups}
          isAdmin={isAdmin}
          userId={userId}
          advancePerGroup={advancePerGroup}
        />
      )}

      {mainTab === 'rankings' && (
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
