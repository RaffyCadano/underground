import Link from 'next/link';
import { Check, Crown } from 'lucide-react';
import {
  BILLING_HISTORY_EMPTY,
  COMMUNITY_SUBSCRIPTIONS_EMPTY,
  FREE_PLAN,
  FREE_PLAN_DETAILS,
  PREMIER_BENEFITS,
  PREMIER_PLAN,
} from '@/lib/subscriptions';
import { SITE_NAME } from '@/lib/site';

function SectionCard({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60"
    >
      <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

function premierBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
      <Crown size={10} />
      Premier
    </span>
  );
}

import { isAdminRole } from '@/lib/roles';

export function ProfileSubscriptionsPanel({ role }: { role: string }) {
  const showPremierUpgrade = !isAdminRole(role);

  return (
    <div className="space-y-6">
      <SectionCard title="Current Plan">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-white">{FREE_PLAN.name}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              {FREE_PLAN_DETAILS}
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {FREE_PLAN.label}
          </span>
        </div>

        {showPremierUpgrade && (
          <div
            id="premier"
            className="mt-8 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-slate-950 to-slate-950 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-white">
                Upgrading to {PREMIER_PLAN.name} will give you the following benefits:
              </p>
              {premierBadge()}
            </div>

            <ul className="mt-4 space-y-2.5">
              {PREMIER_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex gap-2.5 text-sm text-slate-300">
                  <Check size={16} className="mt-0.5 shrink-0 text-brand-400" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled
                className="btn-primary inline-flex cursor-not-allowed items-center gap-2 opacity-60"
              >
                Upgrade to {PREMIER_PLAN.name}
                {premierBadge()}
              </button>
              <p className="text-sm text-slate-500">
                Learn more about{' '}
                <Link
                  href="#premier"
                  className="font-medium text-brand-300 transition hover:text-brand-200"
                >
                  {SITE_NAME} Premier
                </Link>{' '}
                here.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Community Subscriptions">
        <p className="text-sm leading-relaxed text-slate-400">{COMMUNITY_SUBSCRIPTIONS_EMPTY}</p>
      </SectionCard>

      <SectionCard title="Billing History">
        <p className="text-sm leading-relaxed text-slate-400">{BILLING_HISTORY_EMPTY}</p>
      </SectionCard>
    </div>
  );
}
