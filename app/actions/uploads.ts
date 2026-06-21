'use server';

import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

export async function uploadTournamentDescriptionImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return { error: 'Unauthorized.' };
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

  const ext = extensionForMime(file.type);
  const path = `descriptions/${randomUUID()}.${ext}`;
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

  return { url: data.publicUrl };
}
