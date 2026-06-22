'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseAssignableRole } from '@/lib/roles';
import { revalidatePath } from 'next/cache';

export type UpdateUserInput = {
  userId: string;
  username: string;
  email: string;
  role: string;
  wins: number;
  losses: number;
  rankPoints: number;
};

export async function updateUser(input: UpdateUserInput) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error('User not found.');

  const role =
    session.user.id === input.userId ? user.role : parseAssignableRole(input.role);

  if (!username || !email) throw new Error('Username and email are required.');
  if (username.length < 3) throw new Error('Username must be at least 3 characters.');
  if (input.wins < 0 || input.losses < 0 || input.rankPoints < 0) {
    throw new Error('Stats cannot be negative.');
  }

  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      throw new Error('Cannot remove the last admin account.');
    }
  }

  try {
    await prisma.user.update({
      where: { id: input.userId },
      data: {
        username,
        email,
        role,
        wins: input.wins,
        losses: input.losses,
        rankPoints: input.rankPoints,
      },
    });
  } catch {
    throw new Error('Username or email is already taken.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard/overview');
  revalidatePath('/players');
  revalidatePath('/rankings');
  revalidatePath(`/players/${username.toLowerCase()}`);
}

export async function updateUserRole(userId: string, role: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  const nextRole = parseAssignableRole(role);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found.');

  if (session.user.id === userId && user.role !== nextRole) {
    throw new Error('You cannot change your own role.');
  }

  if (user.role === nextRole) return;

  if (user.role === 'admin' && nextRole !== 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      throw new Error('Cannot remove the last admin account.');
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: nextRole },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard/overview');
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  if (session.user.id === userId) {
    throw new Error('You cannot delete your own account.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found.');

  if (user.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      throw new Error('Cannot delete the last admin account.');
    }
  }

  await prisma.tournamentParticipant.deleteMany({ where: { userId } });
  await prisma.match.updateMany({ where: { player1Id: userId }, data: { player1Id: null } });
  await prisma.match.updateMany({ where: { player2Id: userId }, data: { player2Id: null } });
  await prisma.match.updateMany({ where: { winnerId: userId }, data: { winnerId: null } });
  await prisma.user.delete({ where: { id: userId } });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard/overview');
  revalidatePath('/players');
  revalidatePath('/rankings');
}
