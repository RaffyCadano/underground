import Stripe from 'stripe';
import type { PremierBillingPeriod } from '@/lib/subscriptions';

let stripeClient: Stripe | null = null;

export function getMissingStripeEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY?.trim()) missing.push('STRIPE_SECRET_KEY');
  if (!process.env.STRIPE_PRICE_PREMIER_MONTHLY?.trim()) {
    missing.push('STRIPE_PRICE_PREMIER_MONTHLY');
  }
  if (!process.env.STRIPE_PRICE_PREMIER_ANNUAL?.trim()) {
    missing.push('STRIPE_PRICE_PREMIER_ANNUAL');
  }
  return missing;
}

export function assertStripeCheckoutConfig(): void {
  const missing = getMissingStripeEnvVars();
  if (missing.length > 0) {
    throw new Error(`Stripe is not configured on the server (missing: ${missing.join(', ')}).`);
  }
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
}

export function getPremierPriceId(period: PremierBillingPeriod): string {
  const priceId =
    period === 'annual'
      ? process.env.STRIPE_PRICE_PREMIER_ANNUAL
      : process.env.STRIPE_PRICE_PREMIER_MONTHLY;

  if (!priceId?.trim()) {
    throw new Error(
      period === 'annual'
        ? 'STRIPE_PRICE_PREMIER_ANNUAL is not configured'
        : 'STRIPE_PRICE_PREMIER_MONTHLY is not configured',
    );
  }

  return priceId.trim();
}

export function billingIntervalFromPrice(price: Stripe.Price): PremierBillingPeriod | null {
  if (price.recurring?.interval === 'year') return 'annual';
  if (price.recurring?.interval === 'month') return 'monthly';
  return null;
}

export function isActiveSubscriptionStatus(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing';
}
