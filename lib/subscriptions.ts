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

export const FREE_PLAN_FEATURES = [
  'On-page ads help keep the platform free',
  'Run unlimited tournaments, events, and communities',
  '256-player cap per bracket',
  'Link-only match attachments (URLs, not file uploads)',
  `Paid registration via Stripe — ${SITE_NAME} takes $0.75 per order`,
] as const;

export const PREMIER_PLAN_FEATURES = [
  'Ad-free browsing for you and your players',
  'Includes one Pro Community License',
  'Embeddable brackets with custom themes',
  'Priority support when you need a hand',
  'Unlimited tournaments, events, and communities',
  '512-player cap per bracket',
  'Upload match files up to 25MB (photos, PDFs, and more)',
  `Stripe payouts with no ${SITE_NAME} fee on paid registrations`,
] as const;

export const FREE_PLAN_DETAILS =
  'The free tier includes on-page ads, brackets capped at 256 players, link-only match attachments, and a $0.75 per-order fee when you run paid events through Stripe.';

/** Shorter list for the manage-subscriptions upgrade panel. */
export const PREMIER_BENEFITS = [
  'Browse and run events without on-page ads',
  'Double the bracket size — up to 512 players',
  'Attach files up to 25MB directly to matches',
  `Keep your full Stripe take — no per-order ${SITE_NAME} fee`,
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
