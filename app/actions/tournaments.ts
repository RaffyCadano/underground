'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSingleElimination, generateSwissRound } from '@/lib/bracket';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createTournament(_prev: { error?: string } | null, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return { error: 'Unauthorized.' };

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const dateStr = formData.get('date') as string;
  const location = (formData.get('location') as string)?.trim() || null;
  const format = (formData.get('format') as string) || 'single_elimination';

  if (!name || !dateStr) return { error: 'Name and date are required.' };

  const t = await prisma.tournament.create({
    data: { name, description, date: new Date(dateStr), location, format },
  });

  revalidatePath('/tournaments');
  revalidatePath('/admin');
  redirect(`/tournaments/${t.id}`);
}

export async function joinTournament(tournamentId: string) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament || tournament.status !== 'open') throw new Error('Tournament is not open for registration.');

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
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Tournament not found.');

  if (tournament.format === 'swiss' || tournament.format === 'round_robin') {
    await generateSwissRound(tournamentId);
  } else {
    await generateSingleElimination(tournamentId);
  }

  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function generateNextSwissRound(tournamentId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  await generateSwissRound(tournamentId);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function removePlayerFromTournament(tournamentId: string, userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

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
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament || tournament.status !== 'open') {
    throw new Error('Tournament is not open for registration.');
  }

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

export async function deleteTournament(tournamentId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  await prisma.tournament.delete({ where: { id: tournamentId } });
  revalidatePath('/tournaments');
  revalidatePath('/admin');
  redirect('/tournaments');
}
