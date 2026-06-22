/** URL segment for a player's public profile (lowercase, encoded). */
export function playerProfileSegment(username: string): string {
  return encodeURIComponent(username.toLowerCase());
}

export function playerProfilePath(username: string): string {
  return `/players/${playerProfileSegment(username)}`;
}

/** Decode a `[username]` route param into the stored username value. */
export function usernameFromProfileParam(param: string): string {
  let value = param.trim();
  if (!value) return value;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) value = decoded;
  } catch {
    value = value.replace(/%20/gi, ' ');
  }

  return value.replace(/\+/g, ' ').trim();
}
