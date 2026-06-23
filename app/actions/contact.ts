'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CONTACT_CATEGORIES = ['general', 'account', 'billing', 'tournament', 'other'] as const;

function revalidateContactPaths() {
  revalidatePath('/contact');
  revalidatePath('/dashboard/contact');
  revalidatePath('/dashboard/overview');
}

export async function submitContactMessage(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const session = await getServerSession(authOptions);

  const name = (formData.get('name') as string)?.trim();
  const email = ((formData.get('email') as string) ?? session?.user?.email ?? '').trim().toLowerCase();
  const subject = (formData.get('subject') as string)?.trim();
  const message = (formData.get('message') as string)?.trim();
  const categoryRaw = (formData.get('category') as string)?.trim().toLowerCase();
  const category = CONTACT_CATEGORIES.includes(categoryRaw as (typeof CONTACT_CATEGORIES)[number])
    ? categoryRaw
    : 'general';

  if (!name) return { error: 'Name is required.' };
  if (!email) return { error: 'Email is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (!subject) return { error: 'Subject is required.' };
  if (subject.length > 200) return { error: 'Subject must be 200 characters or fewer.' };
  if (!message) return { error: 'Message is required.' };
  if (message.length < 10) return { error: 'Message must be at least 10 characters.' };
  if (message.length > 5000) return { error: 'Message must be 5000 characters or fewer.' };

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
      category,
      userId: session?.user?.id ?? null,
    },
  });

  revalidateContactPaths();
  return { success: true };
}

export async function resolveContactMessage(messageId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { status: 'resolved', resolvedAt: new Date() },
  });

  revalidateContactPaths();
}

export async function deleteContactMessage(messageId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized.');

  await prisma.contactMessage.delete({ where: { id: messageId } });

  revalidateContactPaths();
}
