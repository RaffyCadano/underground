import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { canManageTournament } from '@/lib/tournament-host';
import { CreateTournamentForm } from '@/app/admin/create-tournament-form';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { tournamentToFormInitial } from '@/lib/tournament-form';
import { tournamentsPermalinkHostFromRequest } from '@/lib/site-request';
import { tournamentsPermalinkPrefix } from '@/lib/tournament-slug';
import { tournamentPublicPath } from '@/lib/tournament-lookup';
import { tournamentPlanLimitsFromSubscription } from '@/lib/tournament-plan-limits';

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { _count: { select: { matches: true } } },
  });

  if (
    !tournament ||
    !session ||
    !canManageTournament(tournament, session.user.id, session.user.role)
  ) {
    notFound();
  }

  const imageUploadEnabled = isSupabaseStorageConfigured();
  const lockFormat = tournament._count.matches > 0;

  const permalinkPrefix = tournamentsPermalinkPrefix(await tournamentsPermalinkHostFromRequest());
  const publicPath = tournamentPublicPath(tournament);

  const billing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionPlan: true, subscriptionStatus: true },
  });

  const planLimits = tournamentPlanLimitsFromSubscription(
    billing?.subscriptionPlan ?? 'free',
    billing?.subscriptionStatus,
    session.user.role,
  );

  return (
    <div className="w-full min-w-0">
      <Link
        href={publicPath}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to tournament
      </Link>

      <div className="mb-6">
        <span className="badge">Edit event</span>
        <h2 className="mt-2 text-2xl font-semibold text-white">Edit tournament</h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-400">
          Update schedule, registration details, and description.
          {lockFormat && ' Format settings are locked because the bracket has already been generated.'}
        </p>
      </div>

      <CreateTournamentForm
        tournamentId={tournament.id}
        initial={tournamentToFormInitial(tournament)}
        lockFormat={lockFormat}
        cancelHref={publicPath}
        imageUploadEnabled={imageUploadEnabled}
        permalinkPrefix={permalinkPrefix}
        planLimits={planLimits}
      />
    </div>
  );
}
