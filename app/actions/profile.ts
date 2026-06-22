'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSupabaseAdmin, TOURNAMENT_IMAGES_BUCKET } from '@/lib/supabase-admin';

const MAX_BYTES = 500 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin';
  }
}

function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

async function deleteStoredAvatar(url: string | null | undefined) {
  if (!url) return;

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const path = storagePathFromPublicUrl(url, TOURNAMENT_IMAGES_BUCKET);
  if (!path || !path.startsWith('avatars/')) return;

  await supabase.storage.from(TOURNAMENT_IMAGES_BUCKET).remove([path]);
}

function revalidateProfilePaths(username: string) {
  const slug = username.toLowerCase();
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  revalidatePath('/dashboard/profile');
  revalidatePath('/players');
  revalidatePath('/rankings');
  revalidatePath(`/players/${slug}`);
}

export async function uploadProfileAvatar(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to upload a profile photo.' };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        'Image upload is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) to your environment.',
    };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image to upload.' };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: 'Use a JPEG, PNG, WebP, or GIF image.' };
  }

  if (file.size > MAX_BYTES) {
    return { error: 'Image must be 500 KB or smaller.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, avatar: true },
  });
  if (!user) {
    return { error: 'Account not found.' };
  }

  const ext = extensionForMime(file.type);
  const path = `avatars/${user.id}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(TOURNAMENT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    if (error.message.toLowerCase().includes('bucket')) {
      return {
        error: `Storage bucket "${TOURNAMENT_IMAGES_BUCKET}" was not found. Create a public bucket with that name in Supabase Storage.`,
      };
    }
    return { error: error.message || 'Upload failed.' };
  }

  const { data } = supabase.storage.from(TOURNAMENT_IMAGES_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    return { error: 'Upload succeeded but public URL could not be generated.' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar: data.publicUrl },
  });

  await deleteStoredAvatar(user.avatar);
  revalidateProfilePaths(user.username);

  return { url: data.publicUrl };
}

export async function removeProfileAvatar(): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to remove your profile photo.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, avatar: true },
  });
  if (!user) {
    return { error: 'Account not found.' };
  }

  if (!user.avatar) {
    return {};
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar: null },
  });

  await deleteStoredAvatar(user.avatar);
  revalidateProfilePaths(user.username);

  return {};
}

export type AccountSettingsState = { error?: string; success?: string } | null;

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === 'on';
}

export async function updateAccountSettings(
  _prev: AccountSettingsState,
  formData: FormData,
): Promise<AccountSettingsState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to update your account.' };
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const username = (formData.get('username') as string)?.trim();
  const fullName = (formData.get('fullName') as string)?.trim() || null;
  const language = (formData.get('language') as string)?.trim() || 'en';
  const timezone = (formData.get('timezone') as string)?.trim() || 'America/New_York';
  const country = (formData.get('country') as string)?.trim() || 'US';

  if (!email || !username) {
    return { error: 'Email and username are required.' };
  }
  if (username.length < 3) {
    return { error: 'Username must be at least 3 characters.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true },
  });
  if (!user) {
    return { error: 'Account not found.' };
  }

  const conflict = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
      OR: [{ email }, { username }],
    },
    select: { email: true, username: true },
  });
  if (conflict) {
    if (conflict.email === email) return { error: 'That email is already in use.' };
    return { error: 'That username is already taken.' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email,
      username,
      fullName,
      language,
      timezone,
      country,
      emailPrivateMessages: checkboxValue(formData, 'emailPrivateMessages'),
      emailMatchNotifications: checkboxValue(formData, 'emailMatchNotifications'),
      markReadOnEmail: checkboxValue(formData, 'markReadOnEmail'),
      productUpdates: checkboxValue(formData, 'productUpdates'),
      optOutPersonalizedAds: checkboxValue(formData, 'optOutPersonalizedAds'),
    },
  });

  revalidateProfilePaths(username);
  if (username !== user.username) {
    revalidateProfilePaths(user.username);
  }

  return { success: 'Account settings saved.' };
}

export async function addBlockedUser(identifier: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to block users.' };
  }

  const normalized = identifier.trim().toLowerCase();
  if (!normalized) {
    return { error: 'Enter a username or email to block.' };
  }

  const self = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true },
  });
  if (!self) return { error: 'Account not found.' };
  if (normalized === self.username.toLowerCase() || normalized === self.email.toLowerCase()) {
    return { error: 'You cannot block yourself.' };
  }

  try {
    await prisma.blockedUser.create({
      data: {
        userId: session.user.id,
        identifier: normalized,
      },
    });
  } catch {
    return { error: 'That user is already blocked.' };
  }

  revalidatePath('/profile');
  return {};
}

export async function removeBlockedUser(blockId: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to manage blocked users.' };
  }

  const row = await prisma.blockedUser.findFirst({
    where: { id: blockId, userId: session.user.id },
  });
  if (!row) {
    return { error: 'Blocked user not found.' };
  }

  await prisma.blockedUser.delete({ where: { id: blockId } });
  revalidatePath('/profile');
  return {};
}
