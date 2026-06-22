import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageTournaments } from '@/lib/roles';

export async function requireTournamentManager() {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) {
    throw new Error('Unauthorized.');
  }
  return session;
}

export async function getTournamentManagerSession() {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) {
    return null;
  }
  return session;
}
