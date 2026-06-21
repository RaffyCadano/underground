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

export async function requestClub(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const session = await getServerSession(authOptions);

  const clubName = (formData.get('clubName') as string)?.trim();
  const region = (formData.get('region') as string)?.trim();
  const captain = (formData.get('captain') as string)?.trim() || null;
  const contactName = (formData.get('contactName') as string)?.trim() || null;
  const contactEmail = ((formData.get('contactEmail') as string) ?? session?.user?.email ?? '')
    .trim()
    .toLowerCase();
  const message = (formData.get('message') as string)?.trim() || null;
  const memberCountRaw = (formData.get('memberCount') as string)?.trim();
  const memberCount = memberCountRaw ? Number(memberCountRaw) : null;

  if (!clubName || !region) return { error: 'Club name and region are required.' };
  if (!contactEmail) return { error: 'Contact email is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { error: 'Enter a valid email address.' };
  }
  if (memberCount != null && (Number.isNaN(memberCount) || memberCount < 0)) {
    return { error: 'Member count must be 0 or greater.' };
  }

  const slug = slugifyClubName(clubName);
  if (!slug) return { error: 'Club name must contain letters or numbers.' };

  const existingClub = await prisma.communityClub.findFirst({
    where: { OR: [{ name: { equals: clubName, mode: 'insensitive' } }, { slug }] },
  });
  if (existingClub) {
    return { error: 'A club with this name is already listed on Underground.' };
  }

  const pendingDuplicate = await prisma.clubRequest.findFirst({
    where: {
      status: 'pending',
      clubName: { equals: clubName, mode: 'insensitive' },
    },
  });
  if (pendingDuplicate) {
    return { error: 'A request for this club name is already pending review.' };
  }

  await prisma.clubRequest.create({
    data: {
      clubName,
      region,
      captain,
      contactName,
      contactEmail,
      memberCount,
      message,
      userId: session?.user?.id ?? null,
    },
  });

  revalidatePath('/dashboard/clubs');
  return { success: true };
}

export async function dismissClubRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  await prisma.clubRequest.update({
    where: { id: requestId },
    data: { status: 'reviewed' },
  });

  revalidatePath('/dashboard/clubs');
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
