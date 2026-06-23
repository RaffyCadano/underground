'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Crown, Minus } from 'lucide-react';
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
      className={`block max-w-xs text-sm leading-snug ${
        premier ? 'text-amber-100/90' : 'text-slate-300'
      }`}
    >
      {value}
    </span>
  );
}

export function PlanFeaturesComparison() {
  const [activeCategoryId, setActiveCategoryId] = useState(PLAN_FEATURE_CATEGORIES[0]?.id ?? 'tournaments');
  const activeCategory =
    PLAN_FEATURE_CATEGORIES.find((category) => category.id === activeCategoryId) ??
    PLAN_FEATURE_CATEGORIES[0];

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <nav
        aria-label="Feature categories"
        className="sticky top-14 z-30 -mx-4 border-b border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-slate-950/85 sm:-mx-6 sm:px-6 lg:top-20 lg:mx-0 lg:w-56 lg:shrink-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
      >
        <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wider text-slate-500 lg:block">
          Features
        </p>
        <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {PLAN_FEATURE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const active = category.id === activeCategoryId;

            return (
              <li key={category.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition lg:px-4 lg:py-3 ${
                    active
                      ? 'border-brand-500/30 bg-brand-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon
                    size={18}
                    className={active ? 'text-brand-400' : 'text-slate-500'}
                  />
                  {category.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th
                    scope="col"
                    className="px-4 py-4 text-sm font-semibold text-slate-400 sm:px-6"
                  >
                    Features
                  </th>
                  <th
                    scope="col"
                    className="w-[28%] px-4 py-4 text-sm font-semibold text-white sm:px-6"
                  >
                    {FREE_PLAN.productName}
                  </th>
                  <th
                    scope="col"
                    className="w-[32%] border-l border-amber-500/10 bg-amber-500/5 px-4 py-4 text-sm font-semibold text-white sm:px-6"
                  >
                    <span className="inline-flex flex-wrap items-center gap-1">
                      {PREMIER_PLAN.productName}
                      <PremierHeaderBadge />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeCategory.rows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-slate-800/80 ${
                      index % 2 === 0 ? 'bg-slate-950/20' : ''
                    }`}
                  >
                    <th
                      scope="row"
                      className="px-4 py-3.5 text-sm font-medium text-slate-200 sm:px-6 sm:py-4"
                    >
                      {row.feature}
                    </th>
                    <td className="px-4 py-3.5 align-middle sm:px-6 sm:py-4">
                      <FeatureCell value={row.standard} />
                    </td>
                    <td className="border-l border-amber-500/10 bg-amber-500/[0.03] px-4 py-3.5 align-middle sm:px-6 sm:py-4">
                      <FeatureCell value={row.premier} premier />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-500">
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
