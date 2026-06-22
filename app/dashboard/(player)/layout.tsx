import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { PlayerSideNav } from '../player-side-nav';
import { authOptions } from '@/lib/auth';

export default async function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const isPlayer = session.user.role !== 'admin';

  if (!isPlayer) {
    return <section className="container py-10 lg:py-14">{children}</section>;
  }

  return (
    <section className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <PlayerSideNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
