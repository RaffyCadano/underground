import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ListSearch } from '@/app/components/list-search';
import { AccountActionsMenu } from '@/app/dashboard/account-actions-menu';
import { AccountRoleButton } from '@/app/dashboard/account-role-button';
import { accountSearchWhere, parseRoleFilter, parseSearchQuery } from '@/lib/search';

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'player', label: 'Players' },
  { value: 'admin', label: 'Admins' },
];

function formatJoined(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        role === 'admin'
          ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
          : 'border-slate-700 bg-slate-800/60 text-slate-400'
      }`}
    >
      {role}
    </span>
  );
}

function AccountActions({
  user,
  currentUserId,
}: {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    rankPoints: number;
    wins: number;
    losses: number;
  };
  currentUserId: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <AccountRoleButton
        userId={user.id}
        username={user.username}
        role={user.role}
        currentUserId={currentUserId}
      />
      <AccountActionsMenu user={user} currentUserId={currentUserId} />
    </div>
  );
}

const thClass =
  'whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider sm:px-4 xl:px-5';
const tdClass = 'px-3 py-3.5 sm:px-4 sm:py-4 xl:px-5';

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

  const [users, totalCount, filteredCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        rankPoints: true,
        wins: true,
        losses: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="min-w-0 shrink-0">
          <h2 className="text-lg font-semibold text-white sm:text-xl">Account management</h2>
          <p className="mt-1 text-sm text-slate-400">
            {hasFilters
              ? `${filteredCount} of ${totalCount} users match your filters`
              : `All registered users on UGNCBBX (${totalCount}).`}
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
          <div className="overflow-x-auto">
            <table className="min-w-[36rem] w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th
                    className={`${thClass} sticky left-0 z-20 min-w-[9rem] bg-slate-900 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] sm:min-w-[10rem]`}
                  >
                    User
                  </th>
                  <th className={`${thClass} hidden min-w-[10rem] md:table-cell`}>Email</th>
                  <th className={`${thClass} min-w-[5rem]`}>Role</th>
                  <th className={`${thClass} hidden min-w-[4.5rem] sm:table-cell`}>Record</th>
                  <th className={`${thClass} hidden min-w-[4rem] lg:table-cell`}>Points</th>
                  <th className={`${thClass} hidden min-w-[6.5rem] xl:table-cell`}>Joined</th>
                  <th
                    className={`${thClass} sticky right-0 z-20 min-w-[8.5rem] bg-slate-900 text-right shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.5)]`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="group border-t border-slate-800 transition hover:bg-slate-900/60"
                  >
                    <td
                      className={`${tdClass} sticky left-0 z-10 min-w-[9rem] bg-slate-950 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] group-hover:bg-slate-900/60 sm:min-w-[10rem]`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{u.username}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-400 md:hidden">{u.email}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:hidden">
                          {u.wins}-{u.losses} · {u.rankPoints} pts · {formatJoined(u.createdAt)}
                        </p>
                        <p className="mt-1 hidden text-[11px] text-slate-500 sm:block lg:hidden">
                          {u.rankPoints} pts
                        </p>
                        <p className="mt-1 hidden text-[11px] text-slate-500 sm:block xl:hidden">
                          Joined {formatJoined(u.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className={`${tdClass} hidden max-w-[14rem] truncate text-slate-300 md:table-cell`}>
                      {u.email}
                    </td>
                    <td className={tdClass}>
                      <RoleBadge role={u.role} />
                    </td>
                    <td className={`${tdClass} hidden tabular-nums text-slate-300 sm:table-cell`}>
                      {u.wins}-{u.losses}
                    </td>
                    <td className={`${tdClass} hidden tabular-nums text-slate-300 lg:table-cell`}>
                      {u.rankPoints}
                    </td>
                    <td className={`${tdClass} hidden whitespace-nowrap text-slate-400 xl:table-cell`}>
                      {formatJoined(u.createdAt)}
                    </td>
                    <td
                      className={`${tdClass} sticky right-0 z-10 min-w-[8.5rem] bg-slate-950 text-right shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.5)] group-hover:bg-slate-900/60`}
                    >
                      <AccountActions user={u} currentUserId={session.user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
