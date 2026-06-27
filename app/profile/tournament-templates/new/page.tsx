import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { TournamentTemplateForm } from '@/app/components/tournament-template-form';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { canManageTournaments } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import { getTournamentPlanLimitsForUser } from '@/lib/tournament-plan-limits';

export default async function NewTournamentTemplatePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!canManageTournaments(session.user.role)) redirect('/profile');

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
        <span className="badge">New template</span>
        <h2 className="mt-2 text-2xl font-semibold text-white">Create template</h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-400">
          Set up default format, registration, and rules. Use this template when creating tournaments
          from your dashboard.
        </p>
      </div>

      <TournamentTemplateForm imageUploadEnabled={isSupabaseStorageConfigured()} planLimits={planLimits} />
    </div>
  );
}
