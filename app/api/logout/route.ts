import { NextResponse } from 'next/server';
import { appBaseUrl } from '@/lib/password-reset';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session-cookie';

export function GET() {
  const response = NextResponse.redirect(new URL('/?signedOut=1', appBaseUrl()));
  response.cookies.set(SESSION_COOKIE_NAME, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
