import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { YourTournamentsView } from '../your-tournaments-view';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ signedIn?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  if (session.user.role === 'admin') {
    const { signedIn } = await searchParams;
    redirect(
      signedIn === '1' ? '/dashboard/overview?signedIn=1' : '/dashboard/overview',
    );
  }

  return (
    <YourTournamentsView userId={session.user.id} role={session.user.role} />
  );
}
