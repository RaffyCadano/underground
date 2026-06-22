import { UsersRound } from 'lucide-react';
import Link from 'next/link';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';

export default function YourCommunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Your communities</h1>
        <p className="mt-1 text-sm text-slate-400">
          Clubs and communities you belong to on UGNCBBX.
        </p>
      </div>
      <ProfileSettingsComingSoon
        icon={UsersRound}
        title="No communities yet"
        description="Join a community from the discover page to see it here."
      />
      <Link href="/teams" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
        Discover Communities →
      </Link>
    </div>
  );
}
