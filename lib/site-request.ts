import 'server-only';

import { headers } from 'next/headers';
import { publicSiteHostFromEnv } from '@/lib/site';

/** Host from the incoming request, falling back to configured env vars. */
export async function publicSiteHost(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-host');
  if (forwarded) {
    const host = forwarded.split(',')[0]?.trim();
    if (host) return host;
  }

  const host = h.get('host');
  if (host) return host;

  return publicSiteHostFromEnv();
}

export async function eventsPermalinkHostFromRequest() {
  return publicSiteHost();
}

export async function tournamentsPermalinkHostFromRequest() {
  return publicSiteHost();
}
