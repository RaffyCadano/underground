import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const ADMIN_PREFIXES = [
  '/dashboard/overview',
  '/dashboard/tournaments',
  '/dashboard/clubs',
  '/dashboard/accounts',
];

export default withAuth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isAdminRoute && req.nextauth.token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}, {
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
