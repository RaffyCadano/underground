import type Stripe from 'stripe';
import { isPremierPlan } from '@/lib/subscriptions';
import {
  billingIntervalFromPrice,
  getStripe,
  isActiveSubscriptionStatus,
} from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

function periodEndFromSubscription(subscription: Stripe.Subscription): Date | null {
  const end = subscription.items.data[0]?.current_period_end;
  return end ? new Date(end * 1000) : null;
}

function billingIntervalFromSubscription(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;
  return price ? billingIntervalFromPrice(price) : null;
}

export async function syncUserSubscriptionFromStripe(
  userId: string,
  subscription: Stripe.Subscription,
  stripeCustomerId?: string | null,
) {
  const active = isActiveSubscriptionStatus(subscription.status);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: active ? 'premier' : 'free',
      stripeCustomerId: stripeCustomerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      billingInterval: billingIntervalFromSubscription(subscription),
      currentPeriodEnd: periodEndFromSubscription(subscription),
    },
  });
}

export async function clearUserSubscription(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: 'free',
      stripeSubscriptionId: null,
      subscriptionStatus: 'canceled',
      billingInterval: null,
      currentPeriodEnd: null,
    },
  });
}

export async function resolveUserIdFromSubscription(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const metadataUserId = subscription.metadata.userId;
  if (metadataUserId) return metadataUserId;

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  if (!customerId) return null;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function getOrCreateStripeCustomer(user: {
  id: string;
  email: string;
  stripeCustomerId: string | null;
}) {
  const stripe = getStripe();

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export function userHasActivePremier(plan: string, status: string | null | undefined): boolean {
  if (!isPremierPlan(plan)) return false;
  if (!status) return true;
  return status === 'active' || status === 'trialing';
}
