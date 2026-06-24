'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminRole } from '@/lib/roles';
import { playerProfilePath } from '@/lib/player-profile';
import { getSupabaseAdmin, TOURNAMENT_IMAGES_BUCKET } from '@/lib/supabase-admin';
import { validateUsername } from '@/lib/username';
import { sendVerificationEmail, emailDeliveryErrorMessage } from '@/lib/email';
import {
  appBaseUrl,
  createVerificationToken,
  verificationTokenExpiresAt,
} from '@/lib/email-verification';
import { hashResetToken } from '@/lib/password-reset';

const MAX_BYTES = 500 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const UPLOAD_TIMEOUT_MS = 30_000;

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

function mimeFromFile(file: File): string | null {
  if (file.type && ALLOWED_TYPES.has(file.type)) {
    return file.type;
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_MIME[ext] ?? null;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

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
  const profilePath = playerProfilePath(username);
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  revalidatePath('/dashboard/profile');
  revalidatePath('/players');
  revalidatePath('/rankings');
  revalidatePath(profilePath);
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

  const mime = mimeFromFile(file);
  if (!mime) {
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

  const ext = extensionForMime(mime);
  const path = `avatars/${user.id}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let uploadError: { message: string } | null = null;
  try {
    const result = await withTimeout(
      supabase.storage.from(TOURNAMENT_IMAGES_BUCKET).upload(path, buffer, {
        contentType: mime,
        cacheControl: '3600',
        upsert: false,
      }),
      UPLOAD_TIMEOUT_MS,
      'Upload timed out. Check your connection and Supabase storage settings.',
    );
    uploadError = result.error;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Upload failed.',
    };
  }

  if (uploadError) {
    if (uploadError.message.toLowerCase().includes('bucket')) {
      return {
        error: `Storage bucket "${TOURNAMENT_IMAGES_BUCKET}" was not found. Create a public bucket with that name in Supabase Storage.`,
      };
    }
    return { error: uploadError.message || 'Upload failed.' };
  }

  const { data } = supabase.storage.from(TOURNAMENT_IMAGES_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    return { error: 'Upload succeeded but public URL could not be generated.' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar: data.publicUrl },
  });

  try {
    await deleteStoredAvatar(user.avatar);
  } catch (err) {
    console.error('[avatar] failed to delete previous photo:', err);
  }

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

export type EmailVerificationState = { error?: string; success?: string } | null;

export async function sendEmailVerification(): Promise<EmailVerificationState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to verify your email.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!user) {
    return { error: 'Account not found.' };
  }
  if (user.emailVerifiedAt) {
    return { success: 'Your email is already verified.' };
  }

  const token = createVerificationToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = verificationTokenExpiresAt();

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const verifyUrl = `${appBaseUrl()}/verify-email/${token}`;

  try {
    const result = await sendVerificationEmail(user.email, verifyUrl);
    if (!result.delivered) {
      return {
        success:
          'Verification link generated. Check your dev server logs for the link (Resend sandbox only allows your account email until a domain is verified).',
      };
    }
    return { success: 'Verification link sent. Check your inbox and spam folder.' };
  } catch (err) {
    console.error('[email-verification] Failed to send email:', err);
    await prisma.emailVerificationToken.deleteMany({ where: { tokenHash } });
    return { error: emailDeliveryErrorMessage(err) };
  }
}

export async function updateAccountSettings(
  _prev: AccountSettingsState,
  formData: FormData,
): Promise<AccountSettingsState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to update your account.' };
  }

  const usernameInput = (formData.get('username') as string)?.trim();
  const fullName = (formData.get('fullName') as string)?.trim() || null;
  const language = (formData.get('language') as string)?.trim() || 'en';
  const timezone = (formData.get('timezone') as string)?.trim() || 'America/New_York';
  const country = (formData.get('country') as string)?.trim() || 'US';

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, email: true, role: true },
  });
  if (!user) {
    return { error: 'Account not found.' };
  }

  const canEditUsername = isAdminRole(user.role);
  const username = canEditUsername ? usernameInput : user.username;

  if (canEditUsername) {
    const usernameError = validateUsername(username);
    if (usernameError) {
      return { error: usernameError };
    }
  } else if (usernameInput && usernameInput !== user.username) {
    return { error: 'Only admins can change their username.' };
  }

  const conflict = canEditUsername
    ? await prisma.user.findFirst({
        where: {
          id: { not: user.id },
          username,
        },
        select: { username: true },
      })
    : null;
  if (conflict) {
    return { error: 'That username is already taken.' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      username,
      fullName,
      language,
      timezone,
      country,
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
