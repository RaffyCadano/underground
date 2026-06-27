'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { isAdminRole } from '@/lib/roles';
import { updateStandardMaxHostedTournaments } from '@/lib/platform-settings';

export async function saveStandardMaxHostedTournaments(
  value: number,
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole(session.user.role)) {
    return { error: 'Unauthorized.' };
  }

  try {
    await updateStandardMaxHostedTournaments(value);
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to save setting.' };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/tournaments/create');
  revalidatePath('/');
  revalidatePath('/pricing');
  revalidatePath('/features');
  revalidatePath('/profile/subscriptions');

  return { success: true };
}
