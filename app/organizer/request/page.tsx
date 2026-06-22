import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  LogIn,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  UserPlus,
} from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { OrganizerRequestForm } from '@/app/components/organizer-request-form';
import { prisma } from '@/lib/prisma';
import { ORGANIZER_COVER_SRC } from '@/lib/site';
import { roleLabel } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function OrganizerRequestPage() {
  const session = await getServerSession(authOptions);

  const [tournamentCount, activeCount, completedCount, organizerCount, pendingRequest] =
    await Promise.all([
      prisma.tournament.count(),
      prisma.tournament.count({ where: { status: 'active' } }),
      prisma.tournament.count({ where: { status: 'complete' } }),
      prisma.user.count({ where: { role: 'organizer' } }),
      session?.user?.id
        ? prisma.organizerRequest.findFirst({
            where: { userId: session.user.id, status: 'pending' },
            select: { id: true, message: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve(null),
    ]);

  const role = session?.user?.role ?? '';
  const hasStaffAccess = role === 'admin' || role === 'organizer';

  const stats: { label: string; shortLabel: string; value: string; icon: LucideIcon }[] = [
    { label: 'Events on circuit', shortLabel: 'Events', value: tournamentCount.toString(), icon: Trophy },
    { label: 'Live tournaments', shortLabel: 'Live', value: activeCount.toString(), icon: Swords },
    { label: 'Completed events', shortLabel: 'Done', value: completedCount.toString(), icon: ClipboardList },
    { label: 'Circuit organizers', shortLabel: 'Staff', value: organizerCount.toString(), icon: Shield },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative overflow-x-hidden border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(56,189,248,0.1),transparent)]" />

        <div className="container relative py-8 sm:py-12 lg:py-16">
          <ScrollReveal>
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to tournaments
            </Link>
          </ScrollReveal>

          <div className="mt-6 grid min-w-0 gap-6 sm:mt-8 sm:gap-8 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10 xl:gap-14">
            <div className="order-2 min-w-0 md:order-1">
              <ScrollReveal direction="left">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
                  <Calendar size={12} />
                  Organizer access
                </p>
                <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-white min-[480px]:text-3xl sm:text-4xl md:text-[2.5rem] lg:text-5xl">
                  Become an organizer
                </h1>
                <div className="mt-3 max-w-xl space-y-3">
                  <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
                    Want to run tournaments on the UGNCBBX circuit? Submit a request for organizer
                    access and help host brackets, report scores, and grow the North Carolina scene.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    Approved organizers can create and manage tournaments on UGNCBBX — seed brackets,
                    handle walk-ins, and keep events moving without full admin access to the rest of
                    the platform.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    Tell us about locals you&apos;ve run, shops or clubs you work with, and what kinds
                    of Beyblade X events you want to host here.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 sm:mt-8">
                  <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
                    {stats.map(({ label, shortLabel, value, icon: Icon }, index) => (
                      <ScrollReveal key={label} delay={160 + index * 70} direction="scale">
                        <div className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3.5 text-center sm:flex-row sm:gap-3 sm:px-3 sm:py-4 sm:text-left md:px-4">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-sky-400 sm:h-9 sm:w-9">
                            <Icon size={15} className="sm:hidden" />
                            <Icon size={16} className="hidden sm:block" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-base font-semibold tabular-nums text-white sm:text-lg">
                              {value}
                            </p>
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
                  src={ORGANIZER_COVER_SRC}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-transparent to-sky-500/10" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6">
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-200 backdrop-blur-sm sm:text-[11px]">
                    <Swords size={11} />
                    UGNCBBX events
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl md:text-2xl">
                    Run brackets on the circuit
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-300 sm:text-sm">
                    Organizers keep tournaments moving — registration, seeding, score reporting, and
                    late-player handling at locals and regionals.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate-200 backdrop-blur-sm sm:text-xs">
                      {tournamentCount} {tournamentCount === 1 ? 'event' : 'events'} hosted
                    </span>
                    {organizerCount > 0 && (
                      <span className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium tabular-nums text-sky-200 backdrop-blur-sm sm:text-xs">
                        {organizerCount} {organizerCount === 1 ? 'organizer' : 'organizers'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-3 -right-3 -z-10 hidden h-full w-full rounded-2xl border border-sky-500/15 bg-sky-500/5 md:block lg:-bottom-5 lg:-right-5"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        <ScrollReveal direction="scale">
          <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-900">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)]" />
            <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:p-10">
              <ScrollReveal direction="left" delay={80}>
                <div className="max-w-xl">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                    <Sparkles size={12} />
                    Request access
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                    What to include
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    The more detail you share, the faster we can review your request and grant
                    organizer access.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-sm text-slate-500">
                    {[
                      'Events you have run or helped staff (locals, shop battles, regionals)',
                      'Shops, clubs, or communities you work with',
                      'What formats you want to host (Swiss, single/double elim, etc.)',
                      'How often you plan to run events on UGNCBBX',
                      'Links to socials or past event posts if you have them',
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-500/80" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/teams"
                      className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                      <Shield size={15} />
                      Browse teams
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
                  {hasStaffAccess ? (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5 sm:p-6">
                      <Shield size={28} className="text-sky-400" />
                      <h3 className="mt-3 text-base font-semibold text-white">You&apos;re already set</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Your account has {roleLabel(role).toLowerCase()} access on UGNCBBX. Head to
                        the dashboard to create and manage tournaments.
                      </p>
                      <Link
                        href="/dashboard/tournaments"
                        className="btn-primary mt-5 inline-flex items-center gap-2"
                      >
                        Manage tournaments
                      </Link>
                    </div>
                  ) : pendingRequest ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6">
                      <Calendar size={28} className="text-amber-400" />
                      <h3 className="mt-3 text-base font-semibold text-white">Request pending</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Submitted{' '}
                        {pendingRequest.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        . The UGNCBBX team will review it soon.
                      </p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Your message
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                        {pendingRequest.message}
                      </p>
                    </div>
                  ) : (
                    <OrganizerRequestForm isLoggedIn={Boolean(session)} />
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
