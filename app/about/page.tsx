import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Layers,
  MapPin,
  RefreshCw,
  Swords,
  Target,
  Trophy,
  UserPlus,
  Users,
  UsersRound,
  Zap,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { rankedPlayerWhere } from '@/lib/rankings';
import { SITE_DESCRIPTION, SITE_FULL_NAME, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description: `Learn about ${SITE_FULL_NAME} — ${SITE_DESCRIPTION}`,
};

const offerings = [
  {
    icon: Trophy,
    title: 'Tournament brackets',
    body: 'Browse open events, register for brackets, and follow live scores across single elimination, double elimination, Swiss, and round robin formats.',
    href: '/tournaments',
    cta: 'Browse tournaments',
  },
  {
    icon: BarChart3,
    title: 'Circuit rankings',
    body: 'Earn rank points by competing in UGNCBBX events. Standings update as match results are reported so you always know where you sit on the circuit.',
    href: '/rankings',
    cta: 'View rankings',
  },
  {
    icon: Users,
    title: 'Player profiles',
    body: 'Every blader gets a public profile with match history, win rate, and tournament results — a record of your run on the North Carolina circuit.',
    href: '/players',
    cta: 'Find players',
  },
  {
    icon: UsersRound,
    title: 'Community clubs',
    body: 'Local chapters and crews can list their club on the site, coordinate events, and grow the Beyblade X scene in their region.',
    href: '/teams',
    cta: 'Explore teams',
  },
] as const;

const formats = [
  {
    icon: Trophy,
    tag: 'Classic',
    label: 'Single Elimination',
    description: 'Win to advance. One loss and you are out of the bracket.',
  },
  {
    icon: Layers,
    tag: 'Second chance',
    label: 'Double Elimination',
    description: 'Winners and losers brackets — everyone gets another shot before elimination.',
  },
  {
    icon: Users,
    tag: 'No early outs',
    label: 'Swiss Format',
    description: 'Re-paired each round by win record. Play every round on the schedule.',
  },
  {
    icon: RefreshCw,
    tag: 'Full pool',
    label: 'Round Robin',
    description: 'Every player faces everyone. Final standings decide who finishes on top.',
  },
] as const;

const values = [
  {
    icon: Target,
    title: 'Built for game day',
    body: 'Brackets, score reporting, and standings in one place — so organizers and players can focus on the battles, not the paperwork.',
  },
  {
    icon: Swords,
    title: 'Competitive by design',
    body: 'Rank points and public profiles reward consistent performance across events, not just one lucky run.',
  },
  {
    icon: MapPin,
    title: 'North Carolina first',
    body: 'UGNCBBX is a home circuit for bladers across NC — local events, regional clubs, and a shared leaderboard.',
  },
] as const;

export default async function AboutPage() {
  const [totalPlayers, totalMatches, totalTournaments, totalClubs] = await Promise.all([
    prisma.user.count({ where: rankedPlayerWhere }),
    prisma.match.count({ where: { status: 'complete' } }),
    prisma.tournament.count(),
    prisma.communityClub.count(),
  ]);

  const stats = [
    { label: 'Ranked bladers', shortLabel: 'Bladers', value: totalPlayers.toLocaleString(), icon: Users },
    { label: 'Matches played', shortLabel: 'Matches', value: totalMatches.toLocaleString(), icon: Swords },
    { label: 'Events hosted', shortLabel: 'Events', value: totalTournaments.toLocaleString(), icon: Trophy },
    { label: 'Community clubs', shortLabel: 'Clubs', value: totalClubs.toLocaleString(), icon: UsersRound },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <Zap size={12} />
              About the circuit
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              {SITE_NAME}
            </h1>
            <p className="text-base font-medium text-slate-300 sm:text-lg">{SITE_FULL_NAME}</p>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              {SITE_DESCRIPTION} UGNCBBX is the platform where bladers register for events, report
              match results, and climb a shared circuit ranking — from local shop battles to
              regional showdowns across North Carolina.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ label, shortLabel, value, icon: Icon }) => (
              <div
                key={label}
                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-brand-400 sm:h-9 sm:w-9">
                  <Icon size={15} className="sm:hidden" />
                  <Icon size={16} className="hidden sm:block" />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold tabular-nums text-white sm:text-lg">{value}</p>
                  <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                    <span className="sm:hidden">{shortLabel}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Our mission</p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            One circuit for competitive Beyblade X in North Carolina
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            Beyblade X deserves a proper competitive home — organized brackets, transparent
            standings, and a ranking system that rewards showing up and winning. UGNCBBX connects
            organizers, players, and clubs on a single platform so every event contributes to the
            same circuit.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
          {values.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-400">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white sm:text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-950/40">
        <div className="container py-10 sm:py-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              What you can do
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Everything on one platform
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              Whether you are entering your first bracket or running a monthly locals, UGNCBBX has
              the tools to compete and grow the scene.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:gap-5">
            {offerings.map(({ icon: Icon, title, body, href, cta }) => (
              <article
                key={title}
                className="group flex min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700 sm:p-6"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-brand-400 transition group-hover:border-slate-700">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{body}</p>
                <Link
                  href={href}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-300 transition hover:text-brand-200"
                >
                  {cta}
                  <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bracket styles
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Tournament formats</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              Every UGNCBBX event runs one of these four formats. Pick the bracket that matches how
              you want to compete.
            </p>
          </div>
          <Link
            href="/tournaments"
            className="btn-secondary inline-flex shrink-0 items-center gap-2 self-start sm:self-auto"
          >
            Browse events
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-10 xl:grid-cols-4">
          {formats.map(({ icon: Icon, tag, label, description }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300">
                  <Icon size={15} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {tag}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white sm:text-base">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-10 sm:pb-14 lg:pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-slate-900 px-5 py-10 text-center sm:px-12 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Join the circuit
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Ready to spin in?
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Create a free account, find an open event near you, and start earning rank points on
              the UGNCBBX circuit.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link
                href="/register"
                className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <UserPlus size={16} />
                Create account
              </Link>
              <Link href="/tournaments" className="btn-secondary w-full sm:w-auto">
                Browse tournaments
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
