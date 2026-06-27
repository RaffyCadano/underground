import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TournamentTemplateForm } from '@/app/components/tournament-template-form';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { canManageTournaments } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import { templateToFormInitial } from '@/lib/tournament-template';
import { getTournamentPlanLimitsForUser } from '@/lib/tournament-plan-limits';

export default async function EditTournamentTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!canManageTournaments(session.user.role)) redirect('/profile');

  const { id } = await params;

  const template = await prisma.tournamentTemplate.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!template) notFound();

  const planLimits = await getTournamentPlanLimitsForUser(session.user.id, session.user.role);

  return (
    <div className="w-full min-w-0">
      <Link
        href="/profile/tournament-templates"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to templates
      </Link>

      <div className="mb-6">
        <span className="badge">Edit template</span>
        <h2 className="mt-2 text-2xl font-semibold text-white">{template.name}</h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-400">
          Update default format, registration, and rules for future tournaments.
        </p>
      </div>

      <TournamentTemplateForm
        templateId={template.id}
        initial={templateToFormInitial(template)}
        imageUploadEnabled={isSupabaseStorageConfigured()}
        planLimits={planLimits}
      />
    </div>
  );
}
