'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Crown, Loader2, X } from 'lucide-react';
import {
  PREMIER_PLAN,
  formatPlanPrice,
} from '@/lib/subscriptions';
import { SITE_NAME } from '@/lib/site';

export type PremierBillingPeriod = 'annual' | 'monthly';

type PremierUpgradeModalProps = {
  open: boolean;
  onClose: () => void;
};

function PremierBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
      <Crown size={10} />
      Premier
    </span>
  );
}

export function PremierUpgradeModal({ open, onClose }: PremierUpgradeModalProps) {
  const titleId = useId();
  const promoId = useId();
  const refundId = useId();
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<PremierBillingPeriod>('annual');
  const [promoCode, setPromoCode] = useState('');
  const [agreedToRefundPolicy, setAgreedToRefundPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    setSubmitMessage(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isSubmitting, onClose]);

  if (!open || !mounted) return null;

  async function handleSubscribe() {
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Placeholder until Stripe checkout is wired up.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitMessage('Subscription checkout is coming soon. Your plan selection has been saved.');
  }

  const canSubscribe = agreedToRefundPolicy && !isSubmitting;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id={titleId} className="text-lg font-semibold text-white sm:text-xl">
                  Upgrade to {PREMIER_PLAN.name}
                </h2>
                <PremierBadge />
              </div>
              <p className="mt-1 text-sm text-slate-400">Select Billing Plan</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <fieldset className="space-y-3">
            <legend className="sr-only">Billing period</legend>

            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition ${
                billingPeriod === 'annual'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="premier-billing"
                  checked={billingPeriod === 'annual'}
                  onChange={() => setBillingPeriod('annual')}
                  className="h-4 w-4 border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/40"
                />
                <span className="text-sm font-semibold text-white">Annual</span>
              </span>
              <span className="text-right text-sm text-slate-300">
                <span className="font-semibold tabular-nums text-white">
                  {formatPlanPrice(PREMIER_PLAN.priceAnnualTotal)}
                </span>
                <span className="block text-xs text-slate-500">per year</span>
              </span>
            </label>

            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition ${
                billingPeriod === 'monthly'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="premier-billing"
                  checked={billingPeriod === 'monthly'}
                  onChange={() => setBillingPeriod('monthly')}
                  className="h-4 w-4 border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/40"
                />
                <span className="text-sm font-semibold text-white">Monthly</span>
              </span>
              <span className="text-right text-sm text-slate-300">
                <span className="font-semibold tabular-nums text-white">
                  {formatPlanPrice(PREMIER_PLAN.priceMonthly)}
                </span>
                <span className="block text-xs text-slate-500">per month</span>
              </span>
            </label>
          </fieldset>

          <div className="space-y-1.5">
            <label htmlFor={promoId} className="text-sm font-medium text-slate-300">
              Promo code
            </label>
            <input
              id={promoId}
              type="text"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              placeholder="Promo code"
              autoComplete="off"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-400">
            <input
              id={refundId}
              type="checkbox"
              checked={agreedToRefundPolicy}
              onChange={(event) => setAgreedToRefundPolicy(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/40"
            />
            <span>
              I have read and agreed to {SITE_NAME}&apos;s{' '}
              <Link
                href="/refund-policy"
                target="_blank"
                className="font-medium text-brand-300 underline decoration-slate-700 underline-offset-2 transition hover:text-brand-200"
                onClick={(event) => event.stopPropagation()}
              >
                Refund Policy
              </Link>
              .
            </span>
          </label>

          {submitMessage && (
            <p className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
              {submitMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={!canSubscribe}
            className="btn-primary inline-flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                Upgrade to {PREMIER_PLAN.name}
                <PremierBadge />
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
