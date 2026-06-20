import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function DashboardOverviewPage() {
  const [userCount, tournamentCount, activeTournamentCount, adminCount, rankedCount, clubCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.tournament.count(),
      prisma.tournament.count({ where: { status: { in: ['open', 'active'] } } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { rankPoints: { gt: 0 } } }),
      prisma.communityClub.count(),
    ]);

  const stats = [
    {
      label: 'Accounts',
      value: userCount,
      detail: `${adminCount} admin${adminCount === 1 ? '' : 's'}`,
      href: '/dashboard/accounts',
    },
    {
      label: 'Tournaments',
      value: tournamentCount,
      detail: `${activeTournamentCount} active / open`,
      href: '/dashboard/tournaments',
    },
    {
      label: 'Community clubs',
      value: clubCount,
      detail: 'Listed on teams page',
      href: '/dashboard/clubs',
    },
    {
      label: 'Players ranked',
      value: rankedCount,
      detail: 'With ranking points',
      href: '/rankings',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Overview</h2>
        <p className="mt-1 text-sm text-slate-400">Site-wide stats at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, href }) => (
          <Link
            key={label}
            href={href}
            className="card group p-5 transition hover:border-brand-500/40"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white tabular-nums">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{detail}</p>
            <p className="mt-4 text-xs font-semibold text-brand-300 opacity-0 transition group-hover:opacity-100">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
