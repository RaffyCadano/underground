import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { TournamentTemplateForm } from '@/app/components/tournament-template-form';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { canManageTournaments } from '@/lib/roles';
import { timezoneLabel } from '@/lib/profile-settings-options';
import { prisma } from '@/lib/prisma';

export default async function NewTournamentTemplatePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!canManageTournaments(session.user.role)) redirect('/profile');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/profile/tournament-templates"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to templates
      </Link>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300/80">New Template</p>
        <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Template Details</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Configure defaults for game type, format, registration, and advanced bracket options.
        </p>
      </div>

      <TournamentTemplateForm
        imageUploadEnabled={isSupabaseStorageConfigured()}
        timezoneHint={user ? timezoneLabel(user.timezone) : undefined}
      />
    </div>
  );
}
