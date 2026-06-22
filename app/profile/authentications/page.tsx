import { Shield } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';

export default function AuthenticationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Authentications</h1>
        <p className="mt-1 text-sm text-slate-400">
          Connected sign-in methods and two-factor security.
        </p>
      </div>
      <ProfileSettingsComingSoon
        icon={Shield}
        title="Authentication options coming soon"
        description="Link social accounts, passkeys, and two-factor authentication from this page."
      />
    </div>
  );
}
