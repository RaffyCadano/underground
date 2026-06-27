import Link from 'next/link';
import { Mail } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ListSearch } from '@/app/components/list-search';
import { AccountsTable } from '@/app/dashboard/accounts-table';
import { ApproveOrganizerRequestButton } from '@/app/dashboard/approve-organizer-request-button';
import { DismissOrganizerRequestButton } from '@/app/dashboard/dismiss-organizer-request-button';
import { accountSearchWhere, parseRoleFilter, parseSearchQuery, registeredAccountsWhere } from '@/lib/search';
import { ACCOUNT_ROLE_FILTER_OPTIONS } from '@/lib/roles';

export const dynamic = 'force-dynamic';

const ROLE_FILTER_OPTIONS = ACCOUNT_ROLE_FILTER_OPTIONS;

function formatJoined(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function DashboardAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { q: qParam, role: roleParam } = await searchParams;
  const query = parseSearchQuery(qParam);
  const role = parseRoleFilter(roleParam);
  const hasFilters = query.length > 0 || role !== 'all';
  const where = accountSearchWhere(query, role);

  const [users, registeredCount, filteredCount, pendingOrganizerRequests] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerifiedAt: true,
        role: true,
        rankPoints: true,
        wins: true,
        losses: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: registeredAccountsWhere() }),
    prisma.user.count({ where }),
    prisma.organizerRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, email: true, role: true } },
      },
    }),
  ]);

  const accountRows = users.map(({ emailVerifiedAt, createdAt, ...user }) => ({
    ...user,
    emailVerified: emailVerifiedAt != null,
    joinedLabel: formatJoined(createdAt),
  }));

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="min-w-0 shrink-0">
          <h2 className="text-lg font-semibold text-white sm:text-xl">Account management</h2>
          <p className="mt-1 text-sm text-slate-400">
            {hasFilters
              ? `${filteredCount} of ${registeredCount} accounts match your filters`
              : `All registered users on UGNCBBX (${registeredCount}).`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tournament walk-ins are scoped to each event and are not listed here. Filter by
            &ldquo;Walk-ins (internal)&rdquo; to audit guest records.
          </p>
        </div>
        <div className="min-w-0 w-full md:max-w-xl md:flex-1 lg:max-w-2xl">
          <ListSearch
            action="/dashboard/accounts"
            query={query}
            filterName="role"
            filterValue={role}
            filterOptions={ROLE_FILTER_OPTIONS}
            placeholder="Search by username or email…"
          />
        </div>
      </div>

      {pendingOrganizerRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white">Organizer requests</h3>
          <p className="mt-1 text-sm text-slate-400">
            Players requesting organizer access. Approve to grant the role, or dismiss after review.
          </p>
          <div className="mt-4 space-y-3">
            {pendingOrganizerRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-sky-500/20 bg-sky-500/5 px-4 py-4 sm:px-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{request.user.username}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Mail size={12} />
                        {request.user.email}
                      </span>
                      <span className="capitalize">Current: {request.user.role}</span>
                      <span>
                        {request.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                      {request.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <ApproveOrganizerRequestButton requestId={request.id} />
                    <DismissOrganizerRequestButton requestId={request.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredCount === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center sm:px-8 sm:py-12">
          <p className="font-semibold text-white">No accounts match your filters</p>
          <p className="mt-2 text-sm text-slate-400">
            {query ? (
              <>Nothing found for &ldquo;{query}&rdquo;{role !== 'all' ? ` with role “${role}”` : ''}.</>
            ) : (
              <>No users with role “{role}”.</>
            )}
          </p>
          <Link href="/dashboard/accounts" className="btn-secondary mt-5 inline-flex w-full sm:w-auto">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <AccountsTable
            users={accountRows}
            currentUserId={session.user.id}
            currentUsername={session.user.name ?? ''}
          />
        </div>
      )}
    </div>
  );
}
