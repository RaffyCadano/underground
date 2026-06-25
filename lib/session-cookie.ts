/** Firebase Hosting only forwards a cookie named `__session` to Cloud Run. */
export const SESSION_COOKIE_NAME = '__session';

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function sessionCookieMaxAge() {
  return SESSION_MAX_AGE_SECONDS;
}
