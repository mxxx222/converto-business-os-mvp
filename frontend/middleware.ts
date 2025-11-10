import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // 301 Permanent Redirect: www.docflow.fi → docflow.fi
  if (hostname === 'www.docflow.fi') {
    const url = new URL(pathname + search, 'https://docflow.fi');
    return NextResponse.redirect(url, { status: 301 });
  }

  // 301 Permanent Redirect: converto.fi → docflow.fi
  if (hostname === 'converto.fi' || hostname === 'www.converto.fi') {
    const url = new URL(pathname + search, 'https://docflow.fi');
    return NextResponse.redirect(url, { status: 301 });
  }

  // Add security headers for all responses
  const response = NextResponse.next();
  
  // HSTS: Force HTTPS for 1 year, include subdomains, allow preload
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)|fonts|api).*)'
  ]
};
