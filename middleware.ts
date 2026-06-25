import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Auth is enforced in server layouts via getServerSession — not here. Runtime secrets
 *  (NEXTAUTH_SECRET) are not reliably available in middleware on Firebase App Hosting. */
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
