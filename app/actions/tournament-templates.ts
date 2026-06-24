'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageTournaments } from '@/lib/roles';
import { parseGameType, parseRoundRobinRankBy } from '@/lib/tournament-options';
import { parseSwissScoringFromForm, swissScoringToPrismaData } from '@/lib/swiss-scoring';
import { redirect } from 'next/navigation';

function parseTemplateFormData(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const format = (formData.get('format') as string) || 'single_elimination';
  const groupStageEnabled = formData.get('groupStageEnabled') === 'on';
  const groupSize = parseInt(formData.get('groupSize') as string, 10) || 4;
  const advancePerGroup = parseInt(formData.get('advancePerGroup') as string, 10) || 2;
  const grandFinalsModifier = (formData.get('grandFinalsModifier') as string) || 'default';
  const deSplitLosersBracket = formData.get('deSplitLosersBracket') === 'on';
  const deBreakTiesPlacement = formData.get('deBreakTiesPlacement') === 'on';
  const entryFee = (formData.get('entryFee') as string)?.trim() || null;
  const prizePool = (formData.get('prizePool') as string)?.trim() || null;
  const playerCapRaw = (formData.get('playerCap') as string)?.trim();
  const playerCap = playerCapRaw ? Math.max(1, parseInt(playerCapRaw, 10) || 0) : null;
  const isRanked = formData.get('isRanked') !== 'false';
  const gameType = parseGameType(formData.get('gameType') as string);
  const swissScoring = parseSwissScoringFromForm(formData);
  const roundRobinRankBy = parseRoundRobinRankBy(formData.get('roundRobinRankBy') as string);

  if (!name) return { error: 'Template name is required.' as const };

  return {
    name,
    description,
    format,
    groupStageEnabled,
    groupSize: Math.max(2, groupSize),
    advancePerGroup: Math.max(1, advancePerGroup),
    grandFinalsModifier: format === 'double_elimination' ? grandFinalsModifier : 'default',
    deSplitLosersBracket: format === 'double_elimination' ? deSplitLosersBracket : true,
    deBreakTiesPlacement:
      format === 'single_elimination' || format === 'double_elimination'
        ? deBreakTiesPlacement
        : true,
    entryFee,
    prizePool,
    playerCap,
    isRanked,
    gameType,
    roundRobinRankBy: format === 'round_robin' ? roundRobinRankBy : 'match_wins',
    ...swissScoringToPrismaData(swissScoring),
  };
}

async function requireTemplateOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !canManageTournaments(session.user.role)) {
    throw new Error('Unauthorized.');
  }
  return session;
}

export async function createTournamentTemplate(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const session = await requireTemplateOwner();
  const parsed = parseTemplateFormData(formData);
  if ('error' in parsed) return { error: parsed.error };

  await prisma.tournamentTemplate.create({
    data: { ...parsed, userId: session.user.id },
  });

  revalidatePath('/profile/tournament-templates');
  redirect('/profile/tournament-templates?created=1');
}

export async function updateTournamentTemplate(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const session = await requireTemplateOwner();
  const templateId = (formData.get('templateId') as string)?.trim();
  if (!templateId) return { error: 'Template not found.' };

  const existing = await prisma.tournamentTemplate.findFirst({
    where: { id: templateId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) return { error: 'Template not found.' };

  const parsed = parseTemplateFormData(formData);
  if ('error' in parsed) return { error: parsed.error };

  await prisma.tournamentTemplate.update({
    where: { id: templateId },
    data: parsed,
  });

  revalidatePath('/profile/tournament-templates');
  revalidatePath(`/profile/tournament-templates/${templateId}/edit`);
  redirect('/profile/tournament-templates?updated=1');
}

export async function deleteTournamentTemplate(templateId: string) {
  const session = await requireTemplateOwner();

  const existing = await prisma.tournamentTemplate.findFirst({
    where: { id: templateId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) return { error: 'Template not found.' };

  await prisma.tournamentTemplate.delete({ where: { id: templateId } });
  revalidatePath('/profile/tournament-templates');
  return { success: true };
}
