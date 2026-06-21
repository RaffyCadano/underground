'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSupabaseAdmin, TOURNAMENT_IMAGES_BUCKET } from '@/lib/supabase-admin';

const MAX_BYTES = 5 * 1024 * 1024;
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
    return { error: 'Image must be 5 MB or smaller.' };
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
