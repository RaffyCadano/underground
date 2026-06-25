import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function createResetToken() {
  return randomBytes(32).toString('hex');
}

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function resetTokenExpiresAt() {
  return new Date(Date.now() + RESET_TOKEN_TTL_MS);
}

export async function findValidResetToken(token: string) {
  const tokenHash = hashResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  return record;
}

export function appBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? 'http://localhost:3000';
}
