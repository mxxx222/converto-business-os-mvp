import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

// Middleware runs on Edge Runtime by default in Next.js 14
// No need to explicitly export runtime

// A/B Test Configuration (bump name to invalidate old cookies)
const AB_TEST_COOKIE_NAME = 'ab_test_variant_v3';
const AB_TEST_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const AB_TEST_VARIANTS = {
  original: { weight: 100, path: '/' },
  premium: { weight: 0, path: '/premium' },
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
  // Respect weights from AB_TEST_VARIANTS
  const totalWeight = Object.values(AB_TEST_VARIANTS).reduce((sum, variant) => sum + variant.weight, 0);
  let random = Math.random() * totalWeight;

  for (const [variant, config] of Object.entries(AB_TEST_VARIANTS)) {
    random -= config.weight;
    if (random <= 0) {
      return variant;
    }
  }

  return 'original'; // fallback
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

  // Proactively clear legacy A/B test cookies that may force premium variant
  const legacyCookies = ['ab_test_variant', 'ab_test_variant_v2'];
  for (const name of legacyCookies) {
    if (request.cookies.get(name)) {
      response.cookies.set({
        name,
        value: '',
        maxAge: 0,
        path: '/',
      });
    }
  }

  // Do not perform any A/B redirects. Always continue to requested path.
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
