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
    accent: 'from-sky-500/20 to-transparent border-sky-500/25 text-sky-300',
    iconBg: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  },
  {
    label: 'Double Elimination',
    tag: 'Second chance',
    description: 'Winners and losers brackets — everyone gets another shot before elimination.',
    icon: Layers,
    accent: 'from-amber-500/20 to-transparent border-amber-500/25 text-amber-300',
    iconBg: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  {
    label: 'Swiss Format',
    tag: 'No early outs',
    description: 'Re-paired each round by win record. Play every round on the schedule.',
    icon: Users,
    accent: 'from-violet-500/20 to-transparent border-violet-500/25 text-violet-300',
    iconBg: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  },
  {
    label: 'Round Robin',
    tag: 'Full pool',
    description: 'Every player faces everyone. Final standings decide who finishes on top.',
    icon: RefreshCw,
    accent: 'from-emerald-500/20 to-transparent border-emerald-500/25 text-emerald-300',
    iconBg: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
] as const;

function StepCard({
  step,
  title,
  body,
  href,
  cta,
  icon: Icon,
  showConnector,
}: (typeof STEPS)[number] & { showConnector?: boolean }) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      {showConnector && (
        <div
          className="pointer-events-none absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-brand-500/50 to-brand-500/10 lg:block"
          aria-hidden
        />
      )}
      <div className="group relative flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-300 transition group-hover:border-brand-400/40 group-hover:bg-brand-500/15">
            <Icon size={20} />
          </span>
          <span className="font-mono text-2xl font-bold tabular-nums text-slate-800 transition group-hover:text-brand-500/25">
            0{step}
          </span>
        </div>
        <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{body}</p>
        <Link
          href={href}
          className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3.5 py-2 text-sm font-semibold text-brand-200 transition hover:border-brand-400/40 hover:bg-brand-500/15"
        >
          {cta}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function FormatCard({
  label,
  tag,
  description,
  icon: Icon,
  accent,
  iconBg,
}: (typeof FORMATS)[number]) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accent} p-5 transition hover:brightness-110 sm:p-6`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconBg}`}>
          <Icon size={18} />
        </span>
        <span className="rounded-full border border-slate-700/80 bg-slate-950/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {tag}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(34,197,94,0.07),transparent)]" />

      <div className="container relative py-12 sm:py-20">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
            Underground circuit
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Here&apos;s how it works
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            Create an account, join a bracket, and earn rank points — all on one circuit built for
            Beyblade X game day.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-12 sm:mt-16">
          <div className="mb-6 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Path to the podium</p>
              <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Three steps</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
            {STEPS.map((step, i) => (
              <StepCard key={step.step} {...step} showConnector={i < STEPS.length - 1} />
            ))}
          </div>
        </div>

        {/* Formats */}
        <div className="mt-14 sm:mt-20">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Bracket styles</p>
                <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Tournament formats</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Every Underground event runs one of these four formats. Pick the bracket that matches
                  how you want to compete.
                </p>
              </div>
              <Link
                href="/tournaments"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
              >
                Browse events
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {FORMATS.map((format) => (
                <FormatCard key={format.label} {...format} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
