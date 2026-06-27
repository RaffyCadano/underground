import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { isAdminRole } from '@/lib/roles';
import { getPlatformSettings } from '@/lib/platform-settings';
import { StandardHostedTournamentsForm } from './standard-hosted-tournaments-form';

export const dynamic = 'force-dynamic';

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!isAdminRole(session.user.role)) redirect('/dashboard/tournaments');

  const settings = await getPlatformSettings();

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white sm:text-xl">Platform settings</h2>
        <p className="mt-1 text-sm text-slate-400">
          Site-wide limits and defaults for organizer plans.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6">
        <StandardHostedTournamentsForm initialValue={settings.standardMaxHostedTournaments} />
        {settings.updatedAt && (
          <p className="mt-4 text-xs text-slate-500">
            Last updated{' '}
            {settings.updatedAt.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
