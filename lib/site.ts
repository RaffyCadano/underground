export const SITE_NAME = 'UGNCBBX';

export const SITE_FULL_NAME = 'Underground North Carolina Beyblade X';

export const SITE_DESCRIPTION =
  'The home of competitive Beyblade X tournaments and rankings in North Carolina.';

export const SITE_LOGO_SRC = '/ugncbbx-logo.png';

export const TOURNAMENTS_COVER_SRC = '/tournaments-cover.png';

export const TEAMS_COVER_SRC = '/teams-cover.png';

export const ORGANIZER_COVER_SRC = '/tournaments-cover.png';

function hostFromConfiguredUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}

/** Host from env vars — use on the client or when request headers are unavailable. */
export function publicSiteHostFromEnv(): string {
  return (
    hostFromConfiguredUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    hostFromConfiguredUrl(process.env.NEXTAUTH_URL) ??
    'localhost:3000'
  );
}

export function eventsPermalinkHost() {
  return publicSiteHostFromEnv();
}

export function tournamentsPermalinkHost() {
  return publicSiteHostFromEnv();
}
