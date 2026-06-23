import { Crown } from 'lucide-react';
import { PremierUpgradeSection } from '@/app/components/premier-upgrade-section';
import { isAdminRole } from '@/lib/roles';
import {
  BILLING_HISTORY_EMPTY,
  COMMUNITY_SUBSCRIPTIONS_EMPTY,
  FREE_PLAN,
  FREE_PLAN_DETAILS,
  isPremierPlan,
  PREMIER_PLAN,
} from '@/lib/subscriptions';

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

export function ProfileSubscriptionsPanel({
  role,
  subscriptionPlan = 'free',
}: {
  role: string;
  subscriptionPlan?: string;
}) {
  const showPremierUpgrade = !isAdminRole(role) && !isPremierPlan(subscriptionPlan);
  const onPremier = isPremierPlan(subscriptionPlan);

  return (
    <div className="space-y-6">
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
              {onPremier
                ? PREMIER_PLAN.description
                : FREE_PLAN_DETAILS}
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {onPremier ? PREMIER_PLAN.badge : FREE_PLAN.label}
          </span>
        </div>

        {showPremierUpgrade && <PremierUpgradeSection />}
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
