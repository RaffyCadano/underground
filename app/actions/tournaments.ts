'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournaments, isAdminRole } from '@/lib/roles';
import { assertCanManageTournament } from '@/lib/tournament-host';
import { generateSingleElimination, generateSwissRound } from '@/lib/bracket';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { parseGameType } from '@/lib/tournament-options';
import { assertCanRegister } from '@/lib/tournament-registration';
import {
  guestEmail,
  normalizeGuestDisplayName,
  uniqueGuestUsername,
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

export async function createTournament(_prev: { error?: string } | null, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) return { error: 'Unauthorized.' };

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

  const t = await prisma.tournament.create({
    data: {
      name,
      description,
      date: new Date(dateStr),
      checkInTime,
      eventStartTime,
      location,
      format,
      groupStageEnabled: format === 'double_elimination' && groupStageEnabled,
      groupSize: Math.max(2, groupSize),
      advancePerGroup: Math.max(1, advancePerGroup),
      grandFinalsModifier:
        format === 'double_elimination' ? grandFinalsModifier : 'default',
      entryFee,
      prizePool,
      playerCap,
      isRanked,
      gameType,
      createdById: session.user.id,
    },
  });

  revalidatePath('/tournaments');
  revalidatePath('/admin');
  redirect(`/tournaments/${t.id}`);
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

  await prisma.tournamentParticipant.deleteMany({
    where: { tournamentId, userId },
  });

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

  const username = await uniqueGuestUsername(prisma, normalizedName);
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
    data: { tournamentId, userId: user.id },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/dashboard');
}

export async function deleteTournament(tournamentId: string) {
  const session = await requireTournamentHost(tournamentId);

  await prisma.tournament.delete({ where: { id: tournamentId } });
  revalidatePath('/tournaments');
  revalidatePath('/dashboard/tournaments');
  revalidatePath('/dashboard');
  redirect(isAdminRole(session.user.role) ? '/dashboard/tournaments' : '/dashboard');
}
