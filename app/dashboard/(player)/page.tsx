import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { YourTournamentsView } from '../your-tournaments-view';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  if (session.user.role === 'admin') {
    redirect('/dashboard/overview');
  }

  return (
    <YourTournamentsView userId={session.user.id} role={session.user.role} />
  );
}
