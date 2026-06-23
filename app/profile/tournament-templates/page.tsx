import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageTournaments } from '@/lib/roles';
import { TournamentTemplatesList } from './tournament-templates-list';

export const dynamic = 'force-dynamic';

export default async function TournamentTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!canManageTournaments(session.user.role)) redirect('/profile');

  const { created, updated } = await searchParams;

  const templates = await prisma.tournamentTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      format: true,
      gameType: true,
      groupStageEnabled: true,
      isRanked: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Tournament Templates</h1>
        <span className="rounded border border-orange-500/45 bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
          Labs
        </span>
      </div>
      <p className="text-sm text-slate-400">
        Save bracket formats, rules, and registration defaults to reuse across events.
      </p>

      <TournamentTemplatesList
        templates={templates.map((t) => ({ ...t, updatedAt: t.updatedAt.toISOString() }))}
        showCreatedToast={created === '1'}
        showUpdatedToast={updated === '1'}
      />
    </div>
  );
}
