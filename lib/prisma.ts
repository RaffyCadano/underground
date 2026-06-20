import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DELEGATE_KEYS = ['user', 'passwordResetToken', 'tournament', 'match'] as const;

function clientIsCurrent(client: PrismaClient) {
  return DELEGATE_KEYS.every((key) => key in client);
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && clientIsCurrent(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
