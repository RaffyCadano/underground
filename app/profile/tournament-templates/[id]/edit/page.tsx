import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TournamentTemplateForm } from '@/app/components/tournament-template-form';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { canManageTournaments } from '@/lib/roles';
import { timezoneLabel } from '@/lib/profile-settings-options';
import { prisma } from '@/lib/prisma';
import { templateToFormInitial } from '@/lib/tournament-template';

export default async function EditTournamentTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!canManageTournaments(session.user.role)) redirect('/profile');

  const { id } = await params;

  const [template, user] = await Promise.all([
    prisma.tournamentTemplate.findFirst({
      where: { id, userId: session.user.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { timezone: true },
    }),
  ]);

  if (!template) notFound();

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
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300/80">Edit Template</p>
        <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{template.name}</h1>
      </div>

      <TournamentTemplateForm
        templateId={template.id}
        initial={templateToFormInitial(template)}
        imageUploadEnabled={isSupabaseStorageConfigured()}
        timezoneHint={user ? timezoneLabel(user.timezone) : undefined}
      />
    </div>
  );
}
