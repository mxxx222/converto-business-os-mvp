import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

// A/B Test Configuration
const AB_TEST_COOKIE_NAME = 'ab_test_variant';
const AB_TEST_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const AB_TEST_VARIANTS = {
  original: { weight: 50, path: '/' },
  storybrand: { weight: 50, path: '/storybrand' },
};

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /slurp/i,
  /mediapartners/i,
  /facebookexternalhit/i,
  /linkedinbot/i,
  /twitterbot/i,
  /googlebot/i,
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function getVariantFromCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get(AB_TEST_COOKIE_NAME);
  if (cookie && Object.keys(AB_TEST_VARIANTS).includes(cookie.value)) {
    return cookie.value;
  }
  return null;
}

function assignVariant(): string {
  // 50/50 split
  return Math.random() < 0.5 ? 'original' : 'storybrand';
}

function shouldExcludePath(pathname: string): boolean {
  // Exclude API routes, static files, and admin paths
  const excludePatterns = [
    '/api/',
    '/_next/',
    '/static/',
    '/admin/',
    '/dashboard/',
    '/sentry-example-page',
  ];
  return excludePatterns.some((pattern) => pathname.startsWith(pattern));
}

export async function middleware(request: NextRequest) {
  // First, update Supabase session
  const response = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Skip A/B testing for excluded paths
  if (shouldExcludePath(pathname)) {
    return response;
  }

  // Skip A/B testing for bots
  const userAgent = request.headers.get('user-agent');
  if (isBot(userAgent)) {
    return response;
  }

  // Only test root path
  if (pathname !== '/') {
    return response;
  }

  // Get variant from cookie or assign new one
  let variant = getVariantFromCookie(request);
  if (!variant) {
    variant = assignVariant();
  }

  // Set cookie if not already set
  if (!getVariantFromCookie(request)) {
    response.cookies.set(AB_TEST_COOKIE_NAME, variant, {
      maxAge: AB_TEST_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // Allow client-side access
    });
  }

  // Add variant header for analytics
  response.headers.set('X-AB-Test-Variant', variant);

  // Redirect to variant path if needed
  const variantPath = AB_TEST_VARIANTS[variant as keyof typeof AB_TEST_VARIANTS]?.path;
  if (variantPath && variantPath !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = variantPath;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};
