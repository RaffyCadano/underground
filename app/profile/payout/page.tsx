import { Wallet } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';

export default function PayoutPreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Payout Preferences</h1>
        <p className="mt-1 text-sm text-slate-400">
          Choose how you receive prize money and organizer payouts.
        </p>
      </div>
      <ProfileSettingsComingSoon
        icon={Wallet}
        title="Payout setup coming soon"
        description="Link a payout method when prize pools and organizer revenue sharing go live."
      />
    </div>
  );
}
