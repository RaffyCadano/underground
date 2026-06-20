import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Layers,
  MapPin,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ListSearch } from '@/app/components/list-search';
import { parseSearchQuery, parseStatusFilter, tournamentSearchWhere } from '@/lib/search';
import { DeleteTournamentButton } from './delete-tournament-button';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'active', label: 'In progress' },
  { value: 'complete', label: 'Complete' },
];

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

const FORMAT_SHORT: Record<string, string> = {
  single_elimination: 'Single elim',
  double_elimination: 'Double elim',
  swiss: 'Swiss',
  round_robin: 'Round robin',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  active: 'In Progress',
  complete: 'Complete',
};

function statusStyles(status: string) {
  if (status === 'open') {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  }
  if (status === 'active') {
    return 'border-brand-500/40 bg-brand-500/10 text-brand-300';
  }
  return 'border-slate-700 bg-slate-800/60 text-slate-400';
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
}

function formatCardDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TournamentCard({
  tournament: t,
  isAdmin,
  featured = false,
}: {
  tournament: {
    id: string;
    name: string;
    description: string | null;
    date: Date;
    location: string | null;
    format: string;
    status: string;
    _count: { participants: number };
  };
  isAdmin: boolean;
  featured?: boolean;
}) {
  const formatLabel = FORMAT_LABELS[t.format] ?? t.format;
  const formatShort = FORMAT_SHORT[t.format] ?? formatLabel;

  return (
    <article
      className={`group relative min-w-0 overflow-hidden rounded-2xl border bg-slate-900/60 transition hover:border-slate-700 ${
        featured ? 'border-brand-500/25 shadow-lg shadow-brand-950/10' : 'border-slate-800'
      }`}
    >
      {featured && <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />}

      <div className="flex h-full flex-col p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyles(t.status)}`}
          >
            {t.status === 'active' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />}
            {STATUS_LABELS[t.status] ?? t.status}
          </span>
          <span
            className="max-w-[55%] shrink-0 truncate rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-400 sm:max-w-none sm:text-xs"
            title={formatLabel}
          >
            <span className="sm:hidden">{formatShort}</span>
            <span className="hidden sm:inline">{formatLabel}</span>
          </span>
        </div>

        <Link href={`/tournaments/${t.id}`} className="mt-3 block min-w-0 flex-1 sm:mt-4">
          <h2 className="break-words text-lg font-semibold leading-snug text-white transition group-hover:text-brand-200 sm:text-xl">
            {t.name}
          </h2>
          {t.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{t.description}</p>
          )}
        </Link>

        <div className="mt-4 space-y-2 text-xs text-slate-400 sm:mt-5 sm:text-sm">
          <p className="flex items-start gap-2">
            <Calendar size={14} className="mt-0.5 shrink-0 text-slate-500" />
            <span className="min-w-0 break-words">
              <span className="sm:hidden">{formatCardDate(t.date)}</span>
              <span className="hidden sm:inline">{formatDate(t.date)}</span>
            </span>
          </p>
          {t.location && (
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-slate-500" />
              <span className="min-w-0 break-words">{t.location}</span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <Users size={14} className="shrink-0 text-slate-500" />
            {t._count.participants} {t._count.participants === 1 ? 'player' : 'players'} registered
          </p>
        </div>

        <div
          className={`mt-5 flex flex-col gap-3 border-t border-slate-800/80 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:border-0 sm:pt-0 ${
            isAdmin ? 'sm:justify-between' : ''
          }`}
        >
          <Link
            href={`/tournaments/${t.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500/35 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-200 transition hover:border-brand-400/50 hover:bg-brand-500/20 sm:border-0 sm:bg-transparent sm:p-0 sm:text-brand-300 sm:hover:text-brand-200"
          >
            {t.status === 'complete' ? 'View results' : 'View bracket'}
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </Link>
          {isAdmin && (
            <div className="sm:shrink-0">
              <DeleteTournamentButton tournamentId={t.id} tournamentName={t.name} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === 'admin';
  const { q: qParam, status: statusParam } = await searchParams;

  const query = parseSearchQuery(qParam);
  const status = parseStatusFilter(statusParam);
  const hasFilters = query.length > 0 || status !== 'all';
  const listWhere = tournamentSearchWhere(query, status);

  const [totalCount, openCount, activeCount, completeCount, tournaments] = await Promise.all([
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: 'open' } }),
    prisma.tournament.count({ where: { status: 'active' } }),
    prisma.tournament.count({ where: { status: 'complete' } }),
    prisma.tournament.findMany({
      where: listWhere,
      orderBy: { date: 'asc' },
      include: { _count: { select: { participants: true } } },
    }),
  ]);

  const openTournaments = tournaments.filter((t) => t.status === 'open');
  const activeTournaments = tournaments.filter((t) => t.status === 'active');
  const completeTournaments = tournaments.filter((t) => t.status === 'complete');
  const upcoming = [...openTournaments, ...activeTournaments];

  const stats = [
    { label: 'Total events', shortLabel: 'Total', value: totalCount, icon: Trophy },
    { label: 'Open registration', shortLabel: 'Open', value: openCount, icon: Zap },
    { label: 'Live now', shortLabel: 'Live', value: activeCount, icon: Layers },
    { label: 'Completed', shortLabel: 'Done', value: completeCount, icon: CheckCircle2 },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero */}
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <Trophy size={12} />
              Underground events
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Tournaments
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Browse brackets, register for open events, and follow live competitions across the circuit.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ label, shortLabel, value, icon: Icon }) => (
              <div
                key={label}
                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
              >
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
            ))}
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        <div className="mb-6 sm:mb-8">
          <ListSearch
            action="/tournaments"
            query={query}
            status={status}
            statusOptions={STATUS_FILTER_OPTIONS}
            placeholder="Search by name, location…"
          />
        </div>

        {totalCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-5 py-12 text-center sm:px-8 sm:py-16">
            <Trophy size={36} className="mx-auto text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No tournaments yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Check back soon — new Underground events will appear here when admins create them.
            </p>
            {!session && (
              <Link href="/register" className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                Create account
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-10 text-center sm:px-8 sm:py-14">
            <p className="text-base font-semibold text-white sm:text-lg">No tournaments match your filters</p>
            <p className="mt-2 text-sm text-slate-400">
              {query ? (
                <>
                  Nothing found for &ldquo;{query}&rdquo;
                  {status !== 'all' ? ` with status “${STATUS_LABELS[status]}”` : ''}.
                </>
              ) : (
                <>No events with status “{STATUS_LABELS[status]}”.</>
              )}
            </p>
            <Link href="/tournaments" className="btn-secondary mt-6 inline-flex w-full sm:w-auto">
              Clear filters
            </Link>
          </div>
        ) : hasFilters ? (
          <div>
            <div className="mb-5 sm:mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Results</p>
              <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                {tournaments.length} {tournaments.length === 1 ? 'event' : 'events'} found
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {tournaments.map((t, i) => (
                <TournamentCard key={t.id} tournament={t} isAdmin={isAdmin} featured={i === 0} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-14">
            {upcoming.length > 0 && (
              <div>
                <div className="mb-5 sm:mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Upcoming &amp; live
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    {upcoming.length} {upcoming.length === 1 ? 'event' : 'events'} on the circuit
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                  {upcoming.map((t, i) => (
                    <TournamentCard key={t.id} tournament={t} isAdmin={isAdmin} featured={i === 0} />
                  ))}
                </div>
              </div>
            )}

            {completeTournaments.length > 0 && (
              <div>
                <div className="mb-5 sm:mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Archive</p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Past tournaments</h2>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                  <div className="divide-y divide-slate-800">
                    {completeTournaments.map((t) => (
                      <div
                        key={t.id}
                        className="flex flex-col gap-3 px-4 py-4 transition hover:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/tournaments/${t.id}`}
                            className="break-words font-semibold text-white transition hover:text-brand-300"
                          >
                            {t.name}
                          </Link>
                          <div className="mt-1.5 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={12} className="shrink-0" />
                              {formatShortDate(t.date)}
                            </span>
                            {t.location && (
                              <span className="inline-flex min-w-0 items-center gap-1">
                                <MapPin size={12} className="shrink-0" />
                                <span className="truncate">{t.location}</span>
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Users size={12} className="shrink-0" />
                              {t._count.participants} players
                            </span>
                            <span className="truncate">
                              <span className="sm:hidden">{FORMAT_SHORT[t.format] ?? t.format}</span>
                              <span className="hidden sm:inline">{FORMAT_LABELS[t.format] ?? t.format}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 border-t border-slate-800/80 pt-3 sm:border-0 sm:pt-0">
                          <Link
                            href={`/tournaments/${t.id}`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white sm:flex-none sm:border-0 sm:bg-transparent sm:p-0 sm:text-slate-400 sm:hover:text-white"
                          >
                            View results
                            <ArrowRight size={14} />
                          </Link>
                          {isAdmin && (
                            <DeleteTournamentButton tournamentId={t.id} tournamentName={t.name} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {upcoming.length === 0 && completeTournaments.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3.5 text-sm text-slate-400 sm:px-5 sm:py-4">
                No open or live tournaments right now. Browse past events below or check back later.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
