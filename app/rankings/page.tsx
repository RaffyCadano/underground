import Link from 'next/link';
import { ArrowRight, BarChart3, Crown, Medal, Swords, Target, Trophy, Users } from 'lucide-react';
import { ListSearch } from '@/app/components/list-search';
import { Pagination } from '@/app/components/pagination';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { prisma } from '@/lib/prisma';
import { parsePageParam, RANKINGS_PAGE_SIZE, totalPages } from '@/lib/pagination';
import {
  rankedPlayerOrderBy,
  rankedPlayerSelect,
  rankedPlayerWithPointsWhere,
  rankingsListWhere,
} from '@/lib/rankings';
import { playerProfilePath } from '@/lib/player-profile';
import { parseSearchQuery } from '@/lib/search';

type RankedPlayer = {
  id: string;
  username: string;
  avatar: string | null;
  rankPoints: number;
  wins: number;
  losses: number;
};

function rankBadge(rank: number) {
  if (rank === 1) {
    return {
      className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: Crown,
    };
  }
  if (rank === 2) {
    return {
      className: 'bg-slate-400/10 text-slate-300 border-slate-500/30',
      icon: Medal,
    };
  }
  if (rank === 3) {
    return {
      className: 'bg-amber-700/15 text-amber-500 border-amber-700/30',
      icon: Medal,
    };
  }
  return {
    className: 'bg-slate-800 text-slate-500 border-slate-700',
    icon: null,
  };
}

