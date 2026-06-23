'use server';

import { prisma } from '@/lib/prisma';
import { playerProfilePath } from '@/lib/player-profile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  canManageProtectedAdminAccount,
  isMainAdminUsername,
  isProtectedAdminAccount,
  parseAssignableRole,
} from '@/lib/roles';
import { revalidatePath } from 'next/cache';
import { validateUsername } from '@/lib/username';

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

  const actorUsername = session.user.name ?? '';
  if (
    !canManageProtectedAdminAccount({ username: actorUsername }, { username: user.username })
  ) {
    throw new Error('The main admin account cannot be modified.');
  }

  const role =
    session.user.id === input.userId || isProtectedAdminAccount(user)
      ? user.role
      : parseAssignableRole(input.role);

  if (!username || !email) throw new Error('Username and email are required.');

  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  if (isProtectedAdminAccount(user) && !isMainAdminUsername(username)) {
    throw new Error('The main admin username cannot be changed.');
  }
  if (input.wins < 0 || input.losses < 0 || input.rankPoints < 0) {
    throw new Error('Stats cannot be negative.');
  }

  if (isProtectedAdminAccount(user) && role !== 'admin') {
    throw new Error('The main admin must remain an admin.');
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
  revalidatePath(playerProfilePath(username));
}

async function deleteUserById(
  userId: string,
  session: { user: { id: string; role: string } },
): Promise<void> {
  if (session.user.role !== 'admin') throw new Error('Unauthorized.');

  if (session.user.id === userId) {
    throw new Error('You cannot delete your own account.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found.');

  if (isProtectedAdminAccount(user)) {
    throw new Error('The main admin account cannot be deleted.');
  }

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
}

function revalidateAccountPaths() {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard/overview');
  revalidatePath('/players');
  revalidatePath('/rankings');
}

export async function deleteUsers(userIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { deleted: 0, skipped: 0, errors: [] as string[] };
  }

  let deleted = 0;
  const errors: string[] = [];

  for (const userId of uniqueIds) {
    try {
      await deleteUserById(userId, session);
      deleted++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account.';
      errors.push(message);
    }
  }

  if (deleted > 0) {
    revalidateAccountPaths();
  }

  return {
    deleted,
    skipped: uniqueIds.length - deleted,
    errors: [...new Set(errors)],
  };
}

export async function updateUserRole(userId: string, role: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  const nextRole = parseAssignableRole(role);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found.');

  if (isProtectedAdminAccount(user)) {
    throw new Error('The main admin role cannot be changed.');
  }

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

  await deleteUserById(userId, session);
  revalidateAccountPaths();
}
