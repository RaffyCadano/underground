import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProfileAccountSettingsForm } from '@/app/components/profile-account-settings-form';
import { EmailVerificationToast } from '@/app/profile/email-verification-toast';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminRole } from '@/lib/roles';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { userHasActivePremier } from '@/lib/sync-stripe-subscription';

export const dynamic = 'force-dynamic';

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      emailVerifiedAt: true,
      fullName: true,
      language: true,
      timezone: true,
      country: true,
      avatar: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      blockedUsers: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, identifier: true },
      },
    },
  });
  if (!user) redirect('/login');

  const hasPremier = userHasActivePremier(user.subscriptionPlan, user.subscriptionStatus);

  return (
    <div className="space-y-6">
      <EmailVerificationToast />
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Your Account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your profile, preferences, and notifications.
        </p>
      </div>

      <ProfileAccountSettingsForm
        user={{
          ...user,
          emailVerified: user.emailVerifiedAt != null,
        }}
        hasPremier={hasPremier}
        uploadEnabled={isSupabaseStorageConfigured()}
        canEditUsername={isAdminRole(session.user.role)}
      />
    </div>
  );
}
