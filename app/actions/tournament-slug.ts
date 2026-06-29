'use server';

import { prisma } from '@/lib/prisma';
import { normalizeTournamentSlug, validateTournamentSlug } from '@/lib/tournament-slug';

export async function checkTournamentSlugAvailability(slug: string, excludeTournamentId?: string) {
  const normalized = normalizeTournamentSlug(slug);
  const validationError = validateTournamentSlug(normalized);
  if (validationError) {
    return { available: false, error: validationError, slug: normalized };
  }

  const existing = await prisma.tournament.findFirst({
    where: {
      OR: [{ slug: normalized }, { id: normalized }],
      ...(excludeTournamentId ? { NOT: { id: excludeTournamentId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return { available: false, error: 'This URL is already taken.', slug: normalized };
  }

  return { available: true, slug: normalized };
}
