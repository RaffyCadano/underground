'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, Crown } from 'lucide-react';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { isAdminRole } from '@/lib/roles';
import {
  FREE_PLAN,
  FREE_PLAN_FEATURES,
  PREMIER_PLAN,
  PREMIER_PLAN_FEATURES,
  formatPlanPrice,
} from '@/lib/subscriptions';
import { SITE_NAME } from '@/lib/site';

type BillingPeriod = 'annual' | 'monthly';

function PlanBadge({ label, variant }: { label: string; variant: 'free' | 'premier' }) {
  if (variant === 'premier') {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
        <Crown size={10} />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded border border-slate-600 bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
      {label}
    </span>
  );
}

function PlanCard({
  variant,
  badge,
  productName,
  price,
  period,
  billingPeriod,
  description,
  features,
  cta,
}: {
  variant: 'free' | 'premier';
  badge: string;
  productName: string;
  price: number;
  billingPeriod: BillingPeriod;
  description: string;
  features: readonly string[];
  cta: { href: string; label: string; primary?: boolean };
}) {
  const isPremier = variant === 'premier';

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border ${
        isPremier
          ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-950 to-slate-950 shadow-lg shadow-amber-950/10'
          : 'border-slate-800 bg-slate-950/60'
      }`}
    >
      {isPremier && <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />}

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <PlanBadge label={badge} variant={variant} />

        <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            {productName}
            <span className="text-slate-500"> — </span>
            <span className="tabular-nums">{formatPlanPrice(price)}</span>
          </h3>
          <span className="pb-1 text-sm text-slate-500">/ mo</span>
        </div>

        {price > 0 && (
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {billingPeriod === 'annual' ? 'Billed annually' : 'Billed monthly'}
          </p>
        )}

        <p className="mt-4 text-sm leading-relaxed text-slate-400">{description}</p>

        <ul className="mt-6 flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2.5 text-sm text-slate-300">
              <Check
                size={16}
                className={`mt-0.5 shrink-0 ${isPremier ? 'text-amber-400' : 'text-brand-400'}`}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={cta.href}
          className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            cta.primary
              ? 'border border-amber-500/40 bg-amber-500/15 text-amber-100 hover:border-amber-400/50 hover:bg-amber-500/25'
              : 'border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
          }`}
        >
          {cta.label}
        </Link>
      </div>
    </article>
  );
}

export function PricingPlansSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual');
  const { data: session } = useSession();
  const showPremierUpgrade = !session?.user.role || !isAdminRole(session.user.role);

  const premierPrice =
    billingPeriod === 'annual'
      ? PREMIER_PLAN.priceAnnualPerMonth
      : PREMIER_PLAN.priceMonthly;

  return (
    <section className="border-t border-slate-800 bg-slate-950/40">
      <div className="container py-12 sm:py-16 lg:py-20">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Organizers
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl md:text-4xl">
              Pricing &amp; Plans Overview
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              {showPremierUpgrade
                ? `Run events on ${SITE_NAME} for free, or upgrade to Premier when you are ready to grow.`
                : `Run events on ${SITE_NAME} for free.`}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full border border-slate-800 bg-slate-900/80 p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod('annual')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                billingPeriod === 'annual'
                  ? 'bg-brand-500/20 text-brand-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Annual
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                billingPeriod === 'monthly'
                  ? 'bg-brand-500/20 text-brand-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </ScrollReveal>

        <div
          className={`mx-auto mt-10 grid max-w-5xl gap-6 ${
            showPremierUpgrade ? 'lg:grid-cols-2 lg:gap-8' : 'max-w-lg'
          }`}
        >
          <ScrollReveal delay={160}>
            <PlanCard
              variant="free"
              badge={FREE_PLAN.badge}
              productName={FREE_PLAN.productName}
              price={FREE_PLAN.priceMonthly}
              billingPeriod={billingPeriod}
              description={FREE_PLAN.description}
              features={FREE_PLAN_FEATURES}
              cta={{ href: '/register', label: 'Get started free' }}
            />
          </ScrollReveal>

          {showPremierUpgrade && (
            <ScrollReveal delay={220}>
              <PlanCard
                variant="premier"
                badge={PREMIER_PLAN.badge}
                productName={PREMIER_PLAN.productName}
                price={premierPrice}
                billingPeriod={billingPeriod}
                description={PREMIER_PLAN.description}
                features={PREMIER_PLAN_FEATURES}
                cta={{
                  href: '/profile/subscriptions',
                  label: 'Upgrade to Premier',
                  primary: true,
                }}
              />
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
