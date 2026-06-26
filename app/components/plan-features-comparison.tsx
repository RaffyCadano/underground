'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, Crown, Minus } from 'lucide-react';
import { InfoTooltip } from '@/app/components/info-tooltip';
import { isAdminRole } from '@/lib/roles';
import { userHasActivePremier } from '@/lib/sync-stripe-subscription';
import {
  FREE_PLAN,
  PREMIER_PLAN,
} from '@/lib/subscriptions';
import {
  PLAN_FEATURE_CATEGORIES,
  type PlanFeatureCell,
} from '@/lib/plan-features';
import { SITE_NAME } from '@/lib/site';

function PremierHeaderBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center gap-1 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
      <Crown size={9} />
      New
    </span>
  );
}

function FeatureCell({ value, premier = false }: { value: PlanFeatureCell; premier?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
        <Check size={16} strokeWidth={2.5} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center text-slate-600">
        <Minus size={16} />
      </span>
    );
  }

  return (
    <span
      className={`block min-w-[8.5rem] max-w-[14rem] text-xs leading-snug sm:min-w-[10rem] sm:max-w-none sm:text-sm ${
        premier ? 'text-amber-100/90' : 'text-slate-300'
      }`}
    >
      {value}
    </span>
  );
}

const stickyFeatureCell =
  'sticky left-0 z-10 bg-slate-950 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-slate-800/80';

const stickyFeatureHeader =
  'sticky left-0 z-20 bg-slate-900/95 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-slate-800';

