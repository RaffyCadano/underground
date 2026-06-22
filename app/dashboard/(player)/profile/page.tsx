import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProfileAccountSection } from '@/app/components/profile-account-section';
import { ProfileAvatarUpload } from '@/app/components/profile-avatar-upload';
import { ProfileChangePasswordForm } from '@/app/components/profile-change-password-form';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';

export default async function DashboardProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true, avatar: true, role: true },
  });
  if (!user) redirect('/login');

  const profileHref = `/players/${user.username.toLowerCase()}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Profile settings</h2>
        <p className="mt-1 text-sm text-slate-400">Update how you appear across UGNCBBX.</p>
      </div>

      <ProfileAvatarUpload
        username={user.username}
        avatarUrl={user.avatar}
        uploadEnabled={isSupabaseStorageConfigured()}
      />

      <ProfileChangePasswordForm />

      <ProfileAccountSection
        username={user.username}
        email={user.email}
        role={user.role}
        avatar={user.avatar}
        profileHref={profileHref}
      />
    </div>
  );
}
