import Link from 'next/link';
import {
  CalendarClock,
  ClipboardList,
  Crown,
  Flag,
  Layers,
  Shield,
  Swords,
  Trophy,
  UserCheck,
  Users,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma';

function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function OverviewStatCard({
  label,
  value,
  detail,
  href,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="card group flex flex-col p-5 transition hover:border-brand-500/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-400 transition group-hover:border-brand-500/30 group-hover:text-brand-300">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{detail}</p>
      <p className="mt-4 text-xs font-semibold text-brand-300 opacity-0 transition group-hover:opacity-100">
        Open →
      </p>
    </Link>
  );
}

export default async function DashboardOverviewPage() {
  const today = startOfTodayUtc();

  const [
    userCount,
    playerCount,
    adminCount,
    organizerCount,
    premierCount,
    tournamentCount,
    openTournamentCount,
    activeTournamentCount,
    completeTournamentCount,
    upcomingTournamentCount,
    registrationCount,
    matchCompleteCount,
    clubCount,
    rankedCount,
    pendingClubRequests,
    pendingOrganizerRequests,
    templateCount,
    publishedEventCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'player' } }),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { role: 'organizer' } }),
    prisma.user.count({
      where: {
        subscriptionPlan: 'premier',
        OR: [
          { subscriptionStatus: null },
          { subscriptionStatus: { in: ['active', 'trialing'] } },
        ],
      },
    }),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: 'open' } }),
    prisma.tournament.count({ where: { status: 'active' } }),
    prisma.tournament.count({ where: { status: 'complete' } }),
    prisma.tournament.count({
      where: {
        status: { in: ['open', 'active'] },
        date: { gte: today },
      },
    }),
    prisma.tournamentParticipant.count(),
    prisma.match.count({ where: { status: 'complete' } }),
    prisma.communityClub.count(),
    prisma.user.count({ where: { rankPoints: { gt: 0 } } }),
    prisma.clubRequest.count({ where: { status: 'pending' } }),
    prisma.organizerRequest.count({ where: { status: 'pending' } }),
    prisma.tournamentTemplate.count(),
    prisma.event.count({ where: { status: 'published' } }),
  ]);

  const pendingTotal = pendingClubRequests + pendingOrganizerRequests;

  const stats: {
    label: string;
    value: number;
    detail: string;
    href: string;
    icon: LucideIcon;
  }[] = [
    {
      label: 'Accounts',
      value: userCount,
      detail: `${playerCount} players · ${organizerCount} organizers · ${adminCount} admin${adminCount === 1 ? '' : 's'}`,
      href: '/dashboard/accounts',
      icon: Users,
    },
    {
      label: 'Tournaments',
      value: tournamentCount,
      detail: `${openTournamentCount} open · ${activeTournamentCount} live · ${completeTournamentCount} completed`,
      href: '/dashboard/tournaments',
      icon: Trophy,
    },
    {
      label: 'Upcoming',
      value: upcomingTournamentCount,
      detail: 'Open or live, scheduled from today',
      href: '/tournaments',
      icon: CalendarClock,
    },
    {
      label: 'Registrations',
      value: registrationCount,
      detail: 'Players signed up across all brackets',
      href: '/dashboard/tournaments',
      icon: UserCheck,
    },
    {
      label: 'Matches played',
      value: matchCompleteCount,
      detail: 'Reported results on record',
      href: '/dashboard/tournaments',
      icon: Swords,
    },
    {
      label: 'Community clubs',
      value: clubCount,
      detail: 'Listed on the teams page',
      href: '/dashboard/clubs',
      icon: UsersRound,
    },
    {
      label: 'Players ranked',
      value: rankedCount,
      detail: 'Accounts with ranking points',
      href: '/rankings',
      icon: Layers,
    },
    {
      label: 'Premier',
      value: premierCount,
      detail: 'Active paid subscriptions',
      href: '/dashboard/accounts',
      icon: Crown,
    },
    {
      label: 'Pending review',
      value: pendingTotal,
      detail: `${pendingOrganizerRequests} organizer · ${pendingClubRequests} club request${pendingClubRequests === 1 ? '' : 's'}`,
      href: '/dashboard/accounts',
      icon: Flag,
    },
    {
      label: 'Templates',
      value: templateCount,
      detail: 'Saved tournament presets by hosts',
      href: '/dashboard/tournaments',
      icon: ClipboardList,
    },
    {
      label: 'Published events',
      value: publishedEventCount,
      detail: 'Hosted event pages live on site',
      href: '/dashboard/tournaments',
      icon: Shield,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Overview</h2>
        <p className="mt-1 text-sm text-slate-400">Site-wide stats at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {stats.map((stat) => (
          <OverviewStatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
