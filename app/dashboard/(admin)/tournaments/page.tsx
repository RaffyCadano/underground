import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { YourTournamentsHero } from '@/app/components/your-tournaments-hero';
import { ListSearch } from '@/app/components/list-search';
import { Pagination } from '@/app/components/pagination';
import { DeleteTournamentButton } from '@/app/tournaments/delete-tournament-button';
import { TournamentDeletedToast } from '@/app/tournaments/tournament-deleted-toast';
import { authOptions } from '@/lib/auth';
import { mergeTournamentHostScope } from '@/lib/tournament-host';
import {
  ADMIN_TOURNAMENTS_PAGE_SIZE,
  parsePageParam,
  totalPages,
} from '@/lib/pagination';
import { parseSearchQuery, parseStatusFilter, tournamentSearchWhere } from '@/lib/search';

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  active: 'In Progress',
  complete: 'Complete',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'active', label: 'In progress' },
  { value: 'complete', label: 'Complete' },
];

function statusClass(status: string) {
  if (status === 'open') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  if (status === 'active') return 'border-brand-500/40 bg-brand-500/10 text-brand-300';
  return 'border-slate-700 bg-slate-800/60 text-slate-400';
}

export default async function DashboardTournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? '';
  const role = session?.user?.role ?? '';

  const { q: qParam, status: statusParam, page: pageParam } = await searchParams;
  const query = parseSearchQuery(qParam);
  const status = parseStatusFilter(statusParam);
  const listWhere = mergeTournamentHostScope(tournamentSearchWhere(query, status), userId, role);
  const hasFilters = query.length > 0 || status !== 'all';
  const hostScope = mergeTournamentHostScope({}, userId, role);

  const [totalCount, openCount, activeCount, completeCount, filteredCount] = await Promise.all([
    prisma.tournament.count({ where: hostScope }),
    prisma.tournament.count({ where: { ...hostScope, status: 'open' } }),
    prisma.tournament.count({ where: { ...hostScope, status: 'active' } }),
    prisma.tournament.count({ where: { ...hostScope, status: 'complete' } }),
    prisma.tournament.count({ where: listWhere }),
  ]);

  const pages = totalPages(filteredCount, ADMIN_TOURNAMENTS_PAGE_SIZE);
  const page = parsePageParam(pageParam, pages);

  const tournaments = await prisma.tournament.findMany({
    where: listWhere,
    orderBy: { date: 'desc' },
    skip: (page - 1) * ADMIN_TOURNAMENTS_PAGE_SIZE,
    take: ADMIN_TOURNAMENTS_PAGE_SIZE,
    include: { _count: { select: { participants: true, matches: true } } },
  });

  const stats = [
    { label: 'Total', value: totalCount },
    { label: 'Open', value: openCount },
    { label: 'In progress', value: activeCount },
    { label: 'Complete', value: completeCount },
  ];

  return (
    <div className="space-y-8">
      <TournamentDeletedToast />
      <YourTournamentsHero createHref="/dashboard/tournaments/create" />

      {totalCount > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {totalCount === 0 ? (
        <div className="card-muted p-8 text-center text-slate-400">
          No tournaments yet.{' '}
          <Link href="/dashboard/tournaments/create" className="font-semibold text-brand-300 hover:text-brand-200">
            Create one
          </Link>{' '}
          to get started.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="border-b border-slate-800 p-4 sm:p-5">
            <ListSearch
              action="/dashboard/tournaments"
              query={query}
              status={status}
              statusOptions={STATUS_FILTER_OPTIONS}
              placeholder="Search by name, location…"
            />
          </div>

          {filteredCount === 0 ? (
            <div className="px-5 py-12 text-center sm:px-8">
              <p className="font-semibold text-white">No tournaments match your filters</p>
              <p className="mt-2 text-sm text-slate-400">Try a different search or clear the filters.</p>
              <Link href="/dashboard/tournaments" className="btn-secondary mt-5 inline-flex">
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-800">
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {t.date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {' · '}
                        {FORMAT_LABELS[t.format] ?? t.format}
                        {' · '}
                        {t._count.participants} players · {t._count.matches} matches
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClass(t.status)}`}
                      >
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                      <Link href={`/tournaments/${t.id}`} className="btn-secondary">
                        Manage
                      </Link>
                      <DeleteTournamentButton tournamentId={t.id} tournamentName={t.name} />
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={pages}
                totalItems={filteredCount}
                pageSize={ADMIN_TOURNAMENTS_PAGE_SIZE}
                pathname="/dashboard/tournaments"
                query={hasFilters ? query : undefined}
                status={hasFilters ? status : undefined}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
