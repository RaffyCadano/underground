import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateEventForm } from '@/app/components/create-event-form';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageTournaments } from '@/lib/roles';
import { eventsPermalinkHost, SITE_NAME } from '@/lib/site';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, timezone: true },
  });
  if (!user) redirect('/login');

  const imageUploadEnabled = isSupabaseStorageConfigured();

  return (
    <div className="w-full min-w-0">
      <Link
        href="/dashboard/your-events"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to your events
      </Link>

      <CreateEventForm
        hostUsername={user.username}
        defaultTimezone={user.timezone}
        permalinkPrefix={`${eventsPermalinkHost()}/events/`}
        imageUploadEnabled={imageUploadEnabled}
      />
    </div>
  );
}
