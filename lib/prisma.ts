import { PrismaClient } from '@prisma/client';

/** Bump when schema changes so dev hot-reload discards a stale cached client. */
const PRISMA_SCHEMA_VERSION = 4;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: number | undefined;
};

const DELEGATE_KEYS = [
  'user',
  'passwordResetToken',
  'communityClub',
  'clubRequest',
  'tournament',
  'tournamentParticipant',
  'match',
] as const;

function clientIsCurrent(client: PrismaClient): boolean {
  return DELEGATE_KEYS.every((key) => key in client);
}

function databaseUrlWithPoolLimits() {
  const url = process.env.DATABASE_URL;
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', process.env.PRISMA_CONNECTION_LIMIT ?? '5');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '10');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    datasources: {
      db: {
        url: databaseUrlWithPoolLimits(),
      },
    },
  });
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const versionOk = globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION;

  if (cached && versionOk && clientIsCurrent(cached)) {
    return cached;
  }

  // Hot reload / schema bump: disconnect the old client so we don't leak pool slots.
  if (cached) {
    void cached.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  return client;
}

export const prisma = getPrismaClient();
