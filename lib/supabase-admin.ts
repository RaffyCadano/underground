import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
}

function supabaseSecretKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = supabaseUrl();
  const serviceRoleKey = supabaseSecretKey();

  if (!url || !serviceRoleKey) return null;

  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseSecretKey());
}

export const TOURNAMENT_IMAGES_BUCKET =
  process.env.SUPABASE_TOURNAMENT_IMAGES_BUCKET ?? 'tournament-images';
