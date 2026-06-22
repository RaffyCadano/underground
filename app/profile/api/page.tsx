import { Code } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';

export default function DeveloperApiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Developer API</h1>
        <p className="mt-1 text-sm text-slate-400">
          API keys and integrations for bots, overlays, and tools.
        </p>
      </div>
      <ProfileSettingsComingSoon
        icon={Code}
        title="API access coming soon"
        description="Generate keys and read the API docs when the UGNCBBX developer program opens."
      />
    </div>
  );
}
