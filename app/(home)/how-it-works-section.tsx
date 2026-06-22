import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Layers,
  RefreshCw,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { ScrollReveal } from '@/app/components/scroll-reveal';

const STEPS = [
  {
    step: 1,
    title: 'Create an account',
    body: 'Sign up free and set up your blader profile in seconds.',
    href: '/register',
    cta: 'Register',
    icon: UserPlus,
  },
  {
    step: 2,
    title: 'Join a tournament',
    body: 'Browse open events and enter brackets in your preferred format.',
    href: '/tournaments',
    cta: 'View events',
    icon: Trophy,
  },
  {
    step: 3,
    title: 'Climb the rankings',
    body: 'Report match results and earn rank points on the circuit.',
    href: '/rankings',
    cta: 'See rankings',
    icon: BarChart3,
  },
] as const;

const FORMATS = [
  {
    label: 'Single Elimination',
    tag: 'Classic',
    description: 'Win to advance. One loss and you are out of the bracket.',
    icon: Trophy,
    accent: 'from-sky-500/80 to-sky-600/40',
  },
  {
    label: 'Double Elimination',
    tag: 'Second chance',
    description: 'Winners and losers brackets — everyone gets another shot before elimination.',
    icon: Layers,
    accent: 'from-amber-500/80 to-amber-600/40',
  },
  {
    label: 'Swiss Format',
    tag: 'No early outs',
    description: 'Re-paired each round by win record. Play every round on the schedule.',
    icon: Users,
    accent: 'from-violet-500/80 to-violet-600/40',
  },
  {
    label: 'Round Robin',
    tag: 'Full pool',
    description: 'Every player faces everyone. Final standings decide who finishes on top.',
    icon: RefreshCw,
    accent: 'from-emerald-500/80 to-emerald-600/40',
  },
] as const;

function StepGridCard({
  step,
  title,
  body,
  href,
  cta,
  icon: Icon,
  index = 0,
}: (typeof STEPS)[number] & { index?: number }) {
  return (
    <ScrollReveal className="h-full" delay={index * 120} direction="up">
      <article className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand-500/50 bg-slate-950 font-mono text-[11px] font-bold tabular-nums text-brand-300 sm:h-9 sm:w-9 sm:text-xs">
            0{step}
          </span>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
            <Icon size={18} />
          </span>
        </div>
        <h3 className="mt-4 text-base font-semibold text-white sm:text-lg">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{body}</p>
        <Link
          href={href}
          className="btn-secondary mt-4 inline-flex w-full items-center justify-center gap-2 text-sm sm:w-auto sm:justify-start"
        >
          {cta}
          <ArrowRight size={14} />
        </Link>
      </article>
    </ScrollReveal>
  );
}

function StepTimelineItem({
  step,
  title,
  body,
  href,
  cta,
  icon: Icon,
  isLast,
  index = 0,
}: (typeof STEPS)[number] & { isLast?: boolean; index?: number }) {
  return (
    <li className="relative flex gap-4 pb-10 last:pb-0 xl:gap-6">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[15px] top-10 bottom-0 w-px bg-gradient-to-b from-brand-500/50 via-brand-500/20 to-transparent xl:left-[19px]"
        />
      )}

      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-500/50 bg-slate-950 font-mono text-[11px] font-bold tabular-nums text-brand-300 xl:h-10 xl:w-10 xl:text-xs">
          0{step}
        </span>
      </div>

      <ScrollReveal className="min-w-0 flex-1 pt-0.5" delay={index * 120} direction="right">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700 xl:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white xl:text-lg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          </div>
          <Link
            href={href}
            className="btn-secondary mt-4 inline-flex w-full items-center justify-center gap-2 text-sm sm:w-auto sm:justify-start"
          >
            {cta}
            <ArrowRight size={14} />
          </Link>
        </div>
      </ScrollReveal>
    </li>
  );
}

function FormatCard({
  label,
  tag,
  description,
  icon: Icon,
  accent,
}: (typeof FORMATS)[number]) {
  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
      <div className={`h-1 shrink-0 bg-gradient-to-r ${accent}`} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition group-hover:border-slate-700 group-hover:text-white">
            <Icon size={15} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {tag}
          </span>
        </div>
        <h4 className="mt-3 text-sm font-semibold text-white sm:text-base">{label}</h4>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </article>
  );
}

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
      />

      <div className="container relative py-12 sm:py-16 lg:py-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-x-12 xl:gap-x-16">
          <ScrollReveal className="min-w-0 lg:sticky lg:top-24 lg:self-start" direction="left">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              UGNCBBX circuit
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl xl:text-4xl">
              Here&apos;s how it works
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Create an account, join a bracket, and earn rank points — all on one circuit built for
              Beyblade X game day.
            </p>

            <div className="mt-6 hidden rounded-xl border border-slate-800 bg-slate-950/50 p-4 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Path to the podium
              </p>
              <p className="mt-1 text-sm font-medium text-white">Three steps to compete</p>
            </div>
          </ScrollReveal>

          <div className="mt-8 min-w-0 sm:mt-10 lg:mt-0">
            <ScrollReveal className="mb-5 sm:mb-6 lg:hidden">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Path to the podium
                </p>
                <p className="mt-1 text-sm font-medium text-white">Three steps to compete</p>
              </div>
            </ScrollReveal>

            <ol className="grid auto-rows-fr list-none grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:hidden">
              {STEPS.map((step, index) => (
                <li key={step.step} className="h-full">
                  <StepGridCard {...step} index={index} />
                </li>
              ))}
            </ol>

            <ol className="hidden list-none lg:block">
              {STEPS.map((step, index) => (
                <StepTimelineItem
                  key={step.step}
                  {...step}
                  index={index}
                  isLast={index === STEPS.length - 1}
                />
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-14 sm:mt-16 lg:mt-20">
          <ScrollReveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="min-w-0 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Bracket styles
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  Tournament formats
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
                  Every UGNCBBX event runs one of these four formats. Pick the bracket that matches how
                  you want to compete.
                </p>
              </div>
              <Link
                href="/tournaments"
                className="btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 sm:w-auto sm:self-auto"
              >
                Browse events
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>

          <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {FORMATS.map((format, index) => (
              <ScrollReveal key={format.label} className="h-full" delay={index * 90} direction="up">
                <FormatCard {...format} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
