import { PrismaClient } from '@prisma/client';

/** Bump when schema changes so dev hot-reload discards a stale cached client. */
const PRISMA_SCHEMA_VERSION = 6;

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
  return DELEGATE_KEYS.every((key) => {
    const delegate = (client as Record<string, unknown>)[key];
    return (
      delegate != null &&
      typeof delegate === 'object' &&
      typeof (delegate as { findMany?: unknown }).findMany === 'function'
    );
  });
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

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();

  if (!clientIsCurrent(client)) {
    throw new Error(
      'Prisma client is missing model delegates (e.g. clubRequest). Run `npx prisma generate` and restart the dev server.',
    );
  }

  globalForPrisma.prisma = client;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
