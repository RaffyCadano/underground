import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ONLY_PREFIXES = [
  '/dashboard/overview',
  '/dashboard/clubs',
  '/dashboard/accounts',
];

const TOURNAMENT_STAFF_PREFIXES = ['/dashboard/tournaments'];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/admin',
  '/profile',
  '/messages',
  '/news',
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function canAccessTournamentDashboard(role: string | undefined) {
  return role === 'admin' || role === 'organizer' || role === 'player';
}

function nextWithPathname(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedPath(pathname)) {
    return nextWithPathname(req);
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signIn = new URL('/login', req.url);
    signIn.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signIn);
  }

  const role = token.role as string | undefined;

  if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES) && role !== 'admin') {
    return NextResponse.redirect(
      new URL(canAccessTournamentDashboard(role) ? '/dashboard/tournaments' : '/dashboard', req.url),
    );
  }

  if (matchesPrefix(pathname, TOURNAMENT_STAFF_PREFIXES) && !canAccessTournamentDashboard(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return nextWithPathname(req);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