function PlanColumnButton({
  variant,
  children,
  href,
  disabled = false,
}: {
  variant: 'standard' | 'premier';
  children: ReactNode;
  href?: string;
  disabled?: boolean;
}) {
  const className = `inline-flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
    variant === 'premier'
      ? disabled
        ? 'cursor-default border border-amber-500/30 bg-amber-500/10 text-amber-200/80'
        : 'border border-amber-500/40 bg-amber-500/15 text-amber-100 hover:border-amber-400/50 hover:bg-amber-500/25'
      : disabled
        ? 'cursor-default border border-slate-700 bg-slate-900/80 text-slate-400'
        : 'border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
  }`;

  if (disabled || !href) {
    return (
      <span className={className} aria-current={disabled ? 'page' : undefined}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function PlanFeaturesComparison() {
  const { data: session } = useSession();
  const user = session?.user;
  const onPremier = user
    ? isAdminRole(user.role) ||
      userHasActivePremier(user.subscriptionPlan ?? 'free', user.subscriptionStatus)
    : false;
  const upgradeHref = user ? '/profile/subscriptions' : '/login?callbackUrl=/profile/subscriptions';
  const [activeCategoryId, setActiveCategoryId] = useState(PLAN_FEATURE_CATEGORIES[0]?.id ?? 'tournaments');
  const activeCategory =
    PLAN_FEATURE_CATEGORIES.find((category) => category.id === activeCategoryId) ??
    PLAN_FEATURE_CATEGORIES[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:gap-10">
      <nav
        aria-label="Feature categories"
        className="sticky top-14 z-30 -mx-[clamp(1.25rem,3vw,2.5rem)] border-b border-slate-800/80 bg-slate-950/95 px-[clamp(1.25rem,3vw,2.5rem)] py-3 backdrop-blur supports-[backdrop-filter]:bg-slate-950/85 lg:top-20 lg:mx-0 lg:w-56 lg:shrink-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
      >
        <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wider text-slate-500 lg:block">
          Features
        </p>
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0 lg:snap-none [&::-webkit-scrollbar]:hidden">
          {PLAN_FEATURE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const active = category.id === activeCategoryId;

            return (
              <li key={category.id} className="shrink-0 snap-start lg:shrink">
                <button
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition sm:gap-2.5 sm:px-3.5 lg:w-full lg:px-4 lg:py-3 ${
                    active
                      ? 'border-brand-500/30 bg-brand-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${active ? 'text-brand-400' : 'text-slate-500'}`}
                  />
                  <span className="max-w-[9rem] truncate sm:max-w-none sm:whitespace-normal">
                    {category.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        <p className="mb-3 text-sm font-medium text-slate-300 lg:hidden">{activeCategory.label}</p>
        <p className="mb-3 text-xs text-slate-500 lg:hidden">Swipe horizontally to compare plans.</p>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[40rem] border-collapse text-left sm:min-w-[44rem] lg:min-w-0">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th
                    scope="col"
                    className={`min-w-[9rem] px-3 py-3.5 text-sm font-semibold text-slate-400 sm:min-w-[12rem] sm:px-4 sm:py-4 lg:px-6 ${stickyFeatureHeader}`}
                  >
                    Features
                  </th>
                  <th
                    scope="col"
                    className="min-w-[8.5rem] px-3 py-3.5 text-sm font-semibold text-white sm:min-w-[10rem] sm:px-4 sm:py-4 lg:w-[28%] lg:px-6"
                  >
                    {FREE_PLAN.productName}
                  </th>
                  <th
                    scope="col"
                    className="min-w-[8.5rem] border-l border-amber-500/10 bg-amber-500/5 px-3 py-3.5 text-sm font-semibold text-white sm:min-w-[10rem] sm:px-4 sm:py-4 lg:w-[32%] lg:px-6"
                  >
                    <span className="inline-flex flex-wrap items-center gap-1">
                      {PREMIER_PLAN.productName}
                      <PremierHeaderBadge />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeCategory.rows.map((row, index) => {
                  const rowBg = index % 2 === 0 ? 'bg-slate-950/20' : 'bg-slate-950/60';

                  return (
                    <tr key={row.feature} className={`border-b border-slate-800/80 ${rowBg}`}>
                      <th
                        scope="row"
                        className={`relative min-w-[9rem] px-3 py-3 text-sm font-medium text-slate-200 sm:min-w-[12rem] sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 ${stickyFeatureCell} ${rowBg}`}
                      >
                        <span className="inline-flex items-start gap-0.5 pr-1">
                          <span className="min-w-0">{row.feature}</span>
                          <InfoTooltip text={row.description} />
                        </span>
                      </th>
                      <td className="px-3 py-3 align-top sm:px-4 sm:py-3.5 lg:px-6 lg:py-4">
                        <FeatureCell value={row.standard} />
                      </td>
                      <td className="border-l border-amber-500/10 bg-amber-500/[0.03] px-3 py-3 align-top sm:px-4 sm:py-3.5 lg:px-6 lg:py-4">
                        <FeatureCell value={row.premier} premier />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-800 bg-slate-900/50">
                  <td className={`px-3 py-4 sm:px-4 lg:px-6 ${stickyFeatureCell} bg-slate-900/50`} />
                  <td className="px-3 py-4 sm:px-4 lg:px-6">
                    {!onPremier && (
                      <PlanColumnButton variant="standard" disabled>
                        Your current plan
                      </PlanColumnButton>
                    )}
                  </td>
                  <td className="border-l border-amber-500/10 bg-amber-500/[0.03] px-3 py-4 sm:px-4 lg:px-6">
                    {onPremier ? (
                      <PlanColumnButton variant="premier" href="/profile/subscriptions" disabled>
                        Your current plan
                      </PlanColumnButton>
                    ) : (
                      <PlanColumnButton variant="premier" href={upgradeHref}>
                        Upgrade to Premier
                      </PlanColumnButton>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="mt-5 text-center text-sm leading-relaxed text-slate-500 sm:text-left">
          Compare plans and pricing on the{' '}
          <Link href="/pricing" className="font-medium text-brand-300 hover:text-brand-200">
            pricing page
          </Link>
          , or{' '}
          <Link
            href="/profile/subscriptions"
            className="font-medium text-brand-300 hover:text-brand-200"
          >
            upgrade to {SITE_NAME} Premier
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
