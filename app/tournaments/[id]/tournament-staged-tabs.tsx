'use client';

import { useMemo, useState } from 'react';
import { BracketSwiss } from './bracket-swiss';
import { BracketTree } from './bracket-tree';
import { TournamentSingleElimTabs } from './tournament-single-elim-tabs';
import { BracketShareActions } from './bracket-share-actions';
import { GroupStagePanel } from './group-stage-panel';
import { buildGroupStageView } from '@/lib/group-stage';
import { parseRoundRobinRankBy } from '@/lib/tournament-options';
import { swissScoringFromTournament } from '@/lib/swiss-scoring';

type MainTab = 'groups' | 'final';

type Match = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: string;
  status: string;
  score: string | null;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  player1: { id: string; username: string } | null;
  player2: { id: string; username: string } | null;
  winner: { id: string; username: string } | null;
};

type Participant = {
  userId: string;
  groupId?: number | null;
  seed?: number | null;
  walkInName?: string | null;
  user: { id: string; username: string; rankPoints: number };
};

export function TournamentStagedTabs({
  tournamentId,
  format,
  phase,
  groupSize,
  advancePerGroup,
  matches,
  participants,
  tournament,
  tournamentStatus,
  isAdmin,
  userId,
}: {
  tournamentId: string;
  format: string;
  phase: string | null;
  groupSize: number;
  advancePerGroup: number;
  matches: Match[];
  participants: Participant[];
  tournament: {
    swissPointsPerMatchWin?: number | null;
    swissPointsPerMatchTie?: number | null;
    swissPointsPerGameWin?: number | null;
    swissPointsPerGameTie?: number | null;
    swissPointsPerBye?: number | null;
    roundRobinRankBy?: string | null;
  };
  tournamentStatus: string;
  isAdmin: boolean;
  userId: string | null;
}) {
  const inGroupPhase = phase === 'group';
  const playoffMatches = useMemo(
    () => matches.filter((m) => m.bracketSide !== 'group'),
    [matches],
  );
  const hasPlayoffs = playoffMatches.length > 0;
  const [mainTab, setMainTab] = useState<MainTab>(inGroupPhase ? 'groups' : 'final');

  const groupCount = Math.ceil(participants.length / groupSize);
  const groups = useMemo(
    () => buildGroupStageView(groupCount, participants, matches),
    [groupCount, participants, matches],
  );

  const playoffParticipants = useMemo(() => {
    if (!hasPlayoffs) return participants;
    const advancers = participants.filter((p) => p.seed != null);
    return advancers.length > 0 ? advancers : participants;
  }, [participants, hasPlayoffs]);

  const roundMap = new Map<number, typeof playoffMatches>();
  for (const m of playoffMatches) {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(m);
  }
  const sortedRounds = Array.from(roundMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, matches]) => [round, [...matches].sort((a, b) => a.matchIndex - b.matchIndex)] as [number, typeof playoffMatches]);

  const tabs: { id: MainTab; label: string }[] = [
    { id: 'groups', label: 'Group Stage' },
    { id: 'final', label: 'Final Stage' },
  ];

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMainTab(id)}
            disabled={id === 'final' && !hasPlayoffs}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mainTab === id
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            } ${id === 'final' && !hasPlayoffs ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mainTab === 'groups' && (
        <GroupStagePanel
          groups={groups}
          isAdmin={isAdmin}
          userId={userId}
          advancePerGroup={advancePerGroup}
        />
      )}

      {mainTab === 'final' && hasPlayoffs && format !== 'single_elimination' && (
        <div className="mb-5 flex justify-end">
          <BracketShareActions tournamentId={tournamentId} />
        </div>
      )}

      {mainTab === 'final' && hasPlayoffs && (
        <>
          {format === 'swiss' || format === 'round_robin' ? (
            <BracketSwiss
              rounds={sortedRounds}
              participants={playoffParticipants}
              allMatches={playoffMatches}
              isAdmin={isAdmin}
              userId={userId}
              scoring={format === 'swiss' ? swissScoringFromTournament(tournament) : undefined}
              showSwissPoints={format === 'swiss'}
              roundRobinRankBy={
                format === 'round_robin'
                  ? parseRoundRobinRankBy(tournament.roundRobinRankBy)
                  : undefined
              }
            />
          ) : format === 'single_elimination' ? (
            <TournamentSingleElimTabs
              tournamentId={tournamentId}
              rounds={sortedRounds}
              matches={playoffMatches}
              participants={playoffParticipants.map((p) => ({
                ...p,
                seed: p.seed ?? null,
              }))}
              tournamentStatus={tournamentStatus}
              isAdmin={isAdmin}
              userId={userId}
            />
          ) : (
            <BracketTree
              rounds={sortedRounds}
              format={format}
              isAdmin={isAdmin}
              userId={userId}
              interactive
            />
          )}
        </>
      )}

      {mainTab === 'final' && !hasPlayoffs && (
        <p className="text-sm text-slate-400">
          Final stage starts after group play finishes and an admin begins playoffs.
        </p>
      )}
    </div>
  );
}
