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
    <li className="relative flex gap-4 pb-10 last:pb-0 sm:gap-6">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[15px] top-10 bottom-0 w-px bg-gradient-to-b from-brand-500/50 via-brand-500/20 to-transparent sm:left-[19px]"
        />
      )}

      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-500/50 bg-slate-950 font-mono text-[11px] font-bold tabular-nums text-brand-300 sm:h-10 sm:w-10 sm:text-xs">
          0{step}
        </span>
      </div>

      <ScrollReveal className="min-w-0 flex-1 pt-0.5" delay={index * 120} direction="right">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          </div>
          <Link
            href={href}
            className="btn-secondary mt-4 inline-flex items-center gap-2 text-sm"
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
    <article className="group relative flex min-w-[260px] snap-start flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 sm:min-w-0">
      <div className={`h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition group-hover:border-slate-700 group-hover:text-white">
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
          <ScrollReveal className="lg:sticky lg:top-24 lg:self-start" direction="left">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              UGNCBBX circuit
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Here&apos;s how it works
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
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

          <div className="mt-10 lg:mt-0">
            <ScrollReveal>
              <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:hidden">
                Path to the podium · Three steps
              </p>
            </ScrollReveal>
            <ol className="list-none">
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
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
                className="btn-primary inline-flex shrink-0 items-center gap-2 self-start sm:self-auto"
              >
                Browse events
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>

          <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-8 xl:grid-cols-4">
            {FORMATS.map((format, index) => (
              <ScrollReveal key={format.label} delay={index * 90} direction="up">
                <FormatCard {...format} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
