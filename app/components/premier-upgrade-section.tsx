'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Crown } from 'lucide-react';
import { PremierUpgradeModal } from '@/app/components/premier-upgrade-modal';
import { PREMIER_BENEFITS, PREMIER_PLAN } from '@/lib/subscriptions';
import { SITE_NAME } from '@/lib/site';

function PremierBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
      <Crown size={10} />
      Premier
    </span>
  );
}

export function PremierUpgradeSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        id="premier"
        className="mt-8 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-slate-950 to-slate-950 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">
            Upgrading to {PREMIER_PLAN.name} will give you the following benefits:
          </p>
          <PremierBadge />
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
            onClick={() => setModalOpen(true)}
            className="btn-primary inline-flex items-center gap-2 border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30"
          >
            Upgrade to {PREMIER_PLAN.name}
            <PremierBadge />
          </button>
          <p className="text-sm text-slate-500">
            Learn more about{' '}
            <Link
              href="/features"
              className="font-medium text-brand-300 transition hover:text-brand-200"
            >
              {SITE_NAME} Premier
            </Link>{' '}
            here.
          </p>
        </div>
      </div>

      <PremierUpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
