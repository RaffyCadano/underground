import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { PlanFeaturesComparison } from '@/app/components/plan-features-comparison';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: `Features | ${SITE_NAME}`,
  description: `Compare ${SITE_NAME} Standard and Premier features for tournaments, events, communities, and integrations.`,
};

export default function FeaturesPage() {
  return (
    <div className="w-full">
      <section className="relative border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-3 text-center sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <Layers size={12} />
              Plans &amp; capabilities
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Features
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              See what&apos;s included with {SITE_NAME} Standard and Premier across tournaments,
              events, communities, and integrations.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <PlanFeaturesComparison />
      </section>

      <section className="border-t border-slate-800 bg-slate-950/40">
        <div className="container py-10 sm:py-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">Ready to upgrade?</h2>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
              View pricing or manage your subscription from your profile.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/pricing" className="btn-primary inline-flex items-center gap-2">
                View pricing
                <ArrowRight size={16} />
              </Link>
              <Link href="/profile/subscriptions" className="btn-secondary">
                Manage subscriptions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
