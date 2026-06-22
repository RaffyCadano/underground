import { ShoppingBag } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-400">
          Entry fees, merchandise, and purchase history.
        </p>
      </div>
      <ProfileSettingsComingSoon
        icon={ShoppingBag}
        title="Order history coming soon"
        description="Tournament entry receipts and shop purchases will show up here."
      />
    </div>
  );
}
