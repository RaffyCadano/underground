import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ListSearch } from '@/app/components/list-search';
import { prisma } from '@/lib/prisma';
import { canManageTournaments } from '@/lib/roles';
import {
  parseSearchQuery,
  parseTemplateFormatFilter,
  tournamentTemplateSearchWhere,
} from '@/lib/search';
import {
  parsePageParam,
  TOURNAMENT_TEMPLATES_PAGE_SIZE,
  totalPages,
} from '@/lib/pagination';
import { FORMAT_LABELS } from '@/lib/tournament-labels';
import { TournamentTemplatesList } from './tournament-templates-list';

export const dynamic = 'force-dynamic';

const FORMAT_FILTER_OPTIONS = [
  { value: 'all', label: 'All formats' },
  ...Object.entries(FORMAT_LABELS).map(([value, label]) => ({ value, label })),
];

export default async function TournamentTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    q?: string;
    format?: string;
    page?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!canManageTournaments(session.user.role)) redirect('/profile');

  const { created, updated, q: qParam, format: formatParam, page: pageParam } = await searchParams;
  const query = parseSearchQuery(qParam);
  const format = parseTemplateFormatFilter(formatParam);
  const hasFilters = query.length > 0 || format !== 'all';
  const listWhere = {
    userId: session.user.id,
    ...tournamentTemplateSearchWhere(query, format),
  };

  const [totalCount, filteredCount] = await Promise.all([
    prisma.tournamentTemplate.count({ where: { userId: session.user.id } }),
    prisma.tournamentTemplate.count({ where: listWhere }),
  ]);

  const pages = totalPages(filteredCount, TOURNAMENT_TEMPLATES_PAGE_SIZE);
  const page = parsePageParam(pageParam, pages);

  const templates = await prisma.tournamentTemplate.findMany({
    where: listWhere,
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * TOURNAMENT_TEMPLATES_PAGE_SIZE,
    take: TOURNAMENT_TEMPLATES_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      format: true,
      gameType: true,
      groupStageEnabled: true,
      isRanked: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Tournament Templates</h1>
          <span className="rounded border border-orange-500/45 bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
            Labs
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          {hasFilters
            ? `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} templates match your filters`
            : totalCount > 0
              ? `${totalCount.toLocaleString()} saved template${totalCount === 1 ? '' : 's'}`
              : 'Save bracket formats, rules, and registration defaults to reuse across events.'}
        </p>
      </div>

      <ListSearch
        action="/profile/tournament-templates"
        query={query}
        filterName="format"
        filterValue={format}
        filterOptions={FORMAT_FILTER_OPTIONS}
        placeholder="Search by template name…"
        singleRow
        className="w-full"
        trailing={
          <Link
            href="/profile/tournament-templates/new"
            className="btn-primary inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-5"
          >
            <Plus size={16} />
            New Template
          </Link>
        }
      />

      <TournamentTemplatesList
        templates={templates.map((t) => ({ ...t, updatedAt: t.updatedAt.toISOString() }))}
        showCreatedToast={created === '1'}
        showUpdatedToast={updated === '1'}
        hasFilters={hasFilters}
        page={page}
        totalPages={pages}
        totalItems={filteredCount}
        pageSize={TOURNAMENT_TEMPLATES_PAGE_SIZE}
        query={hasFilters ? query : undefined}
        format={hasFilters ? format : undefined}
      />
    </div>
  );
}
