import { prisma } from '@/lib/prisma';
import {
  appBaseUrl,
  createResetToken,
  hashResetToken,
} from '@/lib/password-reset';

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export { createResetToken as createVerificationToken, appBaseUrl };

export function verificationTokenExpiresAt() {
  return new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
}

export async function findValidVerificationToken(token: string) {
  const tokenHash = hashResetToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, emailVerifiedAt: true } } },
  });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  return record;
}

export async function verifyEmailFromToken(token: string) {
  const record = await findValidVerificationToken(token);
  if (!record) {
    return false;
  }

  if (record.user.emailVerifiedAt) {
    await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });
    return true;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return true;
}
