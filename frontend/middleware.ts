import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle www redirect
  if (request.nextUrl.hostname === 'www.docflow.fi') {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://docflow.fi')
    );
  }

  // Handle converto.fi redirect
  if (request.nextUrl.hostname === 'converto.fi' || request.nextUrl.hostname === 'www.converto.fi') {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://docflow.fi')
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)|fonts|api).*)'
  ]
};
