import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Crown,
  Medal,
  Swords,
  Target,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { ListSearch } from '@/app/components/list-search';
import { Pagination } from '@/app/components/pagination';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { prisma } from '@/lib/prisma';
import { parsePageParam, PLAYERS_PAGE_SIZE, totalPages } from '@/lib/pagination';
import { rankedPlayerOrderBy, rankedPlayerSelect, rankedPlayerWhere, rankedPlayerWithPointsWhere } from '@/lib/rankings';
import { playerProfilePath } from '@/lib/player-profile';
import { parseSearchQuery, playerSearchWhere } from '@/lib/search';

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
    return { className: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: Crown };
  }
  if (rank === 2) {
    return { className: 'bg-slate-400/10 text-slate-300 border-slate-500/30', icon: Medal };
  }
  if (rank === 3) {
    return { className: 'bg-amber-700/15 text-amber-500 border-amber-700/30', icon: Medal };
  }
  return { className: 'bg-slate-800 text-slate-500 border-slate-700', icon: null };
}

function SpotlightCard({
  player,
  rank,
  highlight = false,
}: {
  player: RankedPlayer;
  rank: number;
  highlight?: boolean;
}) {
  const badge = rankBadge(rank);
  const BadgeIcon = badge.icon;
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;

  return (
    <Link
      href={playerProfilePath(player.username)}
      className={`group block min-w-0 overflow-hidden rounded-2xl border bg-slate-900/60 p-4 transition hover:border-slate-600 sm:p-5 ${
        highlight ? 'border-brand-500/25 shadow-lg shadow-brand-950/10' : 'border-slate-800'
      }`}
    >
      {highlight && (
        <div className="mb-3 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent sm:mb-4" />
      )}
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold sm:h-9 sm:w-9 sm:text-sm ${badge.className}`}
        >
          {BadgeIcon ? (
            <>
              <BadgeIcon size={15} className="sm:hidden" />
              <BadgeIcon size={16} className="hidden sm:block" />
            </>
          ) : (
            rank
          )}
        </span>
        <PlayerAvatar username={player.username} avatar={player.avatar} size="lg" shape="rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white group-hover:text-brand-200">{player.username}</p>
          <p className="mt-0.5 text-sm tabular-nums text-brand-300">{player.rankPoints.toLocaleString()} pts</p>
        </div>
        <ArrowRight size={16} className="hidden shrink-0 text-slate-600 transition group-hover:text-brand-400 sm:block" />
      </div>
      <p className="mt-2.5 text-xs text-slate-500 sm:mt-3">
        {player.wins}-{player.losses} record · {total > 0 ? `${winRate}%` : '—'} win rate
      </p>
    </Link>
  );
}

function PlayerMobileCard({ player, rank }: { player: RankedPlayer; rank: number }) {
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;
  const badge = rankBadge(rank);
  const profileHref = playerProfilePath(player.username);

  return (
    <div className="px-4 py-3.5 sm:px-5">
      <Link href={profileHref} className="flex items-center gap-3 transition hover:opacity-90">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${badge.className}`}
        >
          {rank}
        </span>
        <PlayerAvatar username={player.username} avatar={player.avatar} />
        <div className="min-w-0 flex-1">
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
      </Link>
      <div className="mt-2.5 flex items-center gap-2 pl-11">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500/70"
            style={{ width: total > 0 ? `${winRate}%` : '0%' }}
          />
        </div>
        <Link
          href={profileHref}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-brand-300 hover:text-brand-200"
        >
          View
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function PlayerTableRow({ player, rank }: { player: RankedPlayer; rank: number }) {
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;
  const badge = rankBadge(rank);
  const profileHref = playerProfilePath(player.username);

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
        <Link href={profileHref} className="group inline-flex min-w-0 items-center gap-3">
          <PlayerAvatar username={player.username} avatar={player.avatar} />
          <span className="truncate font-semibold text-white transition group-hover:text-brand-300">
            {player.username}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 font-semibold tabular-nums text-brand-300 sm:px-6">
        {player.rankPoints.toLocaleString()}
      </td>
      <td className="px-4 py-4 tabular-nums text-slate-300 sm:px-6">
        {player.wins}-{player.losses}
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="flex min-w-[100px] items-center gap-3 sm:min-w-[120px]">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500/70"
              style={{ width: total > 0 ? `${winRate}%` : '0%' }}
            />
          </div>
          <span className="w-10 shrink-0 text-right tabular-nums text-slate-400">
            {total > 0 ? `${winRate}%` : '—'}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-right sm:px-6">
        <Link
          href={profileHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-300 transition hover:text-brand-200"
        >
          View
          <ArrowRight size={12} />
        </Link>
      </td>
    </tr>
  );
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q: qParam } = await searchParams;
  const query = parseSearchQuery(qParam);
  const isSearching = query.length > 0;
  const listWhere = playerSearchWhere(query);

  const globalTotal = await prisma.user.count({ where: rankedPlayerWhere });
  const filteredTotal = isSearching
    ? await prisma.user.count({ where: listWhere })
    : globalTotal;

  const pages = totalPages(filteredTotal, PLAYERS_PAGE_SIZE);
  const page = parsePageParam(pageParam, pages);
  const skip = (page - 1) * PLAYERS_PAGE_SIZE;
  const showSpotlight = !isSearching && page === 1;

  const [topThree, players, pointsAgg, totalMatches] = await Promise.all([
    showSpotlight
      ? prisma.user.findMany({
          where: rankedPlayerWithPointsWhere,
          orderBy: rankedPlayerOrderBy,
          take: 3,
          select: rankedPlayerSelect,
        })
      : Promise.resolve([]),
    prisma.user.findMany({
      where: listWhere,
      orderBy: rankedPlayerOrderBy,
      skip,
      take: PLAYERS_PAGE_SIZE,
      select: rankedPlayerSelect,
    }),
    prisma.user.aggregate({ where: rankedPlayerWithPointsWhere, _sum: { rankPoints: true } }),
    prisma.match.count({ where: { status: 'complete' } }),
  ]);

  const totalPoints = pointsAgg._sum.rankPoints ?? 0;

  const stats = [
    { label: 'Registered bladers', shortLabel: 'Bladers', value: globalTotal.toLocaleString(), icon: Users },
    { label: 'Matches played', shortLabel: 'Matches', value: totalMatches.toLocaleString(), icon: Swords },
    { label: 'Points awarded', shortLabel: 'Points', value: totalPoints.toLocaleString(), icon: Target },
    { label: 'Leaderboard', shortLabel: 'Ranks', value: 'View', icon: BarChart3, href: '/rankings' },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <ScrollReveal className="max-w-2xl space-y-3 sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <User size={12} />
              UGNCBBX roster
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">Players</h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Browse blader profiles, tournament history, and circuit stats across the UGNCBBX community.
            </p>
          </ScrollReveal>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ label, shortLabel, value, icon: Icon, href }, index) => {
              const inner = (
                <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 transition hover:border-slate-700 sm:gap-3 sm:px-4 sm:py-3">
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
              );
              return (
                <ScrollReveal key={label} delay={120 + index * 70} direction="scale">
                  {href ? (
                    <Link href={href} className="group block min-w-0">
                      {inner}
                    </Link>
                  ) : (
                    <div className="min-w-0">{inner}</div>
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        <ScrollReveal className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Directory</p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              {isSearching ? 'Search results' : 'All bladers'}
            </h2>
          </div>
          <div className="w-full lg:max-w-md lg:shrink-0">
            <ListSearch action="/players" query={query} placeholder="Search by username…" />
          </div>
        </ScrollReveal>

        {globalTotal === 0 ? (
          <ScrollReveal direction="scale">
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-5 py-12 text-center sm:px-8 sm:py-16">
            <Users size={36} className="mx-auto text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No players registered yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Be the first blader on the UGNCBBX circuit.
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
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-10 text-center sm:px-8 sm:py-14">
            <p className="text-base font-semibold text-white sm:text-lg">
              No players match &ldquo;{query}&rdquo;
            </p>
            <p className="mt-2 text-sm text-slate-400">Try a different username or clear the search.</p>
            <Link href="/players" className="btn-secondary mt-6 inline-flex w-full sm:w-auto">
              Clear search
            </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {showSpotlight && topThree.length > 0 && (
              <div>
                <ScrollReveal className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Featured</p>
                    <h3 className="mt-1 text-lg font-semibold text-white sm:text-xl">Top-ranked bladers</h3>
                  </div>
                  <Link
                    href="/rankings"
                    className="shrink-0 text-xs font-semibold text-brand-300 hover:text-brand-200"
                  >
                    Full leaderboard
                  </Link>
                </ScrollReveal>

                {/* Mobile: rank order */}
                <div className="grid gap-3 sm:hidden">
                  {topThree.map((p, i) => (
                    <ScrollReveal key={p.id} delay={i * 90} direction="scale">
                      <SpotlightCard player={p} rank={i + 1} highlight={i === 0} />
                    </ScrollReveal>
                  ))}
                </div>

                {/* Tablet+: podium-style order for 3 */}
                <div
                  className={`hidden gap-4 sm:grid ${
                    topThree.length === 1
                      ? 'max-w-md'
                      : topThree.length === 2
                        ? 'sm:grid-cols-2'
                        : 'lg:grid-cols-3'
                  }`}
                >
                  {topThree.length === 3 ? (
                    <>
                      <ScrollReveal delay={120} direction="scale">
                        <SpotlightCard player={topThree[1]} rank={2} />
                      </ScrollReveal>
                      <ScrollReveal delay={0} direction="scale">
                        <SpotlightCard player={topThree[0]} rank={1} highlight />
                      </ScrollReveal>
                      <ScrollReveal delay={120} direction="scale">
                        <SpotlightCard player={topThree[2]} rank={3} />
                      </ScrollReveal>
                    </>
                  ) : (
                    topThree.map((p, i) => (
                      <ScrollReveal key={p.id} delay={i * 90} direction="scale">
                        <SpotlightCard player={p} rank={i + 1} highlight={i === 0} />
                      </ScrollReveal>
                    ))
                  )}
                </div>
              </div>
            )}

            {isSearching && (
              <ScrollReveal>
                <p className="text-sm text-slate-400">
                  {filteredTotal.toLocaleString()} {filteredTotal === 1 ? 'player' : 'players'} found for &ldquo;
                  {query}&rdquo;
                </p>
              </ScrollReveal>
            )}

            <ScrollReveal delay={80}>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                <div className="divide-y divide-slate-800 md:hidden">
                  {players.map((p, i) => (
                    <ScrollReveal key={p.id} delay={i * 60}>
                      <PlayerMobileCard player={p} rank={skip + i + 1} />
                    </ScrollReveal>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
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
                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider sm:px-6">
                          Profile
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {players.map((p, i) => (
                        <PlayerTableRow key={p.id} player={p} rank={skip + i + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={page}
                  totalPages={pages}
                  totalItems={filteredTotal}
                  pageSize={PLAYERS_PAGE_SIZE}
                  pathname="/players"
                  query={query}
                />
              </div>
            </ScrollReveal>
          </div>
        )}

        {globalTotal > 0 && (
          <ScrollReveal className="relative mt-10 overflow-hidden rounded-2xl border border-brand-500/20 bg-slate-900 px-5 py-8 sm:mt-14 sm:px-10 sm:py-10" direction="scale" delay={120}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Join the circuit</p>
                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Compete on UGNCBBX</h2>
                <p className="mt-2 max-w-lg text-sm text-slate-400 sm:text-base">
                  Create a profile, enter tournaments, and climb the rankings alongside the community.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0 sm:flex-wrap">
                <Link
                  href="/register"
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  Create account
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/tournaments"
                  className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <Trophy size={16} />
                  Browse events
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}
