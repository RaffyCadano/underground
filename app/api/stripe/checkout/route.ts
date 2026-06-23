import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { PremierBillingPeriod } from '@/lib/subscriptions';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateStripeCustomer } from '@/lib/sync-stripe-subscription';
import { assertStripeCheckoutConfig, getPremierPriceId, getSiteUrl, getStripe } from '@/lib/stripe';

type CheckoutBody = {
  billingPeriod?: PremierBillingPeriod;
  promoCode?: string;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to subscribe.' }, { status: 401 });
  }

  let body: CheckoutBody = {};
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const billingPeriod = body.billingPeriod === 'monthly' ? 'monthly' : 'annual';

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (
    user.subscriptionPlan === 'premier' &&
    (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing')
  ) {
    return NextResponse.json({ error: 'You already have an active Premier subscription.' }, { status: 400 });
  }

  try {
    assertStripeCheckoutConfig();
    const stripe = getStripe();
    const customerId = await getOrCreateStripeCustomer(user);
    const priceId = getPremierPriceId(billingPeriod);
    const siteUrl = getSiteUrl();

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/profile/subscriptions?checkout=success`,
      cancel_url: `${siteUrl}/profile/subscriptions?checkout=canceled`,
      client_reference_id: user.id,
      metadata: { userId: user.id, billingPeriod },
      subscription_data: {
        metadata: { userId: user.id, billingPeriod },
      },
      allow_promotion_codes: true,
    };

    const promoCode = body.promoCode?.trim();
    if (promoCode) {
      const promotionCodes = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      });

      const promotion = promotionCodes.data[0];
      if (promotion) {
        sessionParams.discounts = [{ promotion_code: promotion.id }];
        sessionParams.allow_promotion_codes = false;
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    if (error instanceof Error && error.message.includes('is not configured')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stripeError = error as { message?: string; type?: string };
    const message =
      stripeError.message ??
      (error instanceof Error ? error.message : 'Checkout failed. Please try again.');

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
