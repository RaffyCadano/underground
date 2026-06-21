import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProfileAvatarUpload } from '@/app/components/profile-avatar-upload';
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
        <p className="mt-1 text-sm text-slate-400">Update how you appear across Underground.</p>
      </div>

      <ProfileAvatarUpload
        username={user.username}
        avatarUrl={user.avatar}
        uploadEnabled={isSupabaseStorageConfigured()}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account</p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs text-slate-500">Username</dt>
              <dd className="mt-1 text-sm font-medium text-white">{user.username}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="mt-1 text-sm font-medium text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Role</dt>
              <dd className="mt-1 text-sm font-medium capitalize text-white">{user.role}</dd>
            </div>
          </dl>
        </div>

        <Link
          href={profileHref}
          className="card flex items-center justify-between p-5 transition hover:border-brand-500/40"
        >
          <div>
            <p className="text-sm font-semibold text-white">Public profile</p>
            <p className="mt-1 text-xs text-slate-500">See how others view you on the circuit</p>
          </div>
          <ArrowRight size={16} className="shrink-0 text-slate-500" />
        </Link>
      </div>
    </div>
  );
}
