import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dashboardHrefForRole } from '@/lib/roles';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ signedIn?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { signedIn } = await searchParams;
  const destination = dashboardHrefForRole(session.user.role);
  const href =
    session.user.role === 'admin' && signedIn === '1'
      ? `${destination}?signedIn=1`
      : destination;

  redirect(href);
}
