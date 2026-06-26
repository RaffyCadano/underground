'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assertCanManageTournament, canManageTournament } from '@/lib/tournament-host';
import { advanceWinner } from '@/lib/bracket';
import { advanceDoubleElimMatch } from '@/lib/double-elim';
import { revalidatePath } from 'next/cache';

export async function reportResult(matchId: string, winnerId: string, score: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('You must be signed in.');

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Match not found.');
  if (match.status === 'complete') throw new Error('Match result already reported.');

  const tournament = await prisma.tournament.findUnique({
    where: { id: match.tournamentId },
    select: { format: true, isRanked: true, createdById: true },
  });

  const isPlayer = match.player1Id === session.user.id || match.player2Id === session.user.id;
  const canManage = tournament
    ? canManageTournament(tournament, session.user.id, session.user.role)
    : false;
  if (!isPlayer && !canManage) throw new Error('You are not a participant in this match.');

  if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
    throw new Error('Winner must be one of the two players.');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { winnerId, score: score || null, status: 'complete' },
  });

  // Update winner stats (+50 rank points when ranked)
  await prisma.user.update({
    where: { id: winnerId },
    data: {
      wins: { increment: 1 },
      ...(tournament?.isRanked !== false ? { rankPoints: { increment: 50 } } : {}),
    },
  });

  // Update loser stats
  const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
  if (loserId) {
    await prisma.user.update({
      where: { id: loserId },
      data: { losses: { increment: 1 } },
    });
  }

  const matchSide = (match as { bracketSide?: string }).bracketSide;

  if (tournament?.format === 'double_elimination' && matchSide !== 'group') {
    await advanceDoubleElimMatch(matchId, winnerId);
  } else if (tournament?.format === 'single_elimination' && matchSide !== 'third_place') {
    await advanceWinner(match.tournamentId, match.round, match.matchIndex, winnerId);
  }

  revalidatePath(`/tournaments/${match.tournamentId}`);
  revalidatePath('/rankings');
  revalidatePath('/dashboard');
}

export async function correctScore(matchId: string, newScore: string, winnerId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized.');

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Match not found.');
  if (match.status !== 'complete' || !match.winnerId) {
    throw new Error('Only completed matches can be corrected.');
  }

  await assertCanManageTournament(match.tournamentId, session.user.id, session.user.role);

  if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
    throw new Error('Winner must be one of the two players.');
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: match.tournamentId },
    select: { format: true, isRanked: true },
  });

  const oldWinnerId = match.winnerId;
  const winnerChanged = oldWinnerId !== winnerId;

  await prisma.match.update({
    where: { id: matchId },
    data: { score: newScore || null, winnerId },
  });

  if (winnerChanged) {
    const oldLoserId = oldWinnerId === match.player1Id ? match.player2Id : match.player1Id;
    const newLoserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;

    await prisma.user.update({
      where: { id: oldWinnerId },
      data: {
        wins: { decrement: 1 },
        ...(tournament?.isRanked !== false ? { rankPoints: { decrement: 50 } } : {}),
      },
    });
    if (oldLoserId) {
      await prisma.user.update({
        where: { id: oldLoserId },
        data: { losses: { decrement: 1 } },
      });
    }

    await prisma.user.update({
      where: { id: winnerId },
      data: {
        wins: { increment: 1 },
        ...(tournament?.isRanked !== false ? { rankPoints: { increment: 50 } } : {}),
      },
    });
    if (newLoserId) {
      await prisma.user.update({
        where: { id: newLoserId },
        data: { losses: { increment: 1 } },
      });
    }

    const matchSide = (match as { bracketSide?: string }).bracketSide;

    if (tournament?.format === 'double_elimination' && matchSide !== 'group') {
      await advanceDoubleElimMatch(matchId, winnerId, { forceReplace: true });
    } else if (tournament?.format === 'single_elimination' && matchSide !== 'third_place') {
      await advanceWinner(match.tournamentId, match.round, match.matchIndex, winnerId);
    }
  }

  revalidatePath(`/tournaments/${match.tournamentId}`);
  if (winnerChanged) {
    revalidatePath('/rankings');
    revalidatePath('/dashboard');
  }
}
