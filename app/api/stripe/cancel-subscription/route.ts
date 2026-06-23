import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { syncUserSubscriptionFromStripe } from '@/lib/sync-stripe-subscription';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
  }

  if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
    return NextResponse.json({ error: 'This subscription is not active.' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const existing = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    if (existing.cancel_at_period_end) {
      return NextResponse.json({ error: 'Your subscription is already set to cancel.' }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await syncUserSubscriptionFromStripe(user.id, subscription, user.stripeCustomerId);

    const periodEnd = subscription.items.data[0]?.current_period_end;
    const accessUntil = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

    return NextResponse.json({
      ok: true,
      accessUntil,
      message: 'Your Premier subscription will cancel at the end of the current billing period.',
    });
  } catch (error) {
    console.error('Stripe cancel subscription error:', error);
    const message = error instanceof Error ? error.message : 'Could not cancel subscription.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
