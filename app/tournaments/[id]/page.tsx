import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournament } from '@/lib/tournament-host';
import { TournamentActions } from './tournament-actions';
import { ParticipantManager, TournamentParticipantList } from './participant-manager';
import { BracketTree } from './bracket-tree';
import { BracketSwiss } from './bracket-swiss';
import { BracketShareActions } from './bracket-share-actions';
import { TournamentDoubleElimTabs } from './tournament-double-elim-tabs';
import { TournamentStagedTabs } from './tournament-staged-tabs';
import { TournamentFormatGuide } from './tournament-format-guide';
import { isGroupStageComplete } from '@/lib/group-stage';
import { GAME_TYPE_LABELS } from '@/lib/tournament-options';
import {
  formatPlayerCapLabel,
  isTournamentFull,
  tournamentPlayerPickerWhere,
} from '@/lib/tournament-registration';
import { canResetBracketForRoster } from '@/lib/tournament-roster';
import { TournamentDescriptionContent } from '@/app/components/tournament-description-content';
import { TournamentHero } from './tournament-hero';
import { TournamentCreatedToast } from './tournament-created-toast';
import { TournamentUpdatedToast } from './tournament-updated-toast';
import { swissScoringFromTournament } from '@/lib/swiss-scoring';
import { parseRoundRobinRankBy } from '@/lib/tournament-options';
import { formatUsdDisplay } from '@/lib/money';
import { buildPlayerNameMap } from '@/lib/tournament-participant';

export const dynamic = 'force-dynamic';

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

