import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session-cookie';

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/?signedOut=1', request.url));
  response.cookies.set(SESSION_COOKIE_NAME, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
