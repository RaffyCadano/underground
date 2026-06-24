import Link from 'next/link';
import {
  ArrowRight,
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

type Accent = 'brand' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate';

type StatItem = {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  accent: Accent;
  chips?: string[];
  detail?: string;
  highlight?: boolean;
};

type StatSection = {
  title: string;
  description: string;
  items: StatItem[];
};

const accentStyles: Record<
  Accent,
  { ring: string; icon: string; card: string; chip: string }
> = {
  brand: {
    ring: 'from-brand-500/15',
    icon: 'border-brand-500/30 bg-brand-500/10 text-brand-400',
    card: 'hover:border-brand-500/35',
    chip: 'border-brand-500/20 bg-brand-500/5 text-brand-200/80',
  },
  sky: {
    ring: 'from-sky-500/15',
    icon: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
    card: 'hover:border-sky-500/35',
    chip: 'border-sky-500/20 bg-sky-500/5 text-sky-200/80',
  },
  amber: {
    ring: 'from-amber-500/15',
    icon: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    card: 'hover:border-amber-500/35',
    chip: 'border-amber-500/20 bg-amber-500/5 text-amber-200/80',
  },
  violet: {
    ring: 'from-violet-500/15',
    icon: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
    card: 'hover:border-violet-500/35',
    chip: 'border-violet-500/20 bg-violet-500/5 text-violet-200/80',
  },
  rose: {
    ring: 'from-rose-500/15',
    icon: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    card: 'hover:border-rose-500/35',
    chip: 'border-rose-500/20 bg-rose-500/5 text-rose-200/80',
  },
  slate: {
    ring: 'from-slate-500/10',
    icon: 'border-slate-600 bg-slate-800/80 text-slate-400',
    card: 'hover:border-slate-600',
    chip: 'border-slate-700 bg-slate-900/60 text-slate-400',
  },
};

function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function formatOverviewDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function OverviewStatCard({ stat }: { stat: StatItem }) {
  const styles = accentStyles[stat.accent];
  const Icon = stat.icon;

  return (
    <Link
      href={stat.href}
      className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-5 transition ${styles.card} ${
        stat.highlight ? 'border-amber-500/40 bg-amber-500/[0.04] shadow-lg shadow-amber-500/5' : ''
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.ring} to-transparent opacity-80`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          <Icon size={18} />
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition group-hover:text-brand-300">
          Open
          <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="relative mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-white">{stat.value}</p>
      </div>

      {stat.chips && stat.chips.length > 0 && (
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {stat.chips.map((chip) => (
            <span
              key={chip}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles.chip}`}
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {stat.detail && (
        <p className="relative mt-3 text-sm leading-relaxed text-slate-500">{stat.detail}</p>
      )}
    </Link>
  );
}

