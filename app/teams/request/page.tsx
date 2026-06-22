import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, MapPin, Sparkles, Trophy, UserPlus, Users, UsersRound } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { prisma } from '@/lib/prisma';
import { TEAMS_COVER_SRC } from '@/lib/site';
import { ClubRequestForm } from '../club-request-form';

export default async function ClubRequestPage() {
  const session = await getServerSession(authOptions);

  const [statsAgg, regions] = await Promise.all([
    prisma.communityClub.aggregate({
      _count: true,
      _sum: { memberCount: true, eventsCount: true },
    }),
    prisma.communityClub.findMany({
      select: { region: true },
      distinct: ['region'],
    }),
  ]);

  const stats: { label: string; shortLabel: string; value: string; icon: LucideIcon }[] = [
    { label: 'Listed clubs', shortLabel: 'Clubs', value: statsAgg._count.toString(), icon: UsersRound },
    {
      label: 'Circuit members',
      shortLabel: 'Members',
      value: (statsAgg._sum.memberCount ?? 0).toLocaleString(),
      icon: Users,
    },
    { label: 'NC regions', shortLabel: 'Regions', value: regions.length.toString(), icon: MapPin },
    {
      label: 'Events hosted',
      shortLabel: 'Events',
      value: (statsAgg._sum.eventsCount ?? 0).toLocaleString(),
      icon: Trophy,
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative overflow-x-hidden border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />

        <div className="container relative py-8 sm:py-12 lg:py-16">
          <ScrollReveal>
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to teams
            </Link>
          </ScrollReveal>

          <div className="mt-6 grid min-w-0 gap-6 sm:mt-8 sm:gap-8 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10 xl:gap-14">
            <div className="order-2 min-w-0 md:order-1">
              <ScrollReveal direction="left">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  <UsersRound size={12} />
                  Club listing
                </p>
                <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-white min-[480px]:text-3xl sm:text-4xl md:text-[2.5rem] lg:text-5xl">
                  Request your community club
                </h1>
                <div className="mt-3 max-w-xl space-y-3">
                  <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
                    Running a local chapter or crew? Submit a listing request and the UGNCBBX team will
                    review it for the public teams directory.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    Listed clubs appear on the UGNCBBX teams page so bladers across North Carolina can
                    find your group, see where you meet, and connect before the next local or regional
                    event.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    Whether you run shop weeklies, school clubs, or a traveling crew — a verified listing
                    helps your community grow on the circuit and makes it easier to coordinate members,
                    captains, and game days in one place.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 sm:mt-8">
                  <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
                    {stats.map(({ label, shortLabel, value, icon: Icon }, index) => (
                      <ScrollReveal key={label} delay={160 + index * 70} direction="scale">
                        <div className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3.5 text-center sm:flex-row sm:gap-3 sm:px-3 sm:py-4 sm:text-left md:px-4">
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
              </ScrollReveal>
            </div>

            <ScrollReveal className="relative order-1 min-w-0 md:order-2" direction="right" delay={100}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/25 sm:aspect-[5/3] sm:rounded-2xl md:aspect-[4/3]">
                <Image
                  src={TEAMS_COVER_SRC}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-transparent to-brand-500/10" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6">
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-200 backdrop-blur-sm sm:text-[11px]">
                    <UsersRound size={11} />
                    UGNCBBX clubs
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl md:text-2xl">
                    Build your local chapter
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-300 sm:text-sm">
                    Get your crew listed on the North Carolina Beyblade X circuit directory — connect
                    with bladers, promote locals, and grow your chapter.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate-200 backdrop-blur-sm sm:text-xs">
                      {statsAgg._count} {statsAgg._count === 1 ? 'club' : 'clubs'} listed
                    </span>
                    {regions.length > 0 && (
                      <span className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium tabular-nums text-brand-200 backdrop-blur-sm sm:text-xs">
                        {regions.length} {regions.length === 1 ? 'region' : 'regions'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-3 -right-3 -z-10 hidden h-full w-full rounded-2xl border border-brand-500/15 bg-brand-500/5 md:block lg:-bottom-5 lg:-right-5"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        <ScrollReveal direction="scale">
          <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-slate-900">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
            <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:p-10">
              <ScrollReveal direction="left" delay={80}>
                <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                <Sparkles size={12} />
                Start a club listing
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">What to include</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                The more detail you share, the faster we can review your request and publish your club
                on the public directory.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-500">
                {[
                  'Club name, home region, and captain or lead contact',
                  'Approximate member count and where you typically meet',
                  'How often you run locals, shop battles, or casual sessions',
                  'Links to socials, Discord, or past events if you have them',
                  'Anything else that helps us understand your community',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500/80" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/tournaments"
                  className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <Trophy size={15} />
                  Browse events
                </Link>
                {!session && (
                  <Link
                    href="/register"
                    className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                  >
                    <UserPlus size={15} />
                    Create account
                  </Link>
                )}
              </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={160}>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
                  <ClubRequestForm
                    isLoggedIn={Boolean(session)}
                    defaultContactName={session?.user?.name ?? ''}
                    defaultContactEmail={session?.user?.email ?? ''}
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
