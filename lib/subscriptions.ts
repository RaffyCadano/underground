import { SITE_NAME } from '@/lib/site';

export const FREE_PLAN = {
  name: 'Free',
  label: 'Current plan',
  productName: 'Standard',
  badge: 'Free Plan',
  priceMonthly: 0,
  priceAnnualPerMonth: 0,
  description: 'For any organizer who is just getting started.',
} as const;

export const PREMIER_PLAN = {
  name: 'Premier',
  productName: 'Premier',
  badge: 'Premier Plan',
  priceMonthly: 6.99,
  priceAnnualPerMonth: 6.99,
  description:
    'Perfect for any person, venue, brand, group, team, or organization ready to professionalize and promote their efforts.',
} as const;

export const FREE_PLAN_FEATURES = [
  'Ad-supported',
  'Create unlimited tournaments, events, and communities',
  'Up to 256 participants per tournament',
  'Match attachments as external links',
  'Stripe integration ($0.75/order for paid event and tournament registration)',
] as const;

export const PREMIER_PLAN_FEATURES = [
  'No ads',
  'One free Pro Community License',
  'Embed brackets using custom themes',
  'Priority support',
  'Create unlimited tournaments, events, and communities',
  'Up to 512 participants per tournament',
  'Match attachments as file uploads (up to 25MB)',
  `Stripe integration (no ${SITE_NAME} fee for paid event and tournament registrations)`,
] as const;

export const FREE_PLAN_DETAILS =
  'Ad-supported, tournaments have a 256 participant limit, only links are allowed as attachments in a match, and UGNCBBX will charge you $0.75 per order when you create paid events.';

/** Shorter list for the manage-subscriptions upgrade panel. */
export const PREMIER_BENEFITS = [
  'No ads',
  'Increased maximum number of participants to 512',
  'Unlock file attachments of up to 25MB per match',
  'Stripe integration for payments (all fees for paid events are now free)',
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
