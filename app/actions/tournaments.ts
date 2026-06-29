'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournaments } from '@/lib/roles';
import { assertCanManageTournament, canManageTournament } from '@/lib/tournament-host';
import { generateSingleElimination, generateSwissRound, generateRoundRobinRound } from '@/lib/bracket';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { parseGameType, parseRoundRobinRankBy } from '@/lib/tournament-options';
import { assertCanRegister, isTournamentPickablePlayer } from '@/lib/tournament-registration';
import {
  guestEmail,
  normalizeGuestDisplayName,
  uniqueInternalWalkInUsername,
  validateGuestDisplayName,
} from '@/lib/guest-player';
import { canResetBracketForRoster } from '@/lib/tournament-roster';
import { parseSwissScoringFromForm, swissScoringToPrismaData, type SwissScoring } from '@/lib/swiss-scoring';
import {
  normalizeTournamentSlug,
  validateTournamentSlug,
} from '@/lib/tournament-slug';
import { checkTournamentSlugAvailability } from '@/app/actions/tournament-slug';
import { tournamentPublicPath } from '@/lib/tournament-lookup';
import {
  countHostedTournaments,
  getTournamentPlanLimitsForUser,
  normalizeIsRankedForPlan,
  normalizePlayerCapForPlan,
  playerCapLimitError,
  tournamentCreateLimitError,
} from '@/lib/tournament-plan-limits';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

async function requireTournamentHost(tournamentId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) throw new Error('Unauthorized.');
  await assertCanManageTournament(tournamentId, session.user.id, session.user.role);
  return session;
}

type ParsedTournamentForm = {
  slug: string;
  name: string;
  description: string | null;
  dateStr: string;
  location: string | null;
  format: string;
  groupStageEnabled: boolean;
  groupSize: number;
  advancePerGroup: number;
  grandFinalsModifier: string;
  deSplitLosersBracket: boolean;
  deBreakTiesPlacement: boolean;
  entryFee: string | null;
  prizePool: string | null;
  playerCap: number | null;
  isRanked: boolean;
  gameType: string;
  checkInTime: string | null;
  eventStartTime: string | null;
  swissScoring: SwissScoring;
  roundRobinRankBy: ReturnType<typeof parseRoundRobinRankBy>;
};

function parseTournamentFormData(formData: FormData): ParsedTournamentForm | { error: string } {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const dateStr = formData.get('date') as string;
  const location = (formData.get('location') as string)?.trim() || null;
  const format = (formData.get('format') as string) || 'single_elimination';
  const groupStageEnabled = formData.get('groupStageEnabled') === 'on';
  const groupSize = parseInt(formData.get('groupSize') as string, 10) || 4;
  const advancePerGroup = parseInt(formData.get('advancePerGroup') as string, 10) || 2;
  const grandFinalsModifier = (formData.get('grandFinalsModifier') as string) || 'default';
  const deSplitLosersBracket = formData.get('deSplitLosersBracket') === 'on';
  const deBreakTiesPlacement = formData.get('deBreakTiesPlacement') === 'on';
  const slug = normalizeTournamentSlug((formData.get('slug') as string) ?? '');
  const entryFee = (formData.get('entryFee') as string)?.trim() || null;
  const prizePool = (formData.get('prizePool') as string)?.trim() || null;
  const playerCapRaw = (formData.get('playerCap') as string)?.trim();
  const playerCap = playerCapRaw ? Math.max(1, parseInt(playerCapRaw, 10) || 0) : null;
  const isRanked = formData.get('isRanked') !== 'false';
  const gameType = parseGameType(formData.get('gameType') as string);
  const checkInTime = (formData.get('checkInTime') as string)?.trim() || null;
  const eventStartTime = (formData.get('eventStartTime') as string)?.trim() || null;
  const swissScoring = parseSwissScoringFromForm(formData);
  const roundRobinRankBy = parseRoundRobinRankBy(formData.get('roundRobinRankBy') as string);

  if (!name || !dateStr) return { error: 'Name and date are required.' };

  const slugError = validateTournamentSlug(slug);
  if (slugError) return { error: slugError };

  return {
    slug,
    name,
    description,
    dateStr,
    location,
    format,
    groupStageEnabled,
    groupSize,
    advancePerGroup,
    grandFinalsModifier,
    deSplitLosersBracket,
    deBreakTiesPlacement,
    entryFee,
    prizePool,
    playerCap,
    isRanked,
    gameType,
    checkInTime,
    eventStartTime,
    swissScoring,
    roundRobinRankBy,
  };
}

