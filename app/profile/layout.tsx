import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProfileSettingsSideNav } from '@/app/components/profile-settings-side-nav';
import { authOptions } from '@/lib/auth';

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <section className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <ProfileSettingsSideNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