export default async function TournamentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      createdBy: { select: { username: true } },
      participants: {
        orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
        include: { user: { select: { id: true, username: true, rankPoints: true, role: true } } },
      },
      matches: {
        orderBy: [{ round: 'asc' }, { matchIndex: 'asc' }],
        include: {
          player1: { select: { id: true, username: true } },
          player2: { select: { id: true, username: true } },
          winner: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!tournament) notFound();

  const playerNames = buildPlayerNameMap(tournament.participants);

  function displayPlayer(player: { id: string; username: string } | null) {
    if (!player) return null;
    return { ...player, username: playerNames[player.id] ?? player.username };
  }

  const displayMatches = tournament.matches.map((match) => ({
    ...match,
    player1: displayPlayer(match.player1),
    player2: displayPlayer(match.player2),
    winner: displayPlayer(match.winner),
  }));

  const isLoggedIn = !!session;
  const isAdmin = canManageTournament(
    tournament,
    session?.user.id,
    session?.user.role ?? '',
  );
  const isJoined = session
    ? tournament.participants.some((p) => p.userId === session.user.id)
    : false;

  // Group matches by round
  const roundMap = new Map<number, typeof displayMatches>();
  for (const m of displayMatches) {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(m);
  }
  const sortedRounds = Array.from(roundMap.entries()).sort((a, b) => a[0] - b[0]);
  const totalRounds = sortedRounds.length;

  const pendingMatches = displayMatches.filter(
    (m) => m.status === 'pending' && m.player1Id && m.player2Id,
  );
  const completedMatches = displayMatches.filter((m) => m.status === 'complete');

  const currentRound = sortedRounds.length > 0 ? sortedRounds[sortedRounds.length - 1][0] : 0;
  const currentRoundMatches = roundMap.get(currentRound) ?? [];
  const allCurrentRoundComplete =
    currentRoundMatches.length > 0 && currentRoundMatches.every((m) => m.status === 'complete');

  const canManagePlayers = tournament.status === 'open' && displayMatches.length === 0;
  const hasBracket = displayMatches.length > 0;
  const canResetRoster = isAdmin && canResetBracketForRoster(displayMatches);
  const groupStageComplete = isGroupStageComplete(displayMatches);

  const availableUsers =
    isAdmin && canManagePlayers
      ? await prisma.user.findMany({
          where: tournamentPlayerPickerWhere(tournament.participants.map((p) => p.userId)),
          orderBy: { username: 'asc' },
          select: { id: true, username: true, rankPoints: true },
        })
      : [];

  return (
    <div className="w-full">
      <TournamentCreatedToast tournamentName={tournament.name} enabled={isAdmin} />
      <TournamentUpdatedToast tournamentName={tournament.name} enabled={isAdmin} />
      <TournamentHero
        name={tournament.name}
        status={tournament.status}
        format={tournament.format}
        gameType={tournament.gameType}
        isRanked={tournament.isRanked}
        date={tournament.date}
        location={tournament.location}
        checkInTime={tournament.checkInTime}
        eventStartTime={tournament.eventStartTime}
        participantCount={tournament.participants.length}
        playerCap={tournament.playerCap}
        entryFee={tournament.entryFee}
        prizePool={tournament.prizePool}
        tournamentId={tournament.id}
        organizerUsername={tournament.createdBy?.username ?? null}
        isLoggedIn={isLoggedIn}
        isJoined={isJoined}
        isAdmin={isAdmin}
      />

      <div className="container flex min-h-0 flex-col gap-4 pb-8 pt-4 sm:gap-6 sm:pb-10 sm:pt-6 lg:flex-row lg:items-start">
        <aside className="order-2 w-full min-w-0 shrink-0 lg:order-1 lg:w-72 xl:w-80">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="card p-4 sm:p-5">
              <div className="mb-4 border-b border-slate-800 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Bracket info</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1 lg:gap-y-4">
                {[
                  { label: 'Format', value: FORMAT_LABELS[tournament.format] ?? tournament.format },
                  { label: 'Status', value: tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1) },
                  { label: 'Players', value: formatPlayerCapLabel(tournament.participants.length, tournament.playerCap) },
                  { label: 'Game', value: GAME_TYPE_LABELS[tournament.gameType] ?? tournament.gameType },
                  { label: 'Ranking', value: tournament.isRanked ? 'Ranked' : 'Unranked' },
                  ...(tournament.entryFee
                    ? [{ label: 'Entry fee', value: formatUsdDisplay(tournament.entryFee) }]
                    : []),
                  ...(tournament.prizePool
                    ? [{ label: 'Prize pool', value: formatUsdDisplay(tournament.prizePool) }]
                    : []),
                  ...(tournament.groupStageEnabled
                    ? [
                        {
                          label: 'Structure',
                          value: `Groups of ${tournament.groupSize} → top ${tournament.advancePerGroup} advance`,
                          wide: true,
                        },
                      ]
                    : []),
                  ...(tournament.format === 'double_elimination'
                    ? [
                        {
                          label: 'Grand finals',
                          value:
                            tournament.grandFinalsModifier === 'single_match'
                              ? 'Single match'
                              : tournament.grandFinalsModifier === 'skip'
                                ? 'Skipped (WB champ wins)'
                                : 'Default + bracket reset',
                          wide: true,
                        },
                      ]
                    : []),
                  ...(tournament.phase
                    ? [
                        {
                          label: 'Phase',
                          value:
                            tournament.phase === 'group'
                              ? 'Group stage'
                              : tournament.phase === 'playoffs'
                                ? 'Playoffs'
                                : tournament.phase,
                        },
                      ]
                    : []),
                ].map(({ label, value, wide }: { label: string; value: string; wide?: boolean }) => (
                  <div key={label} className={`min-w-0 ${wide ? 'col-span-2 lg:col-span-1' : ''}`}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 sm:text-[11px]">{label}</p>
                    <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <TournamentFormatGuide
              format={tournament.format}
              status={tournament.status}
              hasBracket={hasBracket}
              isAdmin={isAdmin}
              groupStageEnabled={tournament.groupStageEnabled}
              phase={tournament.phase}
              grandFinalsModifier={tournament.grandFinalsModifier}
              groupSize={tournament.groupSize}
              advancePerGroup={tournament.advancePerGroup}
              swissScoring={swissScoringFromTournament(tournament)}
              roundRobinRankBy={tournament.roundRobinRankBy}
            />

            {tournament.status !== 'complete' && (
              <div className="card overflow-hidden empty:hidden md:col-span-2 lg:col-span-1">
                <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3.5 sm:px-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Actions</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {tournament.status === 'open' ? 'Registration open' : 'Tournament in progress'}
                  </p>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <TournamentActions
                    tournamentId={tournament.id}
                    tournamentStatus={tournament.status}
                    tournamentFormat={tournament.format}
                    participantCount={tournament.participants.length}
                    playerCap={tournament.playerCap}
                    isRanked={tournament.isRanked}
                    groupStageEnabled={tournament.groupStageEnabled}
                    phase={tournament.phase}
                    groupStageComplete={groupStageComplete}
                    isJoined={isJoined}
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    userId={session?.user.id ?? null}
                    pendingMatches={pendingMatches}
                    completedMatches={completedMatches}
                    currentRound={currentRound}
                    allCurrentRoundComplete={allCurrentRoundComplete}
                    canResetRoster={canResetRoster}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="order-1 min-w-0 flex-1 space-y-4 sm:space-y-6 lg:order-2">
          {tournament.description && (
            <div className="card overflow-hidden">
              <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3.5 sm:px-5 sm:py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">About</p>
                <h2 className="mt-0.5 text-sm font-semibold text-white">Event details</h2>
              </div>
              <div className="p-4 sm:p-6">
                <TournamentDescriptionContent content={tournament.description} featured />
              </div>
            </div>
          )}

          <div className="card p-4 sm:p-6" id="tournament-bracket-print">
            {sortedRounds.length > 0 ? (
              <>
                {tournament.format !== 'double_elimination' && (
                  <div className="mb-5 flex justify-end">
                    <BracketShareActions tournamentId={tournament.id} />
                  </div>
                )}
                {tournament.groupStageEnabled && tournament.format !== 'double_elimination' ? (
                  <TournamentStagedTabs
                    tournamentId={tournament.id}
                    format={tournament.format}
                    phase={tournament.phase}
                    groupSize={tournament.groupSize}
                    advancePerGroup={tournament.advancePerGroup}
                    matches={displayMatches}
                    participants={tournament.participants}
                    tournament={tournament}
                    isAdmin={isAdmin}
                    userId={session?.user.id ?? null}
                  />
                ) : tournament.format === 'swiss' || tournament.format === 'round_robin' ? (
                <BracketSwiss
                  rounds={sortedRounds}
                  participants={tournament.participants}
                  allMatches={displayMatches}
                  isAdmin={isAdmin}
                  userId={session?.user.id ?? null}
                  scoring={
                    tournament.format === 'swiss'
                      ? swissScoringFromTournament(tournament)
                      : undefined
                  }
                  showSwissPoints={tournament.format === 'swiss'}
                  roundRobinRankBy={
                    tournament.format === 'round_robin'
                      ? parseRoundRobinRankBy(tournament.roundRobinRankBy)
                      : undefined
                  }
                />
              ) : tournament.format === 'double_elimination' ? (
                <TournamentDoubleElimTabs
                  tournamentId={tournament.id}
                  matches={displayMatches}
                  participants={tournament.participants}
                  tournamentStatus={tournament.status}
                  phase={tournament.phase}
                  groupStageEnabled={tournament.groupStageEnabled}
                  groupSize={tournament.groupSize}
                  advancePerGroup={tournament.advancePerGroup}
                  grandFinalsModifier={tournament.grandFinalsModifier}
                  isAdmin={isAdmin}
                  userId={session?.user.id ?? null}
                />
              ) : (
                <BracketTree
                  rounds={sortedRounds}
                  format={tournament.format}
                  isAdmin={isAdmin}
                  userId={session?.user.id ?? null}
                  interactive
                />
              )}
              </>
            ) : isAdmin && canManagePlayers ? (
              <ParticipantManager
                tournamentId={tournament.id}
                participants={tournament.participants}
                availableUsers={availableUsers}
                isAdmin={isAdmin}
                canManage={canManagePlayers}
              />
            ) : (
              <TournamentParticipantList participants={tournament.participants} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
