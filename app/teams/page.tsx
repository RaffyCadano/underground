import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import {
  ArrowRight,
  MapPin,
  Shield,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
import { ListSearch } from '@/app/components/list-search';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { prisma } from '@/lib/prisma';
import { parseSearchQuery } from '@/lib/search';

type Club = {
  id: string;
  name: string;
  tagline: string | null;
  region: string;
  captain: string | null;
  memberCount: number;
  eventsCount: number;
  verified: boolean;
};

function teamInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function clubSearchWhere(query: string): Prisma.CommunityClubWhereInput | undefined {
  if (!query) return undefined;
  return {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { region: { contains: query, mode: 'insensitive' } },
      { tagline: { contains: query, mode: 'insensitive' } },
      { captain: { contains: query, mode: 'insensitive' } },
    ],
  };
}

function ClubCard({ club, featured = false }: { club: Club; featured?: boolean }) {
  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-slate-900/60 transition hover:border-slate-600 ${
        featured ? 'border-brand-500/25 shadow-lg shadow-brand-950/10' : 'border-slate-800'
      }`}
    >
      {featured && <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />}

      <div className="flex h-full flex-col p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-xs font-bold text-brand-200 sm:h-12 sm:w-12 sm:text-sm">
            {teamInitials(club.name)}
          </span>
          <span className="inline-flex max-w-[55%] items-center gap-1 truncate rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:max-w-none sm:px-2.5">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{club.region}</span>
          </span>
        </div>

        <h3 className="mt-3 break-words text-lg font-semibold leading-snug text-white transition group-hover:text-brand-200 sm:mt-4 sm:text-xl">
          {club.name}
        </h3>
        {club.tagline && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{club.tagline}</p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-1.5 text-center sm:mt-5 sm:gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-1 py-2 sm:rounded-xl sm:py-2.5">
            <p className="text-base font-semibold tabular-nums text-white sm:text-lg">{club.memberCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">
              <span className="sm:hidden">Mbrs</span>
              <span className="hidden sm:inline">Members</span>
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-1 py-2 sm:rounded-xl sm:py-2.5">
            <p className="text-base font-semibold tabular-nums text-white sm:text-lg">{club.eventsCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">
              <span className="sm:hidden">Evts</span>
              <span className="hidden sm:inline">Events</span>
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-1 py-2 sm:rounded-xl sm:py-2.5">
            <p className="truncate text-xs font-semibold text-brand-300 sm:text-sm" title={club.captain ?? undefined}>
              {club.captain ?? '—'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">Captain</p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-slate-800 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
          {club.verified ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Shield size={12} />
              Verified club
            </span>
          ) : (
            <span className="text-xs text-slate-600">Community club</span>
          )}
          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-500/35 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-200 sm:w-auto sm:py-1.5">
            <UserPlus size={12} />
            Join club
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qParam } = await searchParams;
  const query = parseSearchQuery(qParam);
  const searchWhere = clubSearchWhere(query);

  const [clubs, statsAgg] = await Promise.all([
    prisma.communityClub.findMany({
      where: searchWhere,
      orderBy: [{ memberCount: 'desc' }, { name: 'asc' }],
    }),
    prisma.communityClub.aggregate({
      _count: true,
      _sum: { memberCount: true, eventsCount: true },
    }),
  ]);

  const totalClubs = statsAgg._count;
  const totalMembers = statsAgg._sum.memberCount ?? 0;
  const totalEvents = statsAgg._sum.eventsCount ?? 0;
  const allRegions = await prisma.communityClub.findMany({
    select: { region: true },
    distinct: ['region'],
  });

  const stats = [
    { label: 'Active clubs', shortLabel: 'Clubs', value: totalClubs.toString(), icon: UsersRound },
    { label: 'Total members', shortLabel: 'Members', value: totalMembers.toLocaleString(), icon: Users },
    { label: 'Regions', shortLabel: 'Regions', value: allRegions.length.toString(), icon: MapPin },
    { label: 'Events hosted', shortLabel: 'Events', value: totalEvents.toLocaleString(), icon: Trophy },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <ScrollReveal className="max-w-2xl space-y-3 sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <UsersRound size={12} />
              UGNCBBX clubs
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">Teams</h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Join a club, coordinate local events, and compete together on the UGNCBBX circuit.
            </p>
          </ScrollReveal>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ label, shortLabel, value, icon: Icon }, index) => (
              <ScrollReveal key={label} delay={120 + index * 70} direction="scale">
                <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        <ScrollReveal className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Directory</p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Community clubs</h2>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-full lg:max-w-xl lg:shrink-0">
            <ListSearch action="/teams" query={query} placeholder="Search clubs, regions…" />
            <Link
              href="/teams/request"
              className="btn-secondary inline-flex h-10 w-full items-center justify-center gap-2 self-end px-5 sm:w-auto"
            >
              <Sparkles size={15} />
              Request club listing
            </Link>
          </div>
        </ScrollReveal>

        {totalClubs === 0 ? (
          <ScrollReveal direction="scale">
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-5 py-12 text-center sm:px-8 sm:py-16">
            <UsersRound size={36} className="mx-auto text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No community clubs listed</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
              Verified local chapters and regional teams will be published here as they join the UGNCBBX circuit.
              You can{' '}
              <Link href="/teams/request" className="font-semibold text-brand-300 hover:text-brand-200">
                request a club listing
              </Link>{' '}
              to get started.
            </p>
            </div>
          </ScrollReveal>
        ) : clubs.length === 0 ? (
          <ScrollReveal direction="scale">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-10 text-center sm:px-8 sm:py-14">
            <p className="text-base font-semibold text-white sm:text-lg">No clubs match &ldquo;{query}&rdquo;</p>
            <Link
              href="/teams"
              className="btn-secondary mt-6 inline-flex h-10 w-full items-center justify-center px-5 sm:w-auto"
            >
              Clear search
            </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {query && (
              <ScrollReveal>
                <p className="mb-5 text-sm text-slate-400 sm:mb-6">
                  {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'} found for &ldquo;{query}&rdquo;
                </p>
              </ScrollReveal>
            )}
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {clubs.map((club, i) => (
                <ScrollReveal key={club.id} className="h-full" delay={i * 90}>
                  <ClubCard club={club} featured={i === 0 && !query} />
                </ScrollReveal>
              ))}
            </div>
          </>
        )}

        <ScrollReveal
          className="relative mt-10 overflow-hidden rounded-2xl border border-brand-500/20 bg-slate-900 sm:mt-14"
          direction="scale"
          delay={120}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                <Sparkles size={12} />
                Start a club listing
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                Run a local chapter or crew?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Submit your club for review and get listed on the UGNCBBX teams directory.
              </p>
            </div>
            <Link
              href="/teams/request"
              className="btn-primary inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 px-5 sm:w-auto"
            >
              Request club listing
              <ArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