function formatFieldsToData(fields: ParsedTournamentForm) {
  return {
    format: fields.format,
    groupStageEnabled: fields.groupStageEnabled,
    groupSize: Math.max(2, fields.groupSize),
    advancePerGroup: Math.max(1, fields.advancePerGroup),
    grandFinalsModifier:
      fields.format === 'double_elimination' ? fields.grandFinalsModifier : 'default',
    deSplitLosersBracket:
      fields.format === 'double_elimination' ? fields.deSplitLosersBracket : true,
    deBreakTiesPlacement:
      fields.format === 'single_elimination' || fields.format === 'double_elimination'
        ? fields.deBreakTiesPlacement
        : true,
    roundRobinRankBy:
      fields.format === 'round_robin' ? fields.roundRobinRankBy : 'match_wins',
    ...swissScoringToPrismaData(fields.swissScoring),
  };
}

async function applyPlanLimitsToParsed(
  userId: string,
  role: string,
  parsed: ParsedTournamentForm,
  mode: 'create' | 'update',
): Promise<ParsedTournamentForm | { error: string }> {
  const limits = await getTournamentPlanLimitsForUser(userId, role);

  if (mode === 'create') {
    const hostedCount = await countHostedTournaments(userId);
    const createError = tournamentCreateLimitError(hostedCount, limits);
    if (createError) return { error: createError };
  }

  const capError = playerCapLimitError(parsed.playerCap, limits);
  if (capError) return { error: capError };

  return {
    ...parsed,
    isRanked: normalizeIsRankedForPlan(parsed.isRanked, limits),
    playerCap: normalizePlayerCapForPlan(parsed.playerCap, limits),
  };
}

export async function createTournament(_prev: { error?: string } | null, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) return { error: 'Unauthorized.' };

  const parsed = parseTournamentFormData(formData);
  if ('error' in parsed) return parsed;

  const planApplied = await applyPlanLimitsToParsed(session.user.id, session.user.role, parsed, 'create');
  if ('error' in planApplied) return planApplied;

  const slugCheck = await checkTournamentSlugAvailability(planApplied.slug);
  if (!slugCheck.available) return { error: slugCheck.error ?? 'This URL is already taken.' };

  const t = await prisma.tournament.create({
    data: {
      id: planApplied.slug,
      slug: planApplied.slug,
      name: planApplied.name,
      description: planApplied.description,
      date: new Date(planApplied.dateStr),
      checkInTime: planApplied.checkInTime,
      eventStartTime: planApplied.eventStartTime,
      location: planApplied.location,
      ...formatFieldsToData(planApplied),
      entryFee: planApplied.entryFee,
      prizePool: planApplied.prizePool,
      playerCap: planApplied.playerCap,
      isRanked: planApplied.isRanked,
      gameType: planApplied.gameType,
      createdById: session.user.id,
    },
  });

  revalidatePath('/tournaments');
  revalidatePath('/admin');
  redirect(`${tournamentPublicPath(t)}?created=1`);
}

export async function updateTournament(_prev: { error?: string } | null, formData: FormData) {
  const tournamentId = (formData.get('tournamentId') as string)?.trim();
  if (!tournamentId) return { error: 'Missing tournament id.' };

  let hostSession;
  try {
    hostSession = await requireTournamentHost(tournamentId);
  } catch {
    return { error: 'You do not have permission to edit this tournament.' };
  }

  const existing = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { matches: true } } },
  });
  if (!existing) return { error: 'Tournament not found.' };

  const parsed = parseTournamentFormData(formData);
  if ('error' in parsed) return parsed;

  const planApplied = await applyPlanLimitsToParsed(
    hostSession.user.id,
    hostSession.user.role,
    parsed,
    'update',
  );
  if ('error' in planApplied) return planApplied;

  const slugCheck = await checkTournamentSlugAvailability(planApplied.slug, tournamentId);
  if (!slugCheck.available) return { error: slugCheck.error ?? 'This URL is already taken.' };

  const hasBracket = existing._count.matches > 0;

  const updated = await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      slug: planApplied.slug,
      name: planApplied.name,
      description: planApplied.description,
      date: new Date(planApplied.dateStr),
      checkInTime: planApplied.checkInTime,
      eventStartTime: planApplied.eventStartTime,
      location: planApplied.location,
      entryFee: planApplied.entryFee,
      prizePool: planApplied.prizePool,
      playerCap: planApplied.playerCap,
      isRanked: planApplied.isRanked,
      gameType: planApplied.gameType,
      ...(hasBracket ? {} : formatFieldsToData(planApplied)),
    },
  });

  revalidatePath('/tournaments');
  revalidatePath('/dashboard/tournaments');
  revalidatePath(`/tournaments/${tournamentId}`);
  if (updated.slug) revalidatePath(`/tournaments/${updated.slug}`);
  redirect(`${tournamentPublicPath(updated)}?updated=1`);
}

