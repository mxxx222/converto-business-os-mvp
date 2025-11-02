import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Track 404 errors for Plausible
  if (request.nextUrl.pathname.startsWith('/404')) {
    // Track 404 via API (server-side)
    fetch(`${request.nextUrl.origin}/api/analytics/plausible`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '404 Error',
        props: {
          path: request.nextUrl.pathname,
          referrer: request.headers.get('referer') || '',
        },
      }),
    }).catch(() => {
      // Silent fail
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, fonts, etc. (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};
