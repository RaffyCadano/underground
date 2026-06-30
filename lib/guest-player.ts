import { randomBytes } from 'crypto';
import type { PrismaClient } from '@prisma/client';

export function parseBulkParticipantLines(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(/[\n,]+/)) {
    const normalized = normalizeGuestDisplayName(part);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

export function normalizeGuestDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateGuestDisplayName(name: string): string | null {
  const normalized = normalizeGuestDisplayName(name);
  if (normalized.length < 2) return 'Name must be at least 2 characters.';
  if (normalized.length > 40) return 'Name must be 40 characters or fewer.';
  if (!/[a-zA-Z]/.test(normalized)) return 'Name must include at least one letter.';
  return null;
}

function usernameBaseFromDisplayName(name: string): string {
  const compact = name.replace(/[^a-zA-Z0-9]/g, '');
  return compact.slice(0, 30) || 'Guest';
}

function usernameCandidates(displayName: string): string[] {
  const normalized = normalizeGuestDisplayName(displayName);
  const readable = normalized.replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 40);
  const compact = usernameBaseFromDisplayName(normalized);
  return [...new Set([readable, compact].filter(Boolean))];
}

async function firstAvailableUsername(
  prisma: PrismaClient,
  base: string,
): Promise<string | null> {
  let candidate = base;
  let suffix = 2;

  while (await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) {
    candidate = `${base.slice(0, Math.max(1, 38 - String(suffix).length))} ${suffix}`.trim();
    suffix += 1;
    if (suffix > 999) return null;
  }

  return candidate;
}

export async function uniqueGuestUsername(
  prisma: PrismaClient,
  displayName: string,
): Promise<string> {
  for (const base of usernameCandidates(displayName)) {
    const available = await firstAvailableUsername(prisma, base);
    if (available) return available;
  }
  return `Guest${Date.now().toString(36)}`;
}

export async function uniqueInternalWalkInUsername(prisma: PrismaClient): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `walkin_${randomBytes(12).toString('hex')}`;
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `walkin_${Date.now().toString(36)}`;
}

export function guestEmail(username: string): string {
  return `guest+${username.toLowerCase()}@guest.underground.local`;
}

/** Walk-in guest credentials without DB lookups (collision-safe for batch inserts). */
export function generateInternalWalkInCredentials(): {
  username: string;
  email: string;
} {
  const username = `walkin_${randomBytes(12).toString('hex')}`;
  return {
    username,
    email: guestEmail(`${username}-${randomBytes(4).toString('hex')}`),
  };
}
