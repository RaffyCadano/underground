import { SITE_NAME } from '@/lib/site';

export const FREE_PLAN = {
  name: 'Free',
  label: 'Current plan',
  productName: 'Standard',
  badge: 'Free Plan',
  priceMonthly: 0,
  priceAnnualPerMonth: 0,
  description: 'Everything you need to run locals and grow your scene — on us.',
} as const;

export type PremierBillingPeriod = 'annual' | 'monthly';

export const SUBSCRIPTION_PLANS = ['free', 'premier'] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export function isPremierPlan(plan: string): boolean {
  return plan === 'premier';
}

export const PREMIER_PLAN = {
  name: 'Premier',
  productName: 'Premier',
  badge: 'Premier Plan',
  priceMonthly: 12,
  priceAnnualPerMonth: 6.99,
  priceAnnualTotal: 83.88,
  description:
    'For shops, crews, and organizers who want a polished event presence without the ads.',
} as const;

export function freePlanFeatures(standardMaxHosted: number): string[] {
  return [
    'On-page ads help keep the platform free',
    `Host up to ${standardMaxHosted} tournaments`,
    'Unranked brackets with up to 256 players each',
    'Single/double elim, Swiss, round robin, and two-stage formats',
    'Bulk registration, walk-ins, standings, and score reporting',
    'Embeddable brackets with display ads',
  ];
}

/** Default list when platform settings are not loaded (e.g. static imports). */
export const FREE_PLAN_FEATURES = freePlanFeatures(3);

export const PREMIER_PLAN_FEATURES = [
  'Ad-free browsing for you and your players',
  'Unlimited hosted tournaments',
  'Ranked events and unlimited player caps',
  'Embeddable brackets without display ads',
  'Priority support when you need a hand',
  'All bracket formats, two-stage play, and walk-in support',
] as const;

export function freePlanDetails(standardMaxHosted: number): string {
  return `The free tier includes on-page ads, up to ${standardMaxHosted} hosted tournaments, unranked events capped at 256 players, and all core bracket tools.`;
}

/** Default copy when platform settings are not loaded. */
export const FREE_PLAN_DETAILS = freePlanDetails(3);

/** Shorter list for the manage-subscriptions upgrade panel. */
export const PREMIER_BENEFITS = [
  'Browse and run events without on-page ads',
  'Unlimited tournaments with ranked events and no player cap',
  'Embed brackets without display ads',
] as const;

export const COMMUNITY_SUBSCRIPTIONS_EMPTY =
  'Your community subscriptions will show up once you start your own community.';

export const BILLING_HISTORY_EMPTY =
  `Your billing history will show up once you subscribe as a ${SITE_NAME} Premier user.`;

export function formatPlanPrice(amount: number) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export const PREMIER_ANNUAL_SAVINGS_PERCENT = 40;
