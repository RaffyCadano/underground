import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import {
  clearUserSubscription,
  resolveUserIdFromSubscription,
  syncUserSubscriptionFromStripe,
} from '@/lib/sync-stripe-subscription';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId ?? session.client_reference_id;
  if (!userId || session.mode !== 'subscription') return;

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  if (!subscriptionId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;

  await syncUserSubscriptionFromStripe(userId, subscription, customerId);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = await resolveUserIdFromSubscription(subscription);
  if (!userId) return;

  if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
    await clearUserSubscription(userId);
    return;
  }

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  await syncUserSubscriptionFromStripe(userId, subscription, customerId);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature error:', error);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Stripe webhook handler error (${event.type}):`, error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
