'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournaments } from '@/lib/roles';
import { assertCanManageTournament } from '@/lib/tournament-host';
import { generateSingleElimination, generateSwissRound } from '@/lib/bracket';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { parseGameType } from '@/lib/tournament-options';
import { assertCanRegister, isTournamentPickablePlayer } from '@/lib/tournament-registration';
import {
  guestEmail,
  normalizeGuestDisplayName,
  uniqueInternalWalkInUsername,
  validateGuestDisplayName,
} from '@/lib/guest-player';
import { canResetBracketForRoster } from '@/lib/tournament-roster';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

async function requireTournamentHost(tournamentId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) throw new Error('Unauthorized.');
  await assertCanManageTournament(tournamentId, session.user.id, session.user.role);
  return session;
}

type ParsedTournamentForm = {
  name: string;
  description: string | null;
  dateStr: string;
  location: string | null;
  format: string;
  groupStageEnabled: boolean;
  groupSize: number;
  advancePerGroup: number;
  grandFinalsModifier: string;
  entryFee: string | null;
  prizePool: string | null;
  playerCap: number | null;
  isRanked: boolean;
  gameType: string;
  checkInTime: string | null;
  eventStartTime: string | null;
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
  const entryFee = (formData.get('entryFee') as string)?.trim() || null;
  const prizePool = (formData.get('prizePool') as string)?.trim() || null;
  const playerCapRaw = (formData.get('playerCap') as string)?.trim();
  const playerCap = playerCapRaw ? Math.max(1, parseInt(playerCapRaw, 10) || 0) : null;
  const isRanked = formData.get('isRanked') !== 'false';
  const gameType = parseGameType(formData.get('gameType') as string);
  const checkInTime = (formData.get('checkInTime') as string)?.trim() || null;
  const eventStartTime = (formData.get('eventStartTime') as string)?.trim() || null;

  if (!name || !dateStr) return { error: 'Name and date are required.' };

  return {
    name,
    description,
    dateStr,
    location,
    format,
    groupStageEnabled,
    groupSize,
    advancePerGroup,
    grandFinalsModifier,
    entryFee,
    prizePool,
    playerCap,
    isRanked,
    gameType,
    checkInTime,
    eventStartTime,
  };
}

function formatFieldsToData(fields: ParsedTournamentForm) {
  return {
    format: fields.format,
    groupStageEnabled: fields.format === 'double_elimination' && fields.groupStageEnabled,
    groupSize: Math.max(2, fields.groupSize),
    advancePerGroup: Math.max(1, fields.advancePerGroup),
    grandFinalsModifier:
      fields.format === 'double_elimination' ? fields.grandFinalsModifier : 'default',
  };
}

export async function createTournament(_prev: { error?: string } | null, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) return { error: 'Unauthorized.' };

  const parsed = parseTournamentFormData(formData);
  if ('error' in parsed) return parsed;

  const t = await prisma.tournament.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      date: new Date(parsed.dateStr),
      checkInTime: parsed.checkInTime,
      eventStartTime: parsed.eventStartTime,
      location: parsed.location,
      ...formatFieldsToData(parsed),
      entryFee: parsed.entryFee,
      prizePool: parsed.prizePool,
      playerCap: parsed.playerCap,
      isRanked: parsed.isRanked,
      gameType: parsed.gameType,
      createdById: session.user.id,
    },
  });

  revalidatePath('/tournaments');
  revalidatePath('/admin');
  redirect(`/tournaments/${t.id}?created=1`);
}

export async function updateTournament(_prev: { error?: string } | null, formData: FormData) {
  const tournamentId = (formData.get('tournamentId') as string)?.trim();
  if (!tournamentId) return { error: 'Missing tournament id.' };

  try {
    await requireTournamentHost(tournamentId);
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

  const hasBracket = existing._count.matches > 0;

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      name: parsed.name,
      description: parsed.description,
      date: new Date(parsed.dateStr),
      checkInTime: parsed.checkInTime,
      eventStartTime: parsed.eventStartTime,
      location: parsed.location,
      entryFee: parsed.entryFee,
      prizePool: parsed.prizePool,
      playerCap: parsed.playerCap,
      isRanked: parsed.isRanked,
      gameType: parsed.gameType,
      ...(hasBracket ? {} : formatFieldsToData(parsed)),
    },
  });

  revalidatePath('/tournaments');
  revalidatePath('/dashboard/tournaments');
  revalidatePath(`/tournaments/${tournamentId}`);
  redirect(`/tournaments/${tournamentId}?updated=1`);
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

  if (tournament.format === 'swiss' || tournament.format === 'round_robin') {
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

  await generateSwissRound(tournamentId);
  revalidatePath(`/tournaments/${tournamentId}`);
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
  try {
    await requireTournamentHost(tournamentId);
  } catch {
    return { error: 'You do not have permission to delete this tournament.' };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { name: true },
  });
  if (!tournament) {
    return { error: 'Tournament not found.' };
  }

  const walkInUserIds = (
    await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        user: { role: 'guest' },
      },
      select: { userId: true },
    })
  ).map((p) => p.userId);

  await prisma.tournament.delete({ where: { id: tournamentId } });

  const uniqueWalkInIds = [...new Set(walkInUserIds)];
  if (uniqueWalkInIds.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: uniqueWalkInIds }, role: 'guest' },
    });
  }

  revalidatePath('/tournaments');
  revalidatePath('/dashboard/tournaments');
  revalidatePath('/dashboard');
  revalidatePath(`/tournaments/${tournamentId}`);

  return { success: true, name: tournament.name };
}
