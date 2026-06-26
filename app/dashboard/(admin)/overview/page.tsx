import Link from 'next/link';
import {
  ArrowRight,
  Crown,
  Flag,
  Mail,
  Shield,
  Trophy,
  Users,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { registeredAccountsWhere } from '@/lib/search';

export const dynamic = 'force-dynamic';

function formatOverviewDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function OverviewCard({
  href,
  label,
  value,
  detail,
  icon: Icon,
  tone = 'default',
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone?: 'default' | 'brand' | 'amber';
}) {
  const tones = {
    default: {
      border: 'border-slate-800 hover:border-slate-700',
      bg: 'bg-slate-950',
      icon: 'border-slate-700 bg-slate-900 text-slate-400',
    },
    brand: {
      border: 'border-brand-500/20 hover:border-brand-500/35',
      bg: 'bg-slate-950',
      icon: 'border-brand-500/30 bg-brand-500/10 text-brand-400',
    },
    amber: {
      border: 'border-amber-500/25 hover:border-amber-500/40',
      bg: 'bg-amber-500/[0.04]',
      icon: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    },
  };
  const style = tones[tone];

  return (
    <Link
      href={href}
      className={`group rounded-xl border ${style.border} ${style.bg} p-4 transition hover:bg-slate-900/80`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${style.icon}`}
        >
          <Icon size={17} />
        </span>
        <ArrowRight
          size={15}
          className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-brand-300"
        />
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{detail}</p>
    </Link>
  );
}

export default async function DashboardOverviewPage() {
  const [
    registeredCount,
    guestCount,
    playerCount,
    adminCount,
    organizerCount,
    premierCount,
    tournamentCount,
    openTournamentCount,
    activeTournamentCount,
    completeTournamentCount,
    clubCount,
    pendingClubRequests,
    pendingOrganizerRequests,
    pendingContactMessages,
  ] = await Promise.all([
    prisma.user.count({ where: registeredAccountsWhere() }),
    prisma.user.count({ where: { role: 'guest' } }),
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
    prisma.communityClub.count(),
    prisma.clubRequest.count({ where: { status: 'pending' } }),
    prisma.organizerRequest.count({ where: { status: 'pending' } }),
    prisma.contactMessage.count({ where: { status: 'pending' } }),
  ]);

  const pendingTotal = pendingClubRequests + pendingOrganizerRequests + pendingContactMessages;
  const pendingHref =
    pendingContactMessages > 0
      ? '/dashboard/contact'
      : pendingClubRequests > 0
        ? '/dashboard/clubs'
        : '/dashboard/accounts';

  const clubDetail =
    pendingClubRequests > 0
      ? `${clubCount} listed · ${pendingClubRequests} request${pendingClubRequests === 1 ? '' : 's'} pending`
      : `${clubCount} listed on teams page`;

  const accountDetail = [
    `${playerCount} player${playerCount === 1 ? '' : 's'}`,
    `${organizerCount} organizer${organizerCount === 1 ? '' : 's'}`,
    `${adminCount} admin${adminCount === 1 ? '' : 's'}`,
    guestCount > 0
      ? `${guestCount} walk-in${guestCount === 1 ? '' : 's'} (not listed by default)`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(34,197,94,0.1),transparent_55%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">Admin</p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Overview</h2>
            <p className="mt-1 text-sm text-slate-400">What needs attention across the site.</p>
          </div>
          <p className="text-sm text-slate-500">{formatOverviewDate(new Date())}</p>
        </div>
      </div>

      {pendingTotal > 0 ? (
        <Link
          href={pendingHref}
          className="group flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-slate-950 px-4 py-4 transition hover:border-amber-500/45 sm:px-5"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Flag size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-amber-100">Pending review</p>
              <p className="mt-0.5 text-sm text-amber-200/70">
                {pendingContactMessages} contact · {pendingOrganizerRequests} organizer ·{' '}
                {pendingClubRequests} club
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-3xl font-semibold tabular-nums text-white">{pendingTotal}</span>
            <ArrowRight
              size={18}
              className="text-amber-300/60 transition group-hover:translate-x-0.5 group-hover:text-amber-200"
            />
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-500">
          <Mail size={16} className="shrink-0 text-slate-600" />
          Moderation queue is clear — no pending contact, organizer, or club requests.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          href="/dashboard/accounts"
          label="Accounts"
          value={registeredCount}
          detail={accountDetail}
          icon={Users}
          tone="brand"
        />
        <OverviewCard
          href="/dashboard/tournaments"
          label="Tournaments"
          value={tournamentCount}
          detail={`${openTournamentCount} open · ${activeTournamentCount} live · ${completeTournamentCount} done`}
          icon={Trophy}
        />
        <OverviewCard
          href="/dashboard/clubs"
          label="Community clubs"
          value={clubCount}
          detail={clubDetail}
          icon={UsersRound}
          tone={pendingClubRequests > 0 ? 'amber' : 'default'}
        />
        <OverviewCard
          href="/dashboard/accounts"
          label="Premier"
          value={premierCount}
          detail="Active paid subscriptions"
          icon={Crown}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/contact"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <Mail size={15} className="text-slate-500" />
          Contact inbox
        </Link>
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <Shield size={15} className="text-slate-500" />
          Accounts
        </Link>
        <Link
          href="/dashboard/tournaments"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <Trophy size={15} className="text-slate-500" />
          Tournaments
        </Link>
        <Link
          href="/dashboard/clubs"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <UsersRound size={15} className="text-slate-500" />
          Clubs
        </Link>
      </div>
    </div>
  );
}
