'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function revalidateOrganizerRequestPaths() {
  revalidatePath('/profile');
  revalidatePath('/dashboard/profile');
  revalidatePath('/organizer/request');
  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard/overview');
}

export async function requestOrganizerRole(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to request organizer access.' };
  }

  const message = (formData.get('message') as string)?.trim();
  if (!message) return { error: 'Please tell us about your event experience.' };
  if (message.length < 20) {
    return { error: 'Please share a bit more detail (at least 20 characters).' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!user) return { error: 'Account not found.' };

  if (user.role === 'admin' || user.role === 'organizer') {
    return { error: 'You already have organizer or admin access.' };
  }
  if (user.role === 'guest') {
    return { error: 'Guest accounts cannot request organizer access.' };
  }

  const pending = await prisma.organizerRequest.findFirst({
    where: { userId: user.id, status: 'pending' },
  });
  if (pending) {
    return { error: 'You already have a pending organizer request.' };
  }

  await prisma.organizerRequest.create({
    data: {
      userId: user.id,
      message,
    },
  });

  revalidateOrganizerRequestPaths();
  return { success: true };
}

export async function approveOrganizerRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  const request = await prisma.organizerRequest.findUnique({
    where: { id: requestId },
    include: { user: { select: { id: true, role: true } } },
  });
  if (!request || request.status !== 'pending') throw new Error('Request not found.');

  await prisma.$transaction([
    prisma.user.update({
      where: { id: request.userId },
      data: { role: 'organizer' },
    }),
    prisma.organizerRequest.update({
      where: { id: requestId },
      data: { status: 'approved' },
    }),
  ]);

  revalidateOrganizerRequestPaths();
}

export async function dismissOrganizerRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  await prisma.organizerRequest.update({
    where: { id: requestId },
    data: { status: 'reviewed' },
  });

  revalidateOrganizerRequestPaths();
}
