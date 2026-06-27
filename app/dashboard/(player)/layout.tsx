import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PlayerSideNav } from '../player-side-nav';
import { DashboardMainSkeleton } from '../dashboard-main-skeleton';
import { getCachedServerSession } from '@/lib/auth-session';

export default async function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedServerSession();
  if (!session) redirect('/login');

  const pathname = (await headers()).get('x-pathname') ?? '';
  const role = session.user.role;

  const isPlayer = role !== 'admin';

  if (!isPlayer) {
    return <section className="container py-10 lg:py-14">{children}</section>;
  }

  return (
    <section className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <PlayerSideNav role={role} initialPathname={pathname} />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<DashboardMainSkeleton />}>{children}</Suspense>
        </div>
      </div>
    </section>
  );
}
