'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { advanceWinner } from '@/lib/bracket';
import { advanceDoubleElimMatch } from '@/lib/double-elim';
import { revalidatePath } from 'next/cache';

export async function reportResult(matchId: string, winnerId: string, score: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('You must be signed in.');

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Match not found.');
  if (match.status === 'complete') throw new Error('Match result already reported.');

  const isPlayer = match.player1Id === session.user.id || match.player2Id === session.user.id;
  const isAdmin = session.user.role === 'admin';
  if (!isPlayer && !isAdmin) throw new Error('You are not a participant in this match.');

  if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
    throw new Error('Winner must be one of the two players.');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { winnerId, score: score || null, status: 'complete' },
  });

  // Update winner stats (+50 rank points)
  await prisma.user.update({
    where: { id: winnerId },
    data: { wins: { increment: 1 }, rankPoints: { increment: 50 } },
  });

  // Update loser stats
  const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
  if (loserId) {
    await prisma.user.update({
      where: { id: loserId },
      data: { losses: { increment: 1 } },
    });
  }

  // Advance winner to next round (single elimination only)
  const tournament = await prisma.tournament.findUnique({
    where: { id: match.tournamentId },
    select: { format: true },
  });

  const matchSide = (match as { bracketSide?: string }).bracketSide;

  if (tournament?.format === 'double_elimination' && matchSide !== 'group') {
    await advanceDoubleElimMatch(matchId, winnerId);
  } else if (tournament?.format === 'single_elimination') {
    await advanceWinner(match.tournamentId, match.round, match.matchIndex, winnerId);
  }

  revalidatePath(`/tournaments/${match.tournamentId}`);
  revalidatePath('/rankings');
  revalidatePath('/dashboard');
}

export async function correctScore(matchId: string, newScore: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Admins only.');

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Match not found.');

  await prisma.match.update({
    where: { id: matchId },
    data: { score: newScore || null },
  });

  revalidatePath(`/tournaments/${match.tournamentId}`);
}
