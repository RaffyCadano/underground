import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';
import { authOptions } from '@/lib/auth';

export default async function NewsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <section className="container py-10 lg:py-14">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">News</h1>
          <p className="mt-1 text-sm text-slate-400">Circuit updates, announcements, and platform news.</p>
        </div>
        <ProfileSettingsComingSoon
          icon={Newspaper}
          title="News feed coming soon"
          description="Stay tuned for UGNCBBX announcements, rule updates, and featured events."
        />
      </div>
    </section>
  );
}
