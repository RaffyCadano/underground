'use server';

import { prisma } from '@/lib/prisma';
import { validateUsername } from '@/lib/username';

export async function checkUsernameAvailability(
  username: string,
): Promise<{ available: boolean; error?: string }> {
  const trimmed = username.trim();

  const validationError = validateUsername(trimmed);
  if (validationError) {
    return { available: false, error: validationError };
  }

  const existing = await prisma.user.findFirst({
    where: { username: { equals: trimmed, mode: 'insensitive' } },
    select: { id: true },
  });

  if (existing) {
    return { available: false, error: 'Username is already taken.' };
  }

  return { available: true };
}
