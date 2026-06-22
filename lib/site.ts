export const SITE_NAME = 'UGNCBBX';

export const SITE_FULL_NAME = 'Underground North Carolina Beyblade X';

export const SITE_DESCRIPTION =
  'The home of competitive Beyblade X tournaments and rankings in North Carolina.';

export const SITE_LOGO_SRC = '/ugncbbx-logo.png';

export const TOURNAMENTS_COVER_SRC = '/tournaments-cover.png';

export const TEAMS_COVER_SRC = '/teams-cover.png';

export const ORGANIZER_COVER_SRC = '/tournaments-cover.png';

export function eventsPermalinkHost() {
  const url = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  try {
    return new URL(url).host;
  } catch {
    return 'localhost:3000';
  }
}