function HighlightStatCard({ stat }: { stat: StatItem }) {
  const styles = accentStyles[stat.accent];
  const Icon = stat.icon;

  return (
    <Link
      href={stat.href}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
        stat.highlight
          ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-950/80 to-slate-950 shadow-lg shadow-amber-500/10'
          : `border-slate-800 bg-slate-950/70 ${styles.card}`
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          <Icon size={20} />
        </span>
        <ArrowRight
          size={16}
          className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-brand-300"
        />
      </div>
      <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight text-white">{stat.value}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{stat.label}</p>
      {stat.detail && <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>}
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
    pendingContactMessages,
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
    prisma.contactMessage.count({ where: { status: 'pending' } }),
    prisma.tournamentTemplate.count(),
    prisma.event.count({ where: { status: 'published' } }),
  ]);

  const pendingTotal = pendingClubRequests + pendingOrganizerRequests + pendingContactMessages;

  const highlights: StatItem[] = [
    {
      label: 'Pending review',
      value: pendingTotal,
      detail:
        pendingTotal > 0
          ? `${pendingContactMessages} contact · ${pendingOrganizerRequests} organizer · ${pendingClubRequests} club`
          : 'Queue is clear',
      href: pendingContactMessages > 0 ? '/dashboard/contact' : '/dashboard/accounts',
      icon: Flag,
      accent: 'amber',
      highlight: pendingTotal > 0,
    },
    {
      label: 'Live tournaments',
      value: activeTournamentCount,
      detail: `${openTournamentCount} open for registration`,
      href: '/dashboard/tournaments',
      icon: Trophy,
      accent: 'brand',
    },
    {
      label: 'Total accounts',
      value: userCount,
      detail: `${playerCount} players on the circuit`,
      href: '/dashboard/accounts',
      icon: Users,
      accent: 'sky',
    },
    {
      label: 'Bracket signups',
      value: registrationCount,
      detail: 'Across all tournaments',
      href: '/dashboard/tournaments',
      icon: UserCheck,
      accent: 'violet',
    },
  ];

  const sections: StatSection[] = [
    {
      title: 'People & subscriptions',
      description: 'Accounts, rankings, and paid plans.',
      items: [
        {
          label: 'Accounts',
          value: userCount,
          href: '/dashboard/accounts',
          icon: Users,
          accent: 'sky',
          chips: [
            `${playerCount} players`,
            `${organizerCount} organizers`,
            `${adminCount} admin${adminCount === 1 ? '' : 's'}`,
          ],
        },
        {
          label: 'Premier',
          value: premierCount,
          href: '/dashboard/accounts',
          icon: Crown,
          accent: 'violet',
          detail: 'Active paid subscriptions',
        },
        {
          label: 'Players ranked',
          value: rankedCount,
          href: '/rankings',
          icon: Layers,
          accent: 'brand',
          detail: 'Accounts with ranking points',
        },
      ],
    },
    {
      title: 'Tournaments & play',
      description: 'Brackets, matches, and hosted events.',
      items: [
        {
          label: 'Tournaments',
          value: tournamentCount,
          href: '/dashboard/tournaments',
          icon: Trophy,
          accent: 'brand',
          chips: [
            `${openTournamentCount} open`,
            `${activeTournamentCount} live`,
            `${completeTournamentCount} completed`,
          ],
        },
        {
          label: 'Upcoming',
          value: upcomingTournamentCount,
          href: '/tournaments',
          icon: CalendarClock,
          accent: 'sky',
          detail: 'Open or live, scheduled from today',
        },
        {
          label: 'Matches played',
          value: matchCompleteCount,
          href: '/dashboard/tournaments',
          icon: Swords,
          accent: 'rose',
          detail: 'Reported results on record',
        },
        {
          label: 'Templates',
          value: templateCount,
          href: '/dashboard/tournaments',
          icon: ClipboardList,
          accent: 'slate',
          detail: 'Saved tournament presets by hosts',
        },
        {
          label: 'Published events',
          value: publishedEventCount,
          href: '/dashboard/tournaments',
          icon: Shield,
          accent: 'slate',
          detail: 'Hosted event pages live on site',
        },
      ],
    },
    {
      title: 'Community & moderation',
      description: 'Clubs on the teams page and items awaiting review.',
      items: [
        {
          label: 'Community clubs',
          value: clubCount,
          href: '/dashboard/clubs',
          icon: UsersRound,
          accent: 'brand',
          detail: 'Listed on the teams page',
        },
        {
          label: 'Pending review',
          value: pendingTotal,
          href: pendingContactMessages > 0 ? '/dashboard/contact' : '/dashboard/accounts',
          icon: Flag,
          accent: 'amber',
          highlight: pendingTotal > 0,
          chips: [
            `${pendingContactMessages} contact`,
            `${pendingOrganizerRequests} organizer`,
            `${pendingClubRequests} club`,
          ],
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_0%_-20%,rgba(34,197,94,0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400">Admin dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Overview</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Site-wide stats at a glance — accounts, tournaments, community, and moderation queue.
            </p>
          </div>
          <p className="shrink-0 text-sm text-slate-500">{formatOverviewDate(new Date())}</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">At a glance</h3>
          <p className="text-xs text-slate-500">Key metrics for today</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((stat) => (
            <HighlightStatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">{section.title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {section.items.map((stat) => (
              <OverviewStatCard key={`${section.title}-${stat.label}`} stat={stat} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
