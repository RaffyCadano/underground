import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const ADMIN_ONLY_PREFIXES = [
  '/dashboard/overview',
  '/dashboard/clubs',
  '/dashboard/accounts',
];

const TOURNAMENT_STAFF_PREFIXES = ['/dashboard/tournaments'];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function canAccessTournamentDashboard(role: string | undefined) {
  return role === 'admin' || role === 'organizer' || role === 'player';
}

export default withAuth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const role = req.nextauth.token?.role;

  if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES) && role !== 'admin') {
    return NextResponse.redirect(
      new URL(canAccessTournamentDashboard(role) ? '/dashboard/tournaments' : '/dashboard', req.url),
    );
  }

  if (matchesPrefix(pathname, TOURNAMENT_STAFF_PREFIXES) && !canAccessTournamentDashboard(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}, {
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/profile', '/profile/:path*', '/messages', '/news'],
};
