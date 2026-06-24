import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { YourTournamentsHero } from '@/app/components/your-tournaments-hero';
import { ListSearch } from '@/app/components/list-search';
import { Pagination } from '@/app/components/pagination';
import { TournamentActionsMenu } from '@/app/dashboard/tournament-actions-menu';
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

const thClass = 'px-3 py-2.5 text-xs font-semibold uppercase tracking-wider';
const tdClass = 'px-3 py-2.5 align-middle';

function formatTournamentDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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
              <div className="overflow-x-auto">
                <table className="min-w-[56rem] w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className={`${thClass} min-w-[12rem]`}>Name</th>
                      <th className={`${thClass} min-w-[7rem]`}>Date</th>
                      <th className={`${thClass} hidden min-w-[9rem] md:table-cell`}>Format</th>
                      <th className={`${thClass} hidden min-w-[8rem] lg:table-cell`}>Location</th>
                      <th className={`${thClass} min-w-[5rem]`}>Players</th>
                      <th className={`${thClass} hidden min-w-[5rem] sm:table-cell`}>Matches</th>
                      <th className={`${thClass} min-w-[6rem]`}>Status</th>
                      <th className={`${thClass} w-12 text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((t) => (
                      <tr
                        key={t.id}
                        className="border-t border-slate-800/80 transition hover:bg-slate-900/50"
                      >
                        <td className={tdClass}>
                          <p className="font-semibold text-white">{t.name}</p>
                        </td>
                        <td className={`${tdClass} text-slate-400`}>{formatTournamentDate(t.date)}</td>
                        <td className={`${tdClass} hidden text-slate-400 md:table-cell`}>
                          {FORMAT_LABELS[t.format] ?? t.format}
                        </td>
                        <td className={`${tdClass} hidden text-slate-400 lg:table-cell`}>
                          {t.location ?? '—'}
                        </td>
                        <td className={`${tdClass} tabular-nums text-slate-300`}>
                          {t._count.participants}
                        </td>
                        <td className={`${tdClass} hidden tabular-nums text-slate-300 sm:table-cell`}>
                          {t._count.matches}
                        </td>
                        <td className={tdClass}>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass(t.status)}`}
                          >
                            {STATUS_LABELS[t.status] ?? t.status}
                          </span>
                        </td>
                        <td className={tdClass}>
                          <TournamentActionsMenu tournamentId={t.id} tournamentName={t.name} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
