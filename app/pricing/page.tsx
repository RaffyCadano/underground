import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CreditCard } from 'lucide-react';
import { PricingPlans } from '@/app/components/pricing-plans';
import { getStandardMaxHostedTournaments } from '@/lib/platform-settings';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: `Pricing | ${SITE_NAME}`,
  description: `Compare ${SITE_NAME} Standard and Premier plans for tournament organizers.`,
};

export default async function PricingPage() {
  const standardMaxHosted = await getStandardMaxHostedTournaments();

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-3 text-center sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <CreditCard size={12} />
              Plans for organizers
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Pricing
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Start free with everything you need to run brackets and grow your scene. Upgrade to
              Premier when you want an ad-free experience, higher caps, and pro tools.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <PricingPlans showHeader={false} standardMaxHosted={standardMaxHosted} />
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-500">
          Compare all plan features on the{' '}
          <Link href="/features" className="font-medium text-brand-300 hover:text-brand-200">
            features page
          </Link>
          .
        </p>
      </section>

      <section className="border-t border-slate-800 bg-slate-950/40">
        <div className="container py-10 sm:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">Already have an account?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
              Manage your subscription, billing history, and Premier benefits from your profile.
            </p>
            <Link
              href="/profile/subscriptions"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              Manage subscriptions
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
