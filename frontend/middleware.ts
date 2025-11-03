import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// A/B test configuration
const AB_TEST_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_AB_TESTING === 'true',
  testName: 'storybrand_vs_original',
  variants: {
    original: { weight: 50, path: '/' },
    storybrand: { weight: 50, path: '/storybrand' },
  },
  // Cookie settings
  cookieName: 'ab_test_variant',
  cookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  // Exclusions
  excludePaths: ['/api', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/thank-you'],
  excludeUserAgents: ['bot', 'crawler', 'spider', 'lighthouse'],
};

function getVariantFromWeight(weights: Record<string, number>): string {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const [variant, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return variant;
    }
  }

  // Fallback to first variant
  return Object.keys(weights)[0];
}

function shouldExcludeFromTest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // Check excluded paths
  if (AB_TEST_CONFIG.excludePaths.some((path) => pathname.startsWith(path))) {
    return true;
  }

  // Check excluded user agents (bots, crawlers)
  if (
    AB_TEST_CONFIG.excludeUserAgents.some((agent) =>
      userAgent.toLowerCase().includes(agent)
    )
  ) {
    return true;
  }

  // Exclude if already on storybrand path
  if (pathname.startsWith('/storybrand')) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  // Update Supabase session and check auth
  const response = await updateSession(request);

  // PRODUCTION: Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // A/B test routing (only for homepage and when enabled)
  if (
    AB_TEST_CONFIG.enabled &&
    !shouldExcludeFromTest(request) &&
    request.nextUrl.pathname === '/'
  ) {
    // Check for existing variant cookie
    let variant = request.cookies.get(AB_TEST_CONFIG.cookieName)?.value;

    // If no variant cookie exists, assign one
    if (!variant || !Object.keys(AB_TEST_CONFIG.variants).includes(variant)) {
      const weights = Object.fromEntries(
        Object.entries(AB_TEST_CONFIG.variants).map(([key, config]) => [
          key,
          config.weight,
        ])
      );
      variant = getVariantFromWeight(weights);

      // Set variant cookie
      response.cookies.set({
        name: AB_TEST_CONFIG.cookieName,
        value: variant,
        maxAge: AB_TEST_CONFIG.cookieMaxAge,
        httpOnly: false, // Allow client-side access for analytics
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    // Redirect to appropriate variant if needed
    if (variant === 'storybrand') {
      // Use rewrite to serve /storybrand without changing URL
      const url = request.nextUrl.clone();
      url.pathname = '/storybrand';

      // Create rewrite response
      const rewriteResponse = NextResponse.rewrite(url);

      // Preserve variant cookie
      rewriteResponse.cookies.set({
        name: AB_TEST_CONFIG.cookieName,
        value: variant,
        maxAge: AB_TEST_CONFIG.cookieMaxAge,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      // Add variant header for analytics
      rewriteResponse.headers.set('X-AB-Test-Variant', variant);

      return rewriteResponse;
    }

    // Add variant header for analytics
    response.headers.set('X-AB-Test-Variant', variant);
  }

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
