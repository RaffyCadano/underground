import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateTournamentForm } from '@/app/admin/create-tournament-form';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournaments } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { templateToFormInitial, templateToTournamentInitial } from '@/lib/tournament-template';
import { tournamentsPermalinkHostFromRequest } from '@/lib/site-request';
import { tournamentsPermalinkPrefix } from '@/lib/tournament-slug';
import {
  countHostedTournaments,
  tournamentPlanLimitsFromSubscription,
} from '@/lib/tournament-plan-limits';

export default async function CreateTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) redirect('/dashboard');

  const { template: templateId } = await searchParams;
  const imageUploadEnabled = isSupabaseStorageConfigured();

  let templateInitial;
  if (templateId) {
    const template = await prisma.tournamentTemplate.findFirst({
      where: { id: templateId, userId: session.user.id },
    });
    if (template) {
      templateInitial = templateToTournamentInitial(templateToFormInitial(template));
    }
  }

  const permalinkPrefix = tournamentsPermalinkPrefix(await tournamentsPermalinkHostFromRequest());

  const [billing, hostedCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    }),
    countHostedTournaments(session.user.id),
  ]);

  const planLimits = tournamentPlanLimitsFromSubscription(
    billing?.subscriptionPlan ?? 'free',
    billing?.subscriptionStatus,
    session.user.role,
  );

  return (
    <div className="w-full min-w-0">
      <Link
        href="/dashboard/tournaments"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to tournaments
      </Link>

      <div className="mb-6">
        <span className="badge">{templateInitial ? 'From template' : 'New event'}</span>
        <h2 className="mt-2 text-2xl font-semibold text-white">Create tournament</h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-400">
          {templateInitial
            ? 'Prefilled from your template — add the date, location, and schedule, then publish.'
            : 'Set up format, schedule, and rules. You can add players and generate the bracket after creation.'}
        </p>
      </div>

      <CreateTournamentForm
        imageUploadEnabled={imageUploadEnabled}
        initial={templateInitial}
        permalinkPrefix={permalinkPrefix}
        planLimits={planLimits}
        hostedCount={hostedCount}
      />
    </div>
  );
}
