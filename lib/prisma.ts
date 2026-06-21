import { PrismaClient } from '@prisma/client';

/** Bump when schema changes so dev hot-reload discards a stale cached client. */
const PRISMA_SCHEMA_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: number | undefined;
};

const DELEGATE_KEYS = ['user', 'passwordResetToken', 'tournament', 'match'] as const;

function clientIsCurrent(client: PrismaClient) {
  if (!DELEGATE_KEYS.every((key) => key in client)) return false;
  // Runtime check: Tournament must include fields added after initial schema
  const dmmf = (client as unknown as { _dmmf?: { datamodel?: { models?: { name: string; fields: { name: string }[] }[] } } })._dmmf;
  const tournament = dmmf?.datamodel?.models?.find((m) => m.name === 'Tournament');
  return tournament?.fields.some((f) => f.name === 'groupStageEnabled') ?? false;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  const versionMatch = globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION;

  if (cached && versionMatch && clientIsCurrent(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  }
  return client;
}

export const prisma = getPrismaClient();
