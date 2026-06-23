import { Suspense } from 'react';
import { Crown } from 'lucide-react';
import { BillingHistoryList } from '@/app/components/billing-history-list';
import { CancelPremierButton } from '@/app/components/cancel-premier-button';
import { ManageBillingButton } from '@/app/components/manage-billing-button';
import { PremierUpgradeSection } from '@/app/components/premier-upgrade-section';
import { SubscriptionCheckoutStatus } from '@/app/components/subscription-checkout-status';
import { isAdminRole } from '@/lib/roles';
import {
  COMMUNITY_SUBSCRIPTIONS_EMPTY,
  FREE_PLAN,
  FREE_PLAN_DETAILS,
  PREMIER_PLAN,
} from '@/lib/subscriptions';
import type { BillingInvoice } from '@/lib/stripe-invoices';
import { userHasActivePremier } from '@/lib/sync-stripe-subscription';

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

function formatRenewalDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProfileSubscriptionsPanel({
  role,
  subscriptionPlan = 'free',
  subscriptionStatus = null,
  billingInterval = null,
  currentPeriodEnd = null,
  hasStripeCustomer = false,
  invoices = [],
  cancelAtPeriodEnd = false,
  canCancelPremier = false,
}: {
  role: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string | null;
  billingInterval?: string | null;
  currentPeriodEnd?: Date | null;
  hasStripeCustomer?: boolean;
  invoices?: BillingInvoice[];
  cancelAtPeriodEnd?: boolean;
  canCancelPremier?: boolean;
}) {
  const onPremier = userHasActivePremier(subscriptionPlan, subscriptionStatus);
  const showPremierUpgrade = !isAdminRole(role) && !onPremier;

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <SubscriptionCheckoutStatus />
      </Suspense>

      <SectionCard title="Current Plan">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-2xl font-semibold text-white">
                {onPremier ? PREMIER_PLAN.name : FREE_PLAN.name}
              </p>
              {onPremier && premierBadge()}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              {onPremier ? PREMIER_PLAN.description : FREE_PLAN_DETAILS}
            </p>
            {onPremier && currentPeriodEnd && (
              <p className="mt-2 text-sm text-slate-500">
                {cancelAtPeriodEnd || subscriptionStatus === 'canceled' ? 'Access until' : 'Renews on'}{' '}
                {formatRenewalDate(currentPeriodEnd)}
                {billingInterval ? ` · ${billingInterval === 'annual' ? 'Annual' : 'Monthly'} billing` : ''}
              </p>
            )}
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {onPremier ? PREMIER_PLAN.badge : FREE_PLAN.label}
          </span>
        </div>

        {onPremier && hasStripeCustomer && (
          <div className="mt-6 space-y-3">
            <ManageBillingButton />
            <CancelPremierButton
              currentPeriodEnd={currentPeriodEnd?.toISOString() ?? null}
              cancelAtPeriodEnd={cancelAtPeriodEnd}
              canCancel={canCancelPremier}
            />
          </div>
        )}

        {showPremierUpgrade && <PremierUpgradeSection />}
      </SectionCard>

      <SectionCard title="Community Subscriptions">
        <p className="text-sm leading-relaxed text-slate-400">{COMMUNITY_SUBSCRIPTIONS_EMPTY}</p>
      </SectionCard>

      <SectionCard title="Billing History">
        <BillingHistoryList invoices={invoices} hasStripeCustomer={hasStripeCustomer} />
        {hasStripeCustomer && (
          <p className="mt-4 text-xs text-slate-500">
            Update your payment method in <strong className="font-medium text-slate-400">Manage billing</strong>, or cancel Premier from your current plan above.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
