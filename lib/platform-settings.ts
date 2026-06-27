import { prisma } from '@/lib/prisma';

const SETTINGS_ID = 'default';
const DEFAULT_STANDARD_MAX_HOSTED_TOURNAMENTS = 3;

export async function getStandardMaxHostedTournaments(): Promise<number> {
  const row = await prisma.platformSettings.findUnique({
    where: { id: SETTINGS_ID },
    select: { standardMaxHostedTournaments: true },
  });
  return row?.standardMaxHostedTournaments ?? DEFAULT_STANDARD_MAX_HOSTED_TOURNAMENTS;
}

export async function getPlatformSettings() {
  const row = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
  return {
    standardMaxHostedTournaments:
      row?.standardMaxHostedTournaments ?? DEFAULT_STANDARD_MAX_HOSTED_TOURNAMENTS,
    updatedAt: row?.updatedAt ?? null,
  };
}

export async function updateStandardMaxHostedTournaments(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 999) {
    throw new Error('Hosted tournament limit must be a whole number between 1 and 999.');
  }

  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, standardMaxHostedTournaments: value },
    update: { standardMaxHostedTournaments: value },
  });
}
