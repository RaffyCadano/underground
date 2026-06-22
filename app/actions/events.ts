'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { generateEventSlug, isValidEventSlug, normalizeEventSlug } from '@/lib/event-slug';
import { prisma } from '@/lib/prisma';
import { canManageTournaments } from '@/lib/roles';
import { TIMEZONE_OPTIONS } from '@/lib/profile-settings-options';

function parseTimezone(value: string) {
  return TIMEZONE_OPTIONS.some((option) => option.value === value)
    ? value
    : 'America/New_York';
}

async function uniqueEventSlug(preferred?: string) {
  const normalized = preferred ? normalizeEventSlug(preferred) : '';
  if (normalized && isValidEventSlug(normalized)) {
    const taken = await prisma.event.findUnique({ where: { slug: normalized } });
    if (!taken) return normalized;
  }

  for (let attempt = 0; attempt < 30; attempt++) {
    const slug = generateEventSlug();
    const taken = await prisma.event.findUnique({ where: { slug } });
    if (!taken) return slug;
  }

  throw new Error('Could not generate a unique event permalink.');
}

export async function createEvent(_prev: { error?: string } | null, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageTournaments(session.user.role)) {
    return { error: 'Unauthorized.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const slugInput = (formData.get('slug') as string)?.trim();
  const shortDescription = (formData.get('shortDescription') as string)?.trim() || null;
  const description = (formData.get('description') as string)?.trim() || null;
  const startsAtStr = formData.get('startsAt') as string;
  const endsAtStr = (formData.get('endsAt') as string)?.trim();
  const timezone = parseTimezone((formData.get('timezone') as string)?.trim() || 'America/New_York');
  const isOnline = formData.get('isOnline') === 'on';
  const venueName = (formData.get('venueName') as string)?.trim() || null;
  const location = (formData.get('location') as string)?.trim() || null;
  const addressLine1 = (formData.get('addressLine1') as string)?.trim() || null;
  const addressLine2 = (formData.get('addressLine2') as string)?.trim() || null;
  const city = (formData.get('city') as string)?.trim() || null;
  const state = (formData.get('state') as string)?.trim() || null;
  const postalCode = (formData.get('postalCode') as string)?.trim() || null;
  const country = (formData.get('country') as string)?.trim() || null;

  if (!title) return { error: 'Title is required.' };
  if (!startsAtStr) return { error: 'Start date and time are required.' };

  const startsAt = new Date(startsAtStr);
  if (Number.isNaN(startsAt.getTime())) return { error: 'Invalid start date and time.' };

  let endsAt: Date | null = null;
  if (endsAtStr) {
    endsAt = new Date(endsAtStr);
    if (Number.isNaN(endsAt.getTime())) return { error: 'Invalid end date and time.' };
    if (endsAt < startsAt) return { error: 'End time must be after the start time.' };
  }

  const normalizedSlug = slugInput ? normalizeEventSlug(slugInput) : '';
  if (normalizedSlug && !isValidEventSlug(normalizedSlug)) {
    return { error: 'Permalink must be 3–32 letters, numbers, or hyphens.' };
  }

  let slug: string;
  try {
    slug = await uniqueEventSlug(normalizedSlug || undefined);
  } catch {
    return { error: 'Could not generate a unique permalink. Try a different code.' };
  }

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      shortDescription,
      description,
      startsAt,
      endsAt,
      timezone,
      isOnline,
      venueName: isOnline ? null : venueName,
      location: isOnline ? null : location,
      addressLine1: isOnline ? null : addressLine1,
      addressLine2: isOnline ? null : addressLine2,
      city: isOnline ? null : city,
      state: isOnline ? null : state,
      postalCode: isOnline ? null : postalCode,
      country: isOnline ? null : country,
      hostId: session.user.id,
      status: 'published',
    },
  });

  revalidatePath('/dashboard/your-events');
  revalidatePath('/events');
  redirect(`/events/${event.slug}`);
}
