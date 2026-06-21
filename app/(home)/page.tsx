import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { rankedPlayerWhere } from '@/lib/rankings';
import { CircuitSection } from './circuit-section';
import { HowItWorksSection } from './how-it-works-section';

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatHeroDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

export default async function HomePage() {
  const [upcomingTournaments, recentMatches, topPlayers, totalPlayers, totalMatches] = await Promise.all([
    prisma.tournament.findMany({
      where: { status: { in: ['open', 'active'] } },
      orderBy: [{ status: 'asc' }, { date: 'asc' }],
      take: 4,
      include: { _count: { select: { participants: true } } },
    }),
    prisma.match.findMany({
      where: { status: 'complete', score: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
        winner: { select: { username: true } },
        tournament: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: rankedPlayerWhere,
      orderBy: [{ rankPoints: 'desc' }],
      take: 5,
      select: { id: true, username: true, avatar: true, rankPoints: true, wins: true, losses: true },
    }),
    prisma.user.count({ where: rankedPlayerWhere }),
    prisma.match.count({ where: { status: 'complete' } }),
  ]);

  const featuredTournament =
    upcomingTournaments.find((t) => t.status === 'active') ?? upcomingTournaments[0] ?? null;
  const moreUpcoming = featuredTournament
    ? upcomingTournaments.filter((t) => t.id !== featuredTournament.id).slice(0, 3)
    : [];
  const stats = [
    { label: 'Bladers', shortLabel: 'Bladers', value: totalPlayers.toLocaleString(), icon: Users },
    { label: 'Matches', shortLabel: 'Matches', value: totalMatches.toLocaleString(), icon: Swords },
    { label: 'Live events', shortLabel: 'Events', value: upcomingTournaments.length.toString(), icon: Trophy },
  ];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-x-hidden border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
        <div className="container relative py-8 sm:py-12 md:py-14 lg:py-20">
          <div className="grid min-w-0 gap-8 md:grid-cols-2 md:gap-8 md:items-start lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
            {/* Copy */}
            <div className="order-2 min-w-0 space-y-6 sm:space-y-8 md:order-1 lg:order-none">
              <div className="space-y-4 text-center sm:space-y-5 md:text-left">
                <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  <Zap size={12} />
                  Underground circuit
                </p>
                <h1 className="mx-auto max-w-2xl text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-white min-[480px]:text-3xl sm:text-4xl md:mx-0 md:text-[2.5rem] lg:text-5xl xl:text-6xl">
                  Beyblade X tournaments, built for game day.
                </h1>
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base md:mx-0 md:text-lg">
                  Register for brackets, report live scores, and climb the Underground rankings — all in one place.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-start">
                <Link
                  href="/tournaments"
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  Browse tournaments
                  <ArrowRight size={16} />
                </Link>
                <Link href="/register" className="btn-secondary w-full text-center sm:w-auto">
                  Create account
                </Link>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 sm:rounded-none sm:border-0 sm:bg-transparent">
                <div className="grid grid-cols-3 divide-x divide-slate-800 sm:flex sm:flex-wrap sm:gap-6 sm:divide-x-0 sm:border-t sm:border-slate-800/80 sm:pt-8">
                  {stats.map(({ label, shortLabel, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-4 text-center sm:flex-row sm:gap-3 sm:px-0 sm:py-0 sm:text-left"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-brand-400 sm:h-10 sm:w-10 sm:rounded-xl sm:bg-slate-900/80">
                        <Icon size={15} className="sm:hidden" />
                        <Icon size={18} className="hidden sm:block" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-semibold tabular-nums text-white sm:text-xl">{value}</p>
                        <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                          <span className="sm:hidden">{shortLabel}</span>
                          <span className="hidden sm:inline">{label}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured + upcoming */}
            <div className="order-1 min-w-0 space-y-4 md:order-2 lg:order-none">
              {featuredTournament ? (
                <div className="overflow-hidden rounded-2xl border border-brand-500/25 bg-slate-900/80 shadow-lg shadow-brand-950/20">
                  <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400/90 sm:text-[11px]">
                        Featured event
                      </p>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          featuredTournament.status === 'active'
                            ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {featuredTournament.status === 'active' && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                        )}
                        {featuredTournament.status === 'active' ? 'Live' : 'Open'}
                      </span>
                    </div>

                    <h2 className="mt-2 break-words text-lg font-semibold leading-snug text-white sm:mt-3 sm:text-xl md:text-2xl">
                      {featuredTournament.name}
                    </h2>

                    <ul className="mt-3 space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2.5 text-xs text-slate-400 sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
                      <li className="flex items-start gap-2">
                        <Calendar size={14} className="mt-0.5 shrink-0 text-slate-500" />
                        <span className="min-w-0 break-words">{formatHeroDate(featuredTournament.date)}</span>
                      </li>
                      {featuredTournament.location && (
                        <li className="flex items-start gap-2">
                          <MapPin size={14} className="mt-0.5 shrink-0 text-slate-500" />
                          <span className="min-w-0 break-words">{featuredTournament.location}</span>
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Users size={14} className="shrink-0 text-slate-500" />
                        {featuredTournament._count.participants}{' '}
                        {featuredTournament._count.participants === 1 ? 'player' : 'players'} registered
                      </li>
                      <li className="flex items-start gap-2">
                        <Trophy size={14} className="mt-0.5 shrink-0 text-slate-500" />
                        <span>{FORMAT_LABELS[featuredTournament.format] ?? featuredTournament.format}</span>
                      </li>
                    </ul>

                    <Link
                      href={`/tournaments/${featuredTournament.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-500/35 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-200 transition hover:border-brand-400/50 hover:bg-brand-500/20 sm:mt-5"
                    >
                      View bracket
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center sm:p-8">
                  <Trophy size={28} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">No active tournaments right now.</p>
                  <Link
                    href="/tournaments"
                    className="mt-4 inline-flex text-sm font-semibold text-brand-300 hover:text-brand-200"
                  >
                    Browse all events
                  </Link>
                </div>
              )}

              {moreUpcoming.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                    <p className="text-sm font-semibold text-white">More upcoming</p>
                    <Link
                      href="/tournaments"
                      className="shrink-0 text-xs font-semibold text-brand-300 hover:text-brand-200"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {moreUpcoming.map((t) => (
                      <Link
                        key={t.id}
                        href={`/tournaments/${t.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition hover:bg-slate-900 sm:px-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-200">{t.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatShortDate(t.date)}
                            {' · '}
                            {FORMAT_LABELS[t.format] ?? t.format}
                          </p>
                        </div>
                        <ArrowRight size={14} className="shrink-0 text-slate-600" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      <CircuitSection topPlayers={topPlayers} recentMatches={recentMatches} />

      {/* CTA */}
      <section className="container py-10 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-slate-900 px-5 py-10 text-center sm:px-12 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Ready to compete?</p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl md:text-4xl">Join the Underground circuit</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400 sm:text-base">
              Create a free account, enter your first tournament, and start climbing the rankings.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link href="/register" className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                Create account
                <ArrowRight size={16} />
              </Link>
              <Link href="/tournaments" className="btn-secondary w-full sm:w-auto">
                Browse tournaments
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
