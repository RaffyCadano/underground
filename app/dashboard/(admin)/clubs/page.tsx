import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ClubActionsMenu } from '@/app/dashboard/club-actions-menu';
import { ClubRequestActionsMenu } from '@/app/dashboard/club-request-actions-menu';

export const dynamic = 'force-dynamic';

const thClass = 'px-3 py-2.5 text-xs font-semibold uppercase tracking-wider';
const tdClass = 'px-3 py-2.5 align-top';

function formatWhen(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function DashboardClubsPage() {
  const [clubs, pendingRequests] = await Promise.all([
    prisma.communityClub.findMany({
      orderBy: [{ memberCount: 'desc' }, { name: 'asc' }],
    }),
    prisma.clubRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalMembers = clubs.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Community clubs</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage clubs shown on the public teams page.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/teams" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            View public page
          </Link>
          <Link href="/dashboard/clubs/create" className="btn-primary">
            Add club
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Clubs listed</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{clubs.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total members</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{totalMembers}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-amber-200/80">Pending requests</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{pendingRequests.length}</p>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="mb-10">
          <h3 className="mb-1 text-sm font-semibold text-white">Club listing requests</h3>
          <p className="mb-4 text-sm text-slate-400">
            Submitted from the public teams page. Create the club when approved, then mark reviewed.
          </p>
          <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-slate-950">
            <div className="overflow-x-auto">
              <table className="min-w-[52rem] w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className={`${thClass} min-w-[10rem]`}>Club</th>
                    <th className={`${thClass} min-w-[7rem]`}>Region</th>
                    <th className={`${thClass} hidden min-w-[6rem] sm:table-cell`}>Captain</th>
                    <th className={`${thClass} min-w-[5rem]`}>Members</th>
                    <th className={`${thClass} hidden min-w-[9rem] md:table-cell`}>Contact</th>
                    <th className={`${thClass} hidden min-w-[6rem] lg:table-cell`}>From</th>
                    <th className={`${thClass} min-w-[10rem]`}>Message</th>
                    <th className={`${thClass} min-w-[7rem]`}>Submitted</th>
                    <th className={`${thClass} w-12 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-t border-slate-800/80 bg-amber-500/[0.03] transition hover:bg-amber-500/[0.06]"
                    >
                      <td className={tdClass}>
                        <p className="font-medium text-white">{request.clubName}</p>
                      </td>
                      <td className={`${tdClass} text-slate-300`}>{request.region}</td>
                      <td className={`${tdClass} hidden text-slate-400 sm:table-cell`}>
                        {request.captain ?? '—'}
                      </td>
                      <td className={`${tdClass} tabular-nums text-slate-300`}>
                        {request.memberCount ?? '—'}
                      </td>
                      <td className={`${tdClass} hidden md:table-cell`}>
                        <a
                          href={`mailto:${request.contactEmail}`}
                          className="text-brand-300 hover:text-brand-200"
                        >
                          {request.contactEmail}
                        </a>
                      </td>
                      <td className={`${tdClass} hidden text-slate-400 lg:table-cell`}>
                        {request.contactName ?? '—'}
                      </td>
                      <td className={tdClass}>
                        <p className="line-clamp-2 whitespace-pre-wrap text-slate-400">
                          {request.message ?? '—'}
                        </p>
                      </td>
                      <td className={`${tdClass} text-xs text-slate-500`}>
                        {formatWhen(request.createdAt)}
                      </td>
                      <td className={tdClass}>
                        <ClubRequestActionsMenu requestId={request.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-white">Listed clubs</h3>
        {clubs.length === 0 ? (
          <div className="card-muted p-8 text-center text-slate-400">
            No community clubs yet.{' '}
            <Link href="/dashboard/clubs/create" className="font-semibold text-brand-300 hover:text-brand-200">
              Add one
            </Link>{' '}
            to get started.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="overflow-x-auto">
              <table className="min-w-[48rem] w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className={`${thClass} min-w-[10rem]`}>Club</th>
                    <th className={`${thClass} hidden min-w-[10rem] md:table-cell`}>Tagline</th>
                    <th className={`${thClass} min-w-[7rem]`}>Region</th>
                    <th className={`${thClass} min-w-[5rem]`}>Members</th>
                    <th className={`${thClass} hidden min-w-[5rem] sm:table-cell`}>Events</th>
                    <th className={`${thClass} hidden min-w-[6rem] lg:table-cell`}>Captain</th>
                    <th className={`${thClass} min-w-[5rem]`}>Status</th>
                    <th className={`${thClass} w-12 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <tr
                      key={club.id}
                      className="border-t border-slate-800/80 transition hover:bg-slate-900/50"
                    >
                      <td className={tdClass}>
                        <p className="font-medium text-white">{club.name}</p>
                      </td>
                      <td className={`${tdClass} hidden text-slate-400 md:table-cell`}>
                        {club.tagline ?? '—'}
                      </td>
                      <td className={`${tdClass} text-slate-300`}>{club.region}</td>
                      <td className={`${tdClass} tabular-nums text-slate-300`}>{club.memberCount}</td>
                      <td className={`${tdClass} hidden tabular-nums text-slate-300 sm:table-cell`}>
                        {club.eventsCount}
                      </td>
                      <td className={`${tdClass} hidden text-slate-400 lg:table-cell`}>
                        {club.captain ?? '—'}
                      </td>
                      <td className={tdClass}>
                        {club.verified ? (
                          <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                            Verified
                          </span>
                        ) : (
                          <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <ClubActionsMenu clubId={club.id} clubName={club.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
