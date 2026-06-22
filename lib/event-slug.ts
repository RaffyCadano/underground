const SLUG_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateEventSlug(length = 5) {
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return slug;
}

export function normalizeEventSlug(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 32);
}

export function isValidEventSlug(value: string) {
  return /^[A-Z0-9-]{3,32}$/.test(value);
}
