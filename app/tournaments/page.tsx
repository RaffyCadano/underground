import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Layers,
  MapPin,
  Trophy,
  UserRound,
  Users,
  Zap,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { playerProfilePath } from '@/lib/player-profile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournament as userCanManageTournament } from '@/lib/tournament-host';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { parseSearchQuery, parseStatusFilter, tournamentSearchWhere } from '@/lib/search';
import { DeleteTournamentButton } from './delete-tournament-button';
import { TournamentDeletedToast } from './tournament-deleted-toast';
import { TournamentsEmptyState } from './tournaments-empty-state';
import { TournamentsHero } from './tournaments-hero';
import { TournamentsSearchSection } from './tournaments-search-section';
import { descriptionPlainText } from '@/lib/description-markdown';

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
  canManage,
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
    createdById: string | null;
    createdBy: { username: string } | null;
    _count: { participants: number };
  };
  canManage: boolean;
  featured?: boolean;
}) {
  const formatLabel = FORMAT_LABELS[t.format] ?? t.format;
  const formatShort = FORMAT_SHORT[t.format] ?? formatLabel;
  const descriptionText = t.description ? descriptionPlainText(t.description) : '';

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-slate-900/60 transition hover:border-slate-700 ${
        featured ? 'border-brand-500/25 shadow-lg shadow-brand-950/10' : 'border-slate-800'
      }`}
    >
      {featured && <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />}

      <div className="flex flex-1 flex-col p-4 sm:p-6">
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

        <Link href={`/tournaments/${t.id}`} className="mt-3 block min-w-0 sm:mt-4">
          <h2 className="line-clamp-2 min-h-[2.75rem] break-words text-lg font-semibold leading-snug text-white transition group-hover:text-brand-200 sm:min-h-[3.25rem] sm:text-xl">
            {t.name}
          </h2>
          <p className="mt-2 line-clamp-2 h-[2.625rem] text-sm leading-[1.3125rem] text-slate-400">
            {descriptionText || '\u00A0'}
          </p>
        </Link>

        <ul className="mt-4 space-y-1.5 text-xs text-slate-400 sm:mt-5 sm:text-sm">
          <li className="flex h-5 items-center gap-2.5">
            <Calendar size={14} className="shrink-0 text-slate-500" />
            <span className="min-w-0 truncate">
              <span className="sm:hidden">{formatCardDate(t.date)}</span>
              <span className="hidden sm:inline">{formatDate(t.date)}</span>
            </span>
          </li>
          <li className="flex h-5 items-center gap-2.5">
            <MapPin size={14} className="shrink-0 text-slate-500" />
            <span className="min-w-0 truncate text-slate-400">
              {t.location ?? 'TBD'}
            </span>
          </li>
          <li className="flex h-5 items-center gap-2.5">
            <UserRound size={14} className="shrink-0 text-slate-500" />
            <span className="min-w-0 truncate">
              {t.createdBy ? (
                <>
                  <span className="text-slate-500">Organizer </span>
                  <Link
                    href={playerProfilePath(t.createdBy.username)}
                    className="font-medium text-brand-300 hover:text-brand-200"
                  >
                    {t.createdBy.username}
                  </Link>
                </>
              ) : (
                <span className="text-slate-400">Organizer UGNCBBX</span>
              )}
            </span>
          </li>
          <li className="flex h-5 items-center gap-2.5">
            <Users size={14} className="shrink-0 text-slate-500" />
            <span className="min-w-0 truncate">
              {t._count.participants} {t._count.participants === 1 ? 'player' : 'players'} registered
            </span>
          </li>
        </ul>

        <div
          className={`mt-auto flex flex-col gap-3 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-center ${
            canManage ? 'sm:justify-between' : ''
          }`}
        >
          <Link
            href={`/tournaments/${t.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500/35 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-200 transition hover:border-brand-400/50 hover:bg-brand-500/20 sm:border-0 sm:bg-transparent sm:p-0 sm:text-brand-300 sm:hover:text-brand-200"
          >
            {t.status === 'complete' ? 'View results' : 'View bracket'}
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </Link>
          {canManage && (
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
  const manageTournament = (t: { createdById: string | null }) =>
    session
      ? userCanManageTournament(t, session.user.id, session.user.role)
      : false;
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
      include: {
        _count: { select: { participants: true } },
        createdBy: { select: { username: true } },
      },
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
      <TournamentDeletedToast />
      <TournamentsHero stats={stats} />

      <section className="container py-8 sm:py-12 lg:py-16">
        {totalCount !== 0 && (
          <ScrollReveal className="mb-6 sm:mb-8">
            <TournamentsSearchSection
              query={query}
              status={status}
              statusOptions={STATUS_FILTER_OPTIONS}
            />
          </ScrollReveal>
        )}

        {totalCount === 0 && (
          <ScrollReveal className="mx-auto mb-6 max-w-2xl text-center sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Event directory
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              The circuit calendar is warming up
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              North Carolina Beyblade X events will appear here for registration, live brackets, and
              standings. Check back as new game days are added.
            </p>
          </ScrollReveal>
        )}

        {totalCount === 0 ? (
          <ScrollReveal direction="scale">
            <TournamentsEmptyState
              query={query}
              status={status}
              statusOptions={STATUS_FILTER_OPTIONS}
            />
          </ScrollReveal>
        ) : tournaments.length === 0 ? (
          <ScrollReveal>
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
          </ScrollReveal>
        ) : hasFilters ? (
          <div>
            <ScrollReveal>
              <div className="mb-5 sm:mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Results</p>
              <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                {tournaments.length} {tournaments.length === 1 ? 'event' : 'events'} found
              </h2>
            </div>
            </ScrollReveal>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {tournaments.map((t, i) => (
                <ScrollReveal key={t.id} className="h-full" delay={i * 90}>
                  <TournamentCard tournament={t} canManage={manageTournament(t)} featured={i === 0} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-14">
            {upcoming.length > 0 && (
              <div>
                <ScrollReveal>
                  <div className="mb-5 sm:mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Upcoming &amp; live
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    {upcoming.length} {upcoming.length === 1 ? 'event' : 'events'} on the circuit
                  </h2>
                </div>
                </ScrollReveal>
                <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                  {upcoming.map((t, i) => (
                    <ScrollReveal key={t.id} className="h-full" delay={i * 90}>
                      <TournamentCard tournament={t} canManage={manageTournament(t)} featured={i === 0} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}

            {completeTournaments.length > 0 && (
              <div>
                <ScrollReveal>
                  <div className="mb-5 sm:mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Archive</p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Past tournaments</h2>
                </div>
                </ScrollReveal>
                <ScrollReveal delay={100}>
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
                            <span className="inline-flex min-w-0 items-center gap-1">
                              <UserRound size={12} className="shrink-0" />
                              {t.createdBy ? (
                                <Link
                                  href={playerProfilePath(t.createdBy.username)}
                                  className="truncate transition hover:text-brand-300"
                                >
                                  {t.createdBy.username}
                                </Link>
                              ) : (
                                <span>UGNCBBX</span>
                              )}
                            </span>
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
                          {manageTournament(t) && (
                            <DeleteTournamentButton tournamentId={t.id} tournamentName={t.name} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </ScrollReveal>
              </div>
            )}

            {upcoming.length === 0 && completeTournaments.length > 0 && (
              <ScrollReveal>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3.5 text-sm text-slate-400 sm:px-5 sm:py-4">
                  No open or live tournaments right now. Browse past events below or check back later.
                </div>
              </ScrollReveal>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
