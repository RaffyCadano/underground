import { getServerSession } from 'next-auth';
import { ProfileSubscriptionsPanel } from '@/app/components/profile-subscriptions-panel';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listCustomerInvoices } from '@/lib/stripe-invoices';

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);

  const billing =
    session?.user?.id != null
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            subscriptionPlan: true,
            subscriptionStatus: true,
            billingInterval: true,
            currentPeriodEnd: true,
            stripeCustomerId: true,
          },
        })
      : null;

  let invoices: Awaited<ReturnType<typeof listCustomerInvoices>> = [];

  if (billing?.stripeCustomerId) {
    try {
      invoices = await listCustomerInvoices(billing.stripeCustomerId);
    } catch (error) {
      console.error('Failed to load billing history:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Manage Subscriptions</h1>
        <p className="mt-1 text-sm text-slate-400">
          View your plan, Premier benefits, and billing history.
        </p>
      </div>

      <ProfileSubscriptionsPanel
        role={session?.user.role ?? 'player'}
        subscriptionPlan={billing?.subscriptionPlan ?? 'free'}
        subscriptionStatus={billing?.subscriptionStatus}
        billingInterval={billing?.billingInterval}
        currentPeriodEnd={billing?.currentPeriodEnd}
        hasStripeCustomer={Boolean(billing?.stripeCustomerId)}
        invoices={invoices}
      />
    </div>
  );
}
