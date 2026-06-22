import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminSideNav } from '../admin-side-nav';
import { PlayerSideNav } from '../player-side-nav';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isPlayer = role === 'player';

  if (isPlayer) {
    return (
      <section className="container py-8 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <PlayerSideNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <AdminSideNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
