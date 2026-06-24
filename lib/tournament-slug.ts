const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export const TOURNAMENT_SLUG_MIN_LENGTH = 3;
export const TOURNAMENT_SLUG_MAX_LENGTH = 32;

const RESERVED_SLUGS = new Set([
  'create',
  'new',
  'embed',
  'edit',
  'admin',
  'api',
]);

export function generateTournamentSlug(length = 8) {
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return slug;
}

export function normalizeTournamentSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, TOURNAMENT_SLUG_MAX_LENGTH);
}

export function isValidTournamentSlug(value: string) {
  if (!/^[a-z0-9]+$/.test(value)) return false;
  if (value.length < TOURNAMENT_SLUG_MIN_LENGTH || value.length > TOURNAMENT_SLUG_MAX_LENGTH) {
    return false;
  }
  return !RESERVED_SLUGS.has(value);
}

export function validateTournamentSlug(value: string): string | null {
  const normalized = normalizeTournamentSlug(value);
  if (!normalized) return 'URL is required.';
  if (normalized.length < TOURNAMENT_SLUG_MIN_LENGTH) {
    return `Use at least ${TOURNAMENT_SLUG_MIN_LENGTH} characters.`;
  }
  if (!isValidTournamentSlug(normalized)) {
    if (RESERVED_SLUGS.has(normalized)) return 'This URL is reserved.';
    return 'Use letters and numbers only.';
  }
  return null;
}

export function tournamentsPermalinkPrefix(host: string) {
  return `${host}/tournaments/`;
}
