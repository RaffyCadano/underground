import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { PlayerSideNav } from '../player-side-nav';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  return (
    <section className="container">
      <div className="mb-8">
        <span className="badge">Dashboard</span>
        <h1 className="mt-3 text-4xl font-semibold text-white">My arena</h1>
        <p className="mt-2 text-slate-300">
          Welcome back{user ? `, ${user.username}` : ''}.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <PlayerSideNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
