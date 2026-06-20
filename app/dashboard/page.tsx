import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PlayerDashboard } from './player-dashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  if (session.user.role === 'admin') {
    redirect('/dashboard/overview');
  }

  return <PlayerDashboard userId={session.user.id} />;
}