function PodiumCard({
  player,
  rank,
  highlight = false,
}: {
  player: RankedPlayer;
  rank: number;
  highlight?: boolean;
}) {
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;
  const badge = rankBadge(rank);
  const BadgeIcon = badge.icon;

  return (
    <Link
      href={playerProfilePath(player.username)}
      className={`group relative block min-w-0 overflow-hidden rounded-2xl border bg-slate-900/60 p-4 transition hover:border-slate-600 sm:p-6 ${
        highlight
          ? 'border-brand-500/30 shadow-lg shadow-brand-950/15 lg:-mt-4 lg:pb-8'
          : 'border-slate-800'
      }`}
    >
      {highlight && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      )}
      <div className="flex flex-col items-center text-center">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold sm:h-10 sm:w-10 ${badge.className}`}
        >
          {BadgeIcon ? (
            <>
              <BadgeIcon size={16} className="sm:hidden" />
              <BadgeIcon size={18} className="hidden sm:block" />
            </>
          ) : (
            rank
          )}
        </span>
        <PlayerAvatar
          username={player.username}
          avatar={player.avatar}
          size="lg"
          className="mt-2 sm:mt-3"
        />
        <h3 className="mt-2 max-w-full truncate px-2 text-base font-semibold text-white transition group-hover:text-brand-200 sm:mt-3 sm:text-lg">
          {player.username}
        </h3>
        <p className="mt-1 text-xl font-semibold tabular-nums text-brand-300 sm:text-2xl">
          {player.rankPoints.toLocaleString()}
          <span className="ml-1 text-xs font-normal text-slate-500 sm:text-sm">pts</span>
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-slate-400 sm:mt-4 sm:gap-4">
          <span>
            {player.wins}-{player.losses} W-L
          </span>
          <span>{total > 0 ? `${winRate}%` : '—'} win</span>
        </div>
      </div>
    </Link>
  );
}

function LeaderboardMobileCard({ player, rank }: { player: RankedPlayer; rank: number }) {
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;
  const badge = rankBadge(rank);

  return (
    <Link
      href={playerProfilePath(player.username)}
      className="block px-4 py-3.5 transition hover:bg-slate-900/50 sm:px-5"
    >
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${badge.className}`}
        >
          {rank}
        </span>
        <PlayerAvatar username={player.username} avatar={player.avatar} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{player.username}</p>
          <p className="text-xs tabular-nums text-slate-500">
            {player.wins}-{player.losses} · {total > 0 ? `${winRate}%` : '—'} win
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-brand-300">
            {player.rankPoints.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">pts</p>
        </div>
        <div className="col-span-4 flex items-center gap-2 sm:col-span-4">
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500/70"
              style={{ width: total > 0 ? `${winRate}%` : '0%' }}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-400">
            {total > 0 ? `${winRate}%` : '—'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function LeaderboardTableRow({ player, rank }: { player: RankedPlayer; rank: number }) {
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;
  const badge = rankBadge(rank);

  return (
    <tr className="transition hover:bg-slate-900/50">
      <td className="px-4 py-4 sm:px-6">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${badge.className}`}
        >
          {rank}
        </span>
      </td>
      <td className="px-4 py-4 sm:px-6">
        <Link
          href={playerProfilePath(player.username)}
          className="group inline-flex min-w-0 items-center gap-3"
        >
          <PlayerAvatar username={player.username} avatar={player.avatar} />
          <span className="truncate font-semibold text-white transition group-hover:text-brand-300">
            {player.username}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 sm:px-6">
        <span className="font-semibold tabular-nums text-brand-300">
          {player.rankPoints.toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-4 tabular-nums text-slate-300 sm:px-6">
        {player.wins}-{player.losses}
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="flex min-w-[100px] items-center gap-3 sm:min-w-[120px]">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500/70 transition-all"
              style={{ width: total > 0 ? `${winRate}%` : '0%' }}
            />
          </div>
          <span className="w-10 shrink-0 text-right tabular-nums text-slate-400">
            {total > 0 ? `${winRate}%` : '—'}
          </span>
        </div>
      </td>
    </tr>
  );
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q: qParam } = await searchParams;
  const query = parseSearchQuery(qParam);
  const isSearching = query.length > 0;
  const listWhere = rankingsListWhere(query);

  const globalTotal = await prisma.user.count({ where: rankedPlayerWithPointsWhere });
  const filteredTotal = await prisma.user.count({ where: listWhere });

  const pages = totalPages(filteredTotal, RANKINGS_PAGE_SIZE);
  const page = parsePageParam(pageParam, pages);
  const skip = (page - 1) * RANKINGS_PAGE_SIZE;

  const [topThree, players, pointsAgg, totalMatches] = await Promise.all([
    isSearching
      ? Promise.resolve([])
      : prisma.user.findMany({
          where: rankedPlayerWithPointsWhere,
          orderBy: rankedPlayerOrderBy,
          take: 3,
          select: rankedPlayerSelect,
        }),
    prisma.user.findMany({
      where: listWhere,
      orderBy: rankedPlayerOrderBy,
      skip,
      take: RANKINGS_PAGE_SIZE,
      select: rankedPlayerSelect,
    }),
    prisma.user.aggregate({
      where: rankedPlayerWithPointsWhere,
      _sum: { rankPoints: true },
    }),
    prisma.match.count({ where: { status: 'complete' } }),
  ]);

  const leader = topThree[0];
  const totalPoints = pointsAgg._sum.rankPoints ?? 0;

  const stats = [
    { label: 'Ranked bladers', shortLabel: 'Bladers', value: globalTotal.toLocaleString(), icon: Users },
    { label: 'Top score', shortLabel: 'Top', value: leader ? leader.rankPoints.toLocaleString() : '0', icon: Trophy },
    { label: 'Matches played', shortLabel: 'Matches', value: totalMatches.toLocaleString(), icon: Swords },
    { label: 'Points awarded', shortLabel: 'Points', value: totalPoints.toLocaleString(), icon: Target },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero */}
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <ScrollReveal className="max-w-2xl space-y-3 sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <BarChart3 size={12} />
              UGNCBBX circuit
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Rankings
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Track rank points, records, and win rates for every blader on the UGNCBBX leaderboard.
            </p>
          </ScrollReveal>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ label, shortLabel, value, icon: Icon }, index) => (
              <ScrollReveal key={label} delay={120 + index * 70} direction="scale">
                <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-brand-400 sm:h-9 sm:w-9">
                    <Icon size={15} className="sm:hidden" />
                    <Icon size={16} className="hidden sm:block" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold tabular-nums text-white sm:text-lg">{value}</p>
                    <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                      <span className="sm:hidden">{shortLabel}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        {globalTotal === 0 ? (
          <ScrollReveal direction="scale">
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-5 py-12 text-center sm:px-8 sm:py-16">
            <BarChart3 size={36} className="mx-auto text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No ranked points yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Compete in ranked tournaments to earn points and appear on the leaderboard.
            </p>
            <Link
              href="/register"
              className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              Create account
              <ArrowRight size={16} />
            </Link>
            </div>
          </ScrollReveal>
        ) : filteredTotal === 0 ? (
          <ScrollReveal direction="scale">
            <div className="space-y-5 sm:space-y-6">
              <ListSearch action="/rankings" query={query} placeholder="Search by username…" />
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-10 text-center sm:px-8 sm:py-14">
              <p className="text-base font-semibold text-white sm:text-lg">
                No players match &ldquo;{query}&rdquo;
              </p>
              <p className="mt-2 text-sm text-slate-400">Try a different username or clear the search.</p>
              <Link href="/rankings" className="btn-secondary mt-6 inline-flex w-full sm:w-auto">
                Clear search
              </Link>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {!isSearching && topThree.length > 0 && (
              <div>
                <ScrollReveal className="mb-5 text-center sm:mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Podium</p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Top bladers</h2>
                </ScrollReveal>

                {/* Mobile: rank order 1 → 2 → 3 */}
                <div className="grid gap-3 sm:hidden">
                  {topThree.map((p, i) => (
                    <ScrollReveal key={p.id} delay={i * 90} direction="scale">
                      <PodiumCard player={p} rank={i + 1} highlight={i === 0} />
                    </ScrollReveal>
                  ))}
                </div>

                {/* Tablet: stacked · Desktop: classic podium */}
                <div
                  className={`mx-auto hidden gap-4 sm:grid ${
                    topThree.length === 1
                      ? 'max-w-sm'
                      : topThree.length === 2
                        ? 'max-w-2xl sm:grid-cols-2'
                        : 'max-w-lg sm:grid-cols-1 lg:max-w-4xl lg:grid-cols-3 lg:items-end'
                  }`}
                >
                  {topThree.length === 3 ? (
                    <>
                      <ScrollReveal delay={120} direction="scale">
                        <PodiumCard player={topThree[1]} rank={2} />
                      </ScrollReveal>
                      <ScrollReveal delay={0} direction="scale">
                        <PodiumCard player={topThree[0]} rank={1} highlight />
                      </ScrollReveal>
                      <ScrollReveal delay={120} direction="scale">
                        <PodiumCard player={topThree[2]} rank={3} />
                      </ScrollReveal>
                    </>
                  ) : (
                    topThree.map((p, i) => (
                      <ScrollReveal key={p.id} delay={i * 90} direction="scale">
                        <PodiumCard player={p} rank={i + 1} highlight={i === 0} />
                      </ScrollReveal>
                    ))
                  )}
                </div>
              </div>
            )}

            <div>
              <ScrollReveal className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {isSearching ? 'Search results' : 'Full standings'}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    {isSearching
                      ? `${filteredTotal.toLocaleString()} ${filteredTotal === 1 ? 'player' : 'players'} found`
                      : 'Leaderboard'}
                  </h2>
                  {isSearching && (
                    <p className="mt-1 truncate text-sm text-slate-400">
                      Matching &ldquo;{query}&rdquo;
                    </p>
                  )}
                </div>
                <div className="w-full min-w-0 lg:max-w-md lg:shrink-0">
                  <ListSearch action="/rankings" query={query} placeholder="Search by username…" />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                  {/* Mobile + tablet card list */}
                  <div className="divide-y divide-slate-800 lg:hidden">
                    {players.map((p, i) => (
                      <ScrollReveal key={p.id} delay={i * 60}>
                        <LeaderboardMobileCard player={p} rank={skip + i + 1} />
                      </ScrollReveal>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-500">
                        <tr>
                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider sm:px-6">
                            Rank
                          </th>
                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider sm:px-6">
                            Player
                          </th>
                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider sm:px-6">
                            Points
                          </th>
                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider sm:px-6">
                            Record
                          </th>
                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider sm:px-6">
                            Win rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {players.map((p, i) => (
                          <LeaderboardTableRow key={p.id} player={p} rank={skip + i + 1} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination
                    page={page}
                    totalPages={pages}
                    totalItems={filteredTotal}
                    pageSize={RANKINGS_PAGE_SIZE}
                    pathname="/rankings"
                    query={query}
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
