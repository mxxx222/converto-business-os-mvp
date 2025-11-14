import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { scrub } from '@/lib/obs/pii';

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);

  if (!headers.get('x-request-id')) {
    headers.set('x-request-id', crypto.randomUUID());
  }

  const tenantCookie = request.cookies.get('tenant_id')?.value;
  if (tenantCookie && !headers.get('x-tenant-id')) {
    headers.set('x-tenant-id', tenantCookie);
  }

  if (process.env.OBS_DEBUG_REQUESTS === 'true') {
    const safe = scrub({
      url: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll()
    });
    console.debug('[observability] incoming request', safe);
  }

  return NextResponse.next({
    request: {
      headers
    }
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)']
};
