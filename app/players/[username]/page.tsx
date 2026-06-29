import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  MessageSquare,
  Swords,
  Trophy,
  User,
} from 'lucide-react';
import { getServerSession } from 'next-auth';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { tournamentPublicPath } from '@/lib/tournament-lookup';
import { authOptions } from '@/lib/auth';
import {
  usernameFromProfileParam,
} from '@/lib/player-profile';
import { prisma } from '@/lib/prisma';
import { rankedPlayerWhere } from '@/lib/rankings';
import { roleBadgeClass, roleLabel } from '@/lib/roles';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function PlayerProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: usernameParam } = await params;
  const lookupUsername = usernameFromProfileParam(usernameParam);

  const session = await getServerSession(authOptions);

  const player = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: lookupUsername, mode: 'insensitive' } },
        { username: { equals: usernameParam.trim(), mode: 'insensitive' } },
      ],
    },
    include: {
      tournaments: {
        include: {
          tournament: { select: { id: true, slug: true, name: true, date: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      winsAsWinner: {
        include: {
          tournament: { select: { id: true, slug: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
    },
  });

  if (!player) notFound();

  const isOwnProfile = session?.user?.id === player.id;

  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;

  const circuitRank =
    player.role === 'player'
      ? (await prisma.user.count({
          where: {
            ...rankedPlayerWhere,
            OR: [
              { rankPoints: { gt: player.rankPoints } },
              { rankPoints: player.rankPoints, wins: { gt: player.wins } },
            ],
          },
        })) + 1
      : null;

  const stats = [
    {
      label: 'Rank points',
      value: player.rankPoints.toLocaleString(),
      icon: BarChart3,
      accent: true,
    },
    {
      label: 'Record',
      value: `${player.wins}-${player.losses}`,
      icon: Swords,
    },
    {
      label: 'Win rate',
      value: total > 0 ? `${winRate}%` : '—',
      icon: Trophy,
    },
    {
      label: 'Events',
      value: String(player.tournaments.length),
      icon: Calendar,
    },
  ];

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-10 lg:py-14">
          <Link
            href="/players"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white sm:mb-6"
          >
            <ArrowLeft size={14} />
            All players
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
              <PlayerAvatar
                username={player.username}
                avatar={player.avatar}
                size="2xl"
                shape="rounded-xl"
                className="border-brand-500/30 bg-brand-500/10 text-brand-200"
              />
              <div className="min-w-0">
                <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:justify-start">
                  <User size={12} />
                  Player profile
                </p>
                <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {player.username}
                </h1>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider capitalize ${roleBadgeClass(player.role)}`}
                  >
                    {roleLabel(player.role)}
                  </span>
                  {circuitRank !== null && (
                    <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                      Circuit rank #{circuitRank}
                    </span>
                  )}
                  <span className="w-full text-sm text-slate-500 sm:w-auto">
                    Joined {formatDate(player.createdAt)}
                  </span>
                  {isOwnProfile && (
                    <Link
                      href="/profile"
                      className="text-sm font-semibold text-brand-300 hover:text-brand-200"
                    >
                      Edit profile photo
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[11rem] lg:self-start">
              {circuitRank !== null && (
                <Link
                  href="/rankings"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-500/35 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-200 transition hover:border-brand-400/50 hover:bg-brand-500/20 sm:w-auto sm:justify-start"
                >
                  View leaderboard
                  <ArrowRight size={14} />
                </Link>
              )}
              {!isOwnProfile && session && (
                <Link
                  href={`/messages?to=${encodeURIComponent(player.username)}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white sm:w-auto sm:justify-start"
                >
                  <MessageSquare size={14} />
                  Message
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, accent }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-3 sm:px-4 sm:py-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-slate-950 sm:h-9 sm:w-9 ${
                      accent ? 'border-brand-500/30 text-brand-400' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon size={15} className="sm:hidden" />
                    <Icon size={16} className="hidden sm:block" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-base font-semibold tabular-nums sm:text-lg ${
                        accent ? 'text-brand-300' : 'text-white'
                      }`}
                    >
                      {value}
                    </p>
                    <p className="truncate text-[10px] text-slate-500 sm:text-xs">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="mx-auto mt-5 max-w-xl sm:mx-0 sm:mt-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Win rate</span>
                <span className="tabular-nums text-slate-400">{winRate}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-500/80 transition-all"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
              <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-white sm:text-lg">Tournament history</h2>
                  <p className="text-xs text-slate-500">Events this blader has entered</p>
                </div>
                <Link
                  href="/tournaments"
                  className="text-xs font-semibold text-brand-300 hover:text-brand-200 sm:shrink-0"
                >
                  Browse events
                </Link>
              </div>
              {player.tournaments.length === 0 ? (
                <p className="px-4 py-8 text-sm text-slate-400 sm:px-6">No tournament entries yet.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {player.tournaments.map((tp) => (
                    <Link
                      key={tp.id}
                      href={tournamentPublicPath(tp.tournament)}
                      className="flex flex-col gap-3 px-4 py-4 transition hover:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{tp.tournament.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{formatShortDate(tp.tournament.date)}</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            tp.tournament.status === 'active'
                              ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                              : tp.tournament.status === 'open'
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                : 'border-slate-700 bg-slate-800 text-slate-500'
                          }`}
                        >
                          {tp.tournament.status}
                        </span>
                        <ArrowRight size={14} className="text-slate-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {player.winsAsWinner.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                <div className="border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-base font-semibold text-white sm:text-lg">Recent wins</h2>
                  <p className="text-xs text-slate-500">Latest match results on the circuit</p>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                  {player.winsAsWinner.map((m) => (
                    <Link
                      key={m.id}
                      href={tournamentPublicPath(m.tournament)}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 transition hover:border-brand-500/30 hover:bg-slate-900"
                    >
                      <p className="truncate text-sm font-semibold text-white">{m.tournament.name}</p>
                      {m.score && (
                        <p className="mt-1 text-xs font-medium tabular-nums text-brand-300">{m.score}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activity</p>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-xs text-slate-500">Member since</dt>
                  <dd className="mt-1 text-sm font-medium text-white">{formatDate(player.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Tournaments entered</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {player.tournaments.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Match wins</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">{player.wins}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Explore</p>
              <div className="mt-4 space-y-2">
                <Link
                  href="/rankings"
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Rankings
                  <ArrowRight size={14} className="text-slate-600" />
                </Link>
                <Link
                  href="/tournaments"
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Tournaments
                  <ArrowRight size={14} className="text-slate-600" />
                </Link>
                <Link
                  href="/players"
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  All players
                  <ArrowRight size={14} className="text-slate-600" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
