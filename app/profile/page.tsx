import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProfileAccountSettingsForm } from '@/app/components/profile-account-settings-form';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      fullName: true,
      language: true,
      timezone: true,
      country: true,
      avatar: true,
      emailPrivateMessages: true,
      emailMatchNotifications: true,
      markReadOnEmail: true,
      productUpdates: true,
      optOutPersonalizedAds: true,
      blockedUsers: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, identifier: true },
      },
    },
  });
  if (!user) redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Your Account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your profile, preferences, and notifications.
        </p>
      </div>

      <ProfileAccountSettingsForm
        user={user}
        uploadEnabled={isSupabaseStorageConfigured()}
      />
    </div>
  );
}
