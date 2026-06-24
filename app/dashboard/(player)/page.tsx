import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournaments, isAdminRole } from '@/lib/roles';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ signedIn?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  if (isAdminRole(session.user.role)) {
    const { signedIn } = await searchParams;
    redirect(
      signedIn === '1' ? '/dashboard/overview?signedIn=1' : '/dashboard/overview',
    );
  }

  if (canManageTournaments(session.user.role)) {
    redirect('/dashboard/tournaments');
  }

  redirect('/dashboard/your-events');
}
