import type { PrismaClient } from '@prisma/client';

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

export function guestEmail(username: string): string {
  return `guest+${username.toLowerCase()}@guest.underground.local`;
}
