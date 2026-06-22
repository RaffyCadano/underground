import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';
import { authOptions } from '@/lib/auth';

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <section className="container py-10 lg:py-14">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Messages</h1>
          <p className="mt-1 text-sm text-slate-400">Direct messages and tournament notifications.</p>
        </div>
        <ProfileSettingsComingSoon
          icon={MessageSquare}
          title="No messages yet"
          description="When organizers or opponents message you, conversations will appear here."
        />
      </div>
    </section>
  );
}
