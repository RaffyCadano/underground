import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCachedServerSession } from '@/lib/auth-session';
import { canManageTournaments, isAdminRole } from '@/lib/roles';
import { AdminSideNav } from '../admin-side-nav';
import { PlayerSideNav } from '../player-side-nav';
import { DashboardMainSkeleton } from '../dashboard-main-skeleton';

const ADMIN_ONLY_PREFIXES = [
  '/dashboard/overview',
  '/dashboard/clubs',
  '/dashboard/accounts',
  '/dashboard/settings',
];

const TOURNAMENT_STAFF_PREFIX = '/dashboard/tournaments';

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCachedServerSession();
  if (!session) redirect('/login');

  const pathname = (await headers()).get('x-pathname') ?? '';
  const role = session.user.role;

  if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES) && !isAdminRole(role)) {
    redirect(canManageTournaments(role) ? '/dashboard/tournaments' : '/dashboard/your-events');
  }

  if (
    (pathname === TOURNAMENT_STAFF_PREFIX || pathname.startsWith(`${TOURNAMENT_STAFF_PREFIX}/`)) &&
    !canManageTournaments(role)
  ) {
    redirect('/dashboard/your-events');
  }

  const isPlayer = role === 'player';

  if (isPlayer) {
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

  return (
    <section className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <AdminSideNav role={role} initialPathname={pathname} />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<DashboardMainSkeleton />}>{children}</Suspense>
        </div>
      </div>
    </section>
  );
}
