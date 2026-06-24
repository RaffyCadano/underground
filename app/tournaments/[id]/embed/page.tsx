import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { AdcashEmbedStrip } from '@/app/components/adcash-embed-strip';
import { getViewerShowAds } from '@/lib/ads';
import { prisma } from '@/lib/prisma';
import { BracketTree } from '@/app/tournaments/[id]/bracket-tree';
import { BracketSwiss } from '@/app/tournaments/[id]/bracket-swiss';
import { TournamentDoubleElimTabs } from '@/app/tournaments/[id]/tournament-double-elim-tabs';
import { buildPlayerNameMap } from '@/lib/tournament-participant';
import { SITE_NAME } from '@/lib/site';
import { swissScoringFromTournament } from '@/lib/swiss-scoring';
import { parseRoundRobinRankBy } from '@/lib/tournament-options';

export const dynamic = 'force-dynamic';

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

export default async function TournamentEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const showAds = await getViewerShowAds();

  const tournament = await prisma.tournament.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
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

  const roundMap = new Map<number, typeof displayMatches>();
  for (const match of displayMatches) {
    if (!roundMap.has(match.round)) roundMap.set(match.round, []);
    roundMap.get(match.round)!.push(match);
  }
  const sortedRounds = Array.from(roundMap.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="flex min-h-screen flex-col">
      {showAds && (
        <Script
          id="aclib-embed"
          src="https://acscdn.com/script/aclib.js"
          strategy="afterInteractive"
        />
      )}
      {showAds && <AdcashEmbedStrip slot="top" />}
      <div className="flex-1 p-4 sm:p-6" id="tournament-bracket-print">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {SITE_NAME} bracket
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">{tournament.name}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {FORMAT_LABELS[tournament.format] ?? tournament.format}
          </p>
        </div>
        <Link
          href={`/tournaments/${tournament.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-brand-300 hover:text-brand-200"
        >
          View on {SITE_NAME}
        </Link>
      </div>

      {sortedRounds.length > 0 ? (
        tournament.format === 'swiss' || tournament.format === 'round_robin' ? (
          <BracketSwiss
            rounds={sortedRounds}
            participants={tournament.participants}
            allMatches={displayMatches}
            isAdmin={false}
            userId={null}
            scoring={
              tournament.format === 'swiss' ? swissScoringFromTournament(tournament) : undefined
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
            isAdmin={false}
            userId={null}
            showShareActions={false}
          />
        ) : (
          <BracketTree
            rounds={sortedRounds}
            format={tournament.format}
            isAdmin={false}
            userId={null}
            interactive={false}
          />
        )
      ) : (
        <p className="py-10 text-center text-sm text-slate-500">Bracket not generated yet.</p>
      )}
      </div>
      {showAds && <AdcashEmbedStrip slot="bottom" />}
    </div>
  );
}
