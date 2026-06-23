import { Prisma } from '@prisma/client';

/** Prisma P1001 — database host unreachable (paused Supabase, wrong URL, network). */
export function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1017';
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Can't reach database server") ||
    message.includes('Connection timed out') ||
    message.includes('ECONNREFUSED')
  );
}
