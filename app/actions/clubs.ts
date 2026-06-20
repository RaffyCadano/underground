'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { slugifyClubName } from '@/lib/clubs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function revalidateClubPaths() {
  revalidatePath('/teams');
  revalidatePath('/dashboard/clubs');
  revalidatePath('/dashboard/overview');
}

export async function createClub(_prev: { error?: string } | null, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return { error: 'Unauthorized.' };

  const name = (formData.get('name') as string)?.trim();
  const tagline = (formData.get('tagline') as string)?.trim() || null;
  const region = (formData.get('region') as string)?.trim();
  const captain = (formData.get('captain') as string)?.trim() || null;
  const memberCount = Number(formData.get('memberCount'));
  const eventsCount = Number(formData.get('eventsCount'));

  if (!name || !region) return { error: 'Name and region are required.' };
  if (Number.isNaN(memberCount) || memberCount < 0) return { error: 'Member count must be 0 or greater.' };
  if (Number.isNaN(eventsCount) || eventsCount < 0) return { error: 'Events count must be 0 or greater.' };

  const slug = slugifyClubName(name);
  if (!slug) return { error: 'Club name must contain letters or numbers.' };

  const existing = await prisma.communityClub.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) return { error: 'A club with this name already exists.' };

  await prisma.communityClub.create({
    data: {
      name,
      slug,
      tagline,
      region,
      captain,
      memberCount,
      eventsCount,
    },
  });

  revalidateClubPaths();
  redirect('/dashboard/clubs');
}

export async function deleteClub(clubId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  await prisma.communityClub.delete({ where: { id: clubId } });
  revalidateClubPaths();
}
