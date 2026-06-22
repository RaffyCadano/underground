import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Trophy } from 'lucide-react';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { TOURNAMENTS_COVER_SRC } from '@/lib/site';

export type TournamentStat = {
  label: string;
  shortLabel: string;
  value: number;
  icon: LucideIcon;
};

type Props = {
  stats: TournamentStat[];
};

export function TournamentsHero({ stats }: Props) {
  const totalEvents = stats.find((s) => s.label === 'Total events')?.value ?? 0;
  const openCount = stats.find((s) => s.label === 'Open registration')?.value ?? 0;
  const liveCount = stats.find((s) => s.label === 'Live now')?.value ?? 0;

  return (
    <section className="relative overflow-x-hidden border-b border-slate-800 py-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgba(34,197,94,0.08),transparent)]" />

      <div className="container relative py-8 sm:py-12 lg:py-16">
        <div className="grid min-w-0 gap-6 sm:gap-8 md:grid-cols-2 md:items-center md:gap-8 lg:gap-10 xl:gap-14">
          <ScrollReveal className="relative order-1 min-w-0 md:order-2" direction="right">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/25 sm:aspect-[5/3] sm:rounded-2xl md:aspect-[4/3]">
              <Image
                src={TOURNAMENTS_COVER_SRC}
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
                  <Trophy size={11} />
                  UGNCBBX circuit
                </p>
                <p className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl md:text-2xl">
                  Built for Beyblade X game day
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Brackets, registration, and live results — all on one North Carolina circuit.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate-200 backdrop-blur-sm sm:text-xs">
                    {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
                  </span>
                  {openCount > 0 && (
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium tabular-nums text-emerald-200 backdrop-blur-sm sm:text-xs">
                      {openCount} open
                    </span>
                  )}
                  {liveCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium tabular-nums text-brand-200 backdrop-blur-sm sm:text-xs">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                      {liveCount} live
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

          <div className="order-2 min-w-0 md:order-1">
            <ScrollReveal direction="left">
              <div className="text-center md:text-left">
                <p className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300 md:mx-0">
                  <Trophy size={12} />
                  UGNCBBX events
                </p>
                <h1 className="mx-auto mt-4 max-w-2xl text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-white min-[480px]:text-3xl sm:text-4xl md:mx-0 md:text-[2.5rem] lg:text-5xl">
                  Tournaments
                </h1>
                <div className="mx-auto mt-3 max-w-xl space-y-3 md:mx-0">
                  <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
                    Browse brackets, register for open events, and follow live competitions across the
                    UGNCBBX circuit.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    From local shop battles to regional showdowns in North Carolina — find upcoming
                    game days, join before brackets lock, and track scores as matches are reported.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    Events run single elimination, double elimination, Swiss, and round robin formats.
                    Ranked tournaments award circuit points so every win counts toward the season
                    leaderboard.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 sm:mt-8 md:rounded-xl">
                <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
                  {stats.map(({ label, shortLabel, value, icon: Icon }, index) => (
                    <ScrollReveal key={label} delay={160 + index * 70} direction="scale">
                      <div className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3.5 text-center sm:flex-row sm:gap-3 sm:px-3 sm:py-4 sm:text-left md:px-4">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-brand-400 sm:h-9 sm:w-9">
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
        </div>
      </div>
    </section>
  );
}