export async function joinTournament(tournamentId: string) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { participants: true } } },
  });
  if (!tournament) throw new Error('Tournament not found.');
  assertCanRegister(tournament, tournament._count.participants);

  await prisma.tournamentParticipant.upsert({
    where: { tournamentId_userId: { tournamentId, userId: session.user.id } },
    update: {},
    create: { tournamentId, userId: session.user.id },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function leaveTournament(tournamentId: string) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  await prisma.tournamentParticipant.deleteMany({
    where: { tournamentId, userId: session.user.id },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function generateBracket(tournamentId: string) {
  await requireTournamentHost(tournamentId);

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Tournament not found.');

  if (tournament.groupStageEnabled) {
    const { generateGroupStage } = await import('@/lib/group-stage');
    await generateGroupStage(tournamentId);
  } else if (tournament.format === 'round_robin') {
    await generateRoundRobinRound(tournamentId);
  } else if (tournament.format === 'swiss') {
    await generateSwissRound(tournamentId);
  } else if (tournament.format === 'double_elimination') {
    const { generateDoubleElimination } = await import('@/lib/double-elim');
    await generateDoubleElimination(tournamentId);
  } else {
    await generateSingleElimination(tournamentId);
  }

  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function generatePlayoffs(tournamentId: string) {
  await requireTournamentHost(tournamentId);

  const { generatePlayoffsFromGroups } = await import('@/lib/group-stage');
  await generatePlayoffsFromGroups(tournamentId);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function generateNextSwissRound(tournamentId: string) {
  await requireTournamentHost(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { phase: true, format: true },
  });

  if (tournament?.format === 'round_robin') {
    await generateRoundRobinRound(tournamentId, { playoffsOnly: tournament.phase === 'playoffs' });
  } else {
    await generateSwissRound(tournamentId, { playoffsOnly: tournament?.phase === 'playoffs' });
  }
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function regenerateRound1(tournamentId: string) {
  await requireTournamentHost(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { matches: true } } },
  });
  if (!tournament) throw new Error('Tournament not found.');
  if (tournament.status === 'complete') {
    throw new Error('Cannot reset the bracket after the tournament is complete.');
  }
  if (tournament._count.matches === 0) {
    throw new Error('No bracket has been generated yet.');
  }
  if (tournament.format !== 'swiss' && tournament.format !== 'round_robin') {
    throw new Error('Round regeneration is only available for Swiss and round robin events.');
  }
  if (tournament.groupStageEnabled && tournament.phase === 'group') {
    throw new Error('Finish the group stage before regenerating the main bracket.');
  }

  const playoffsOnly = tournament.groupStageEnabled && tournament.phase === 'playoffs';

  if (playoffsOnly) {
    await prisma.match.deleteMany({ where: { tournamentId, bracketSide: { not: 'group' } } });
  } else {
    await prisma.match.deleteMany({ where: { tournamentId } });
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'active' },
  });

  if (tournament.format === 'round_robin') {
    await generateRoundRobinRound(tournamentId, { playoffsOnly });
  } else {
    await generateSwissRound(tournamentId, { playoffsOnly });
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function resetBracketForRegistration(tournamentId: string) {
  await requireTournamentHost(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { matches: { select: { score: true } } },
  });
  if (!tournament) throw new Error('Tournament not found.');
  if (tournament.status === 'complete') {
    throw new Error('Cannot edit the roster after the tournament is complete.');
  }
  if (tournament.matches.length === 0) {
    throw new Error('No bracket has been generated yet.');
  }
  if (!canResetBracketForRoster(tournament.matches)) {
    throw new Error(
      'Cannot reset the bracket after match results have been reported. Remove incorrect scores first or continue the event.',
    );
  }

  await prisma.match.deleteMany({ where: { tournamentId } });
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'open', phase: null },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function removePlayerFromTournament(tournamentId: string, userId: string) {
  await requireTournamentHost(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { matches: true } } },
  });
  if (!tournament || tournament.status !== 'open') {
    throw new Error('Players can only be removed while registration is open.');
  }
  if (tournament._count.matches > 0) {
    throw new Error('Cannot remove players after the bracket has been generated.');
  }

  const participant = await prisma.tournamentParticipant.findFirst({
    where: { tournamentId, userId },
    include: { user: { select: { role: true } } },
  });
  if (!participant) return;

  await prisma.tournamentParticipant.deleteMany({
    where: { tournamentId, userId },
  });

  if (participant.user.role === 'guest') {
    const remaining = await prisma.tournamentParticipant.count({ where: { userId } });
    if (remaining === 0) {
      await prisma.user.delete({ where: { id: userId } });
    }
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function addPlayerToTournament(tournamentId: string, userId: string) {
  await requireTournamentHost(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { participants: true } } },
  });
  if (!tournament) throw new Error('Tournament not found.');
  assertCanRegister(tournament, tournament._count.participants, 1, { exemptCap: true });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Player not found.');
  if (!isTournamentPickablePlayer(user)) {
    throw new Error('That account cannot be added as a tournament player.');
  }

  await prisma.tournamentParticipant.upsert({
    where: { tournamentId_userId: { tournamentId, userId } },
    update: {},
    create: { tournamentId, userId },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function addGuestPlayerToTournament(tournamentId: string, displayName: string) {
  await requireTournamentHost(tournamentId);

  const nameError = validateGuestDisplayName(displayName);
  if (nameError) throw new Error(nameError);

  const normalizedName = normalizeGuestDisplayName(displayName);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { participants: true } } },
  });
  if (!tournament) throw new Error('Tournament not found.');
  assertCanRegister(tournament, tournament._count.participants, 1, { exemptCap: true });

  const duplicateWalkIn = await prisma.tournamentParticipant.findFirst({
    where: {
      tournamentId,
      walkInName: { equals: normalizedName, mode: 'insensitive' },
    },
  });
  if (duplicateWalkIn) {
    throw new Error('That name is already registered in this tournament.');
  }

  const duplicateAccount = await prisma.tournamentParticipant.findFirst({
    where: {
      tournamentId,
      walkInName: null,
      user: { username: { equals: normalizedName, mode: 'insensitive' } },
    },
  });
  if (duplicateAccount) {
    throw new Error('That name is already registered in this tournament.');
  }

  const username = await uniqueInternalWalkInUsername(prisma);
  const email = guestEmail(`${username}-${randomBytes(4).toString('hex')}`);
  const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
      role: 'guest',
    },
  });

  await prisma.tournamentParticipant.create({
    data: { tournamentId, userId: user.id, walkInName: normalizedName },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function deleteTournament(
  tournamentId: string,
): Promise<{ success: true; name: string } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) {
    return { error: 'You do not have permission to delete this tournament.' };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      name: true,
      createdById: true,
      participants: {
        where: { walkInName: { not: null } },
        select: { userId: true },
      },
    },
  });
  if (!tournament) {
    return { error: 'Tournament not found.' };
  }
  if (!canManageTournament(tournament, session.user.id, session.user.role)) {
    return { error: 'You do not have permission to delete this tournament.' };
  }

  const walkInUserIds = [...new Set(tournament.participants.map((p) => p.userId))];

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { tournamentId } });
    await tx.tournamentParticipant.deleteMany({ where: { tournamentId } });
    await tx.tournament.delete({ where: { id: tournamentId } });
    if (walkInUserIds.length > 0) {
      await tx.user.deleteMany({
        where: { id: { in: walkInUserIds }, role: 'guest' },
      });
    }
  });

  revalidatePath('/tournaments');
  revalidatePath('/dashboard/tournaments');

  return { success: true, name: tournament.name };
}

export async function completeTournament(tournamentId: string) {
  await requireTournamentHost(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true, format: true, slug: true },
  });
  if (!tournament) throw new Error('Tournament not found.');
  if (tournament.status === 'complete') {
    throw new Error('Tournament is already marked complete.');
  }
  if (tournament.status === 'open') {
    throw new Error('Generate the bracket before marking the tournament complete.');
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: 'complete',
      ...(tournament.format === 'double_elimination' ? { phase: 'complete' } : {}),
    },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  if (tournament.slug) revalidatePath(`/tournaments/${tournament.slug}`);
  revalidatePath('/dashboard/tournaments');
  revalidatePath('/tournaments');
}
