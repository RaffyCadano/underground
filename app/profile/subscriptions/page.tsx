import { getServerSession } from 'next-auth';
import { ProfileSubscriptionsPanel } from '@/app/components/profile-subscriptions-panel';
import { authOptions } from '@/lib/auth';

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Manage Subscriptions</h1>
        <p className="mt-1 text-sm text-slate-400">
          View your plan, Premier benefits, and billing history.
        </p>
      </div>

      <ProfileSubscriptionsPanel role={session?.user.role ?? 'player'} />
    </div>
  );
}
