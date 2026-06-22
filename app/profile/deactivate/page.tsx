import { UserX } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';

export default function DeactivateAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Deactivate Account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Temporarily disable or permanently remove your UGNCBBX account.
        </p>
      </div>
      <ProfileSettingsComingSoon
        icon={UserX}
        title="Self-service deactivation coming soon"
        description="You'll be able to deactivate or delete your account here. For now, contact an admin if you need your account removed."
      />
    </div>
  );
}
