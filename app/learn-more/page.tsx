import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitBranch,
  ListOrdered,
  Trophy,
} from 'lucide-react';
import {
  BRACKET_FORMAT_GUIDES,
  GENERATION_OVERVIEW,
  TWO_STAGE_GUIDE,
} from '@/lib/bracket-formats-guide';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: `Learn more | ${SITE_NAME}`,
  description: `How ${SITE_NAME} generates brackets for single elimination, double elimination, Swiss, and round robin tournaments.`,
};

export default function LearnMorePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-3 text-center sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <BookOpen size={12} />
              Bracket guide
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              How brackets work
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              A plain-language guide to how {SITE_NAME} builds and runs Single Elimination, Double
              Elimination, Swiss, and Round Robin events — from generate bracket to final standings.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            At a glance
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            From registration to champion
          </h2>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GENERATION_OVERVIEW.map(({ title, body }, index) => (
            <li
              key={title}
              className="relative rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6"
            >
              <span className="font-mono text-2xl font-bold leading-none text-slate-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-slate-800 bg-slate-950/40">
        <div className="container py-10 sm:py-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Formats
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              How each bracket is generated
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              Jump to a format below. Every section explains what happens when an organizer clicks{' '}
              <span className="text-slate-300">Generate bracket</span> and how play progresses on
              game day.
            </p>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2">
            {BRACKET_FORMAT_GUIDES.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-brand-500/40 hover:text-brand-200"
              >
                {label}
              </a>
            ))}
            <a
              href="#two-stage"
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-brand-500/40 hover:text-brand-200"
            >
              Two-stage events
            </a>
          </nav>

          <div className="mt-10 space-y-10">
            {BRACKET_FORMAT_GUIDES.map(
              ({ id, label, tag, icon: Icon, summary, bestFor, generation, duringEvent, standings }) => (
                <article
                  key={id}
                  id={id}
                  className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60"
                >
                  <div className="h-1 bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" />
                  <div className="p-5 sm:p-8">
                    <div className="flex flex-wrap items-start gap-3 sm:gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-400">
                        <Icon size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400/90">
                          {tag}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{label}</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                          {summary}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          <span className="font-medium text-slate-400">Best for:</span> {bestFor}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                          <GitBranch size={16} className="text-brand-400" />
                          How {SITE_NAME} generates it
                        </h4>
                        <ul className="mt-3 space-y-2.5">
                          {generation.map((item) => (
                            <li key={item} className="flex gap-2.5 text-sm text-slate-400">
                              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-500/80" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                          <ListOrdered size={16} className="text-brand-400" />
                          On game day
                        </h4>
                        <ul className="mt-3 space-y-2.5">
                          {duringEvent.map((item) => (
                            <li key={item} className="flex gap-2.5 text-sm text-slate-400">
                              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-slate-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-3 text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Standings:</span> {standings}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ),
            )}

            <article
              id="two-stage"
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-slate-950 to-slate-950"
            >
              <div className="h-1 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
              <div className="p-5 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                  Optional setup
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                  {TWO_STAGE_GUIDE.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                  {TWO_STAGE_GUIDE.body}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {TWO_STAGE_GUIDE.steps.map((step) => (
                    <li key={step} className="flex gap-2.5 text-sm text-slate-400">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-500/80" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center sm:p-10">
          <Trophy size={28} className="mx-auto text-brand-400" />
          <h2 className="mt-4 text-xl font-semibold text-white sm:text-2xl">
            Ready to run an event?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
            Browse open tournaments on the circuit or create your own from the dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/tournaments" className="btn-primary inline-flex items-center justify-center gap-2">
              Browse tournaments
              <ArrowRight size={16} />
            </Link>
            <Link href="/register" className="btn-secondary">
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
