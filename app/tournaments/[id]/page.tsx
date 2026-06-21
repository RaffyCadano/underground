import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TournamentActions } from './tournament-actions';
import { ParticipantManager } from './participant-manager';
import { BracketTree } from './bracket-tree';
import { BracketSwiss } from './bracket-swiss';
import { TournamentDoubleElimTabs } from './tournament-double-elim-tabs';
import { TournamentFormatGuide } from './tournament-format-guide';
import { isGroupStageComplete } from '@/lib/group-stage';

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

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      participants: {
        orderBy: [{ seed: 'asc' }, { createdAt: 'asc' }],
        include: { user: { select: { id: true, username: true, rankPoints: true } } },
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

  const isLoggedIn = !!session;
  const isAdmin = session?.user.role === 'admin';
  const isJoined = session
    ? tournament.participants.some((p) => p.userId === session.user.id)
    : false;

  // Group matches by round
  const roundMap = new Map<number, typeof tournament.matches>();
  for (const m of tournament.matches) {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(m);
  }
  const sortedRounds = Array.from(roundMap.entries()).sort((a, b) => a[0] - b[0]);
  const totalRounds = sortedRounds.length;

  const pendingMatches = tournament.matches.filter(
    (m) => m.status === 'pending' && m.player1Id && m.player2Id,
  );
  const completedMatches = tournament.matches.filter((m) => m.status === 'complete');

  const currentRound = sortedRounds.length > 0 ? sortedRounds[sortedRounds.length - 1][0] : 0;
  const currentRoundMatches = roundMap.get(currentRound) ?? [];
  const allCurrentRoundComplete =
    currentRoundMatches.length > 0 && currentRoundMatches.every((m) => m.status === 'complete');

  const canManagePlayers = tournament.status === 'open' && tournament.matches.length === 0;
  const hasBracket = tournament.matches.length > 0;
  const groupStageComplete = isGroupStageComplete(tournament.matches);

  const availableUsers =
    isAdmin && canManagePlayers
      ? await prisma.user.findMany({
          where: {
            id: { notIn: tournament.participants.map((p) => p.userId) },
          },
          orderBy: { username: 'asc' },
          select: { id: true, username: true, rankPoints: true },
        })
      : [];

  return (
    <div className="w-full">
      <div className="border-b border-slate-800 bg-slate-950/80">
        <div className="container flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="badge">Tournament</span>
            <h1 className="mt-2 text-2xl font-semibold text-white">{tournament.name}</h1>
            {tournament.description && (
              <p className="mt-2 text-sm text-slate-300">{tournament.description}</p>
            )}
          </div>
          <Link href="/tournaments" className="btn-secondary shrink-0">
            Back to tournaments
          </Link>
        </div>
      </div>

      <div className="container flex min-h-0 flex-col gap-6 pb-10 pt-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="card p-5">
            <div className="space-y-4">
              {[
                { label: 'Date', value: tournament.date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) },
                { label: 'Location', value: tournament.location ?? 'TBD' },
                { label: 'Format', value: FORMAT_LABELS[tournament.format] ?? tournament.format },
                { label: 'Status', value: tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1) },
                { label: 'Players', value: `${tournament.participants.length} registered` },
                ...(tournament.format === 'double_elimination' && tournament.groupStageEnabled
                  ? [
                      {
                        label: 'Structure',
                        value: `Groups of ${tournament.groupSize} → top ${tournament.advancePerGroup} advance`,
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
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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
          />

          {tournament.status !== 'complete' && (
            <div className="card p-5 empty:hidden">
              <TournamentActions
                tournamentId={tournament.id}
                tournamentStatus={tournament.status}
                tournamentFormat={tournament.format}
                participantCount={tournament.participants.length}
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
              />
              {!isLoggedIn && tournament.status === 'open' && (
                <p className="mt-3 text-xs text-slate-400">
                  <Link href="/login" className="text-brand-300 hover:text-brand-200">Sign in</Link> to register.
                </p>
              )}
            </div>
          )}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="card p-6">
            {sortedRounds.length > 0 ? (
              tournament.format === 'swiss' || tournament.format === 'round_robin' ? (
                <BracketSwiss
                  rounds={sortedRounds}
                  participants={tournament.participants}
                  allMatches={tournament.matches}
                  isAdmin={isAdmin}
                  userId={session?.user.id ?? null}
                />
              ) : tournament.format === 'double_elimination' ? (
                <TournamentDoubleElimTabs
                  matches={tournament.matches}
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
              )
            ) : canManagePlayers ? (
              <ParticipantManager
                tournamentId={tournament.id}
                participants={tournament.participants}
                availableUsers={availableUsers}
                isAdmin={isAdmin}
                canManage={canManagePlayers}
              />
            ) : tournament.status === 'open' ? (
              <div className="card-muted p-10 text-center text-slate-400">
                Bracket will be generated once registration closes.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
