import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateTournamentForm } from '@/app/admin/create-tournament-form';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournaments } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { templateToTournamentInitial } from '@/lib/tournament-template';

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
      templateInitial = templateToTournamentInitial({
        name: template.name,
        description: template.description ?? '',
        format: template.format,
        groupStageEnabled: template.groupStageEnabled,
        grandFinalsModifier: template.grandFinalsModifier,
        groupSize: String(template.groupSize),
        advancePerGroup: String(template.advancePerGroup),
        entryFee: template.entryFee ?? '',
        prizePool: template.prizePool ?? '',
        playerCap: template.playerCap != null ? String(template.playerCap) : '',
        isRanked: template.isRanked,
        gameType: template.gameType,
      });
    }
  }

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

      <CreateTournamentForm imageUploadEnabled={imageUploadEnabled} initial={templateInitial} />
    </div>
  );
}
