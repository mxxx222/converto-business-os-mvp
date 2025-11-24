import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { scrub } from '@/lib/obs/pii';

/**
 * DocFlow Security Middleware
 * 
 * Adds security headers and handles observability for all requests.
 * 
 * Security headers:
 * - HSTS: Force HTTPS
 * - X-Content-Type-Options: Prevent MIME sniffing
 * - X-Frame-Options: Prevent clickjacking
 * - Referrer-Policy: Control referrer information
 * - Permissions-Policy: Disable unnecessary browser features
 * - CSP: Content Security Policy (report-only in staging)
 * 
 * Authentication:
 * - Protects /dashboard/* routes
 * - Redirects to /login if no session found
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/pricing',
    '/camera',
    '/beta',
    '/demo',
    '/thanks',
    '/roi',
    '/en',
    '/fi',
  ];

  // Check if route is protected (dashboard routes)
  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isPublicRoute = publicRoutes.includes(pathname) || 
                        pathname.startsWith('/api/') ||
                        pathname.startsWith('/_next/') ||
                        pathname.startsWith('/favicon');

  // Protect dashboard routes
  if (isProtectedRoute && !isPublicRoute) {
    // Check for Supabase session cookie
    // Supabase stores session in cookies with pattern: sb-<project-ref>-auth-token
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some(cookie => 
      cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
    );

    // If no session found, redirect to login
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  const headers = new Headers(request.headers);

  // Request ID for tracing
  if (!headers.get('x-request-id')) {
    headers.set('x-request-id', crypto.randomUUID());
  }

  // Tenant ID from cookie
  const tenantCookie = request.cookies.get('tenant_id')?.value;
  if (tenantCookie && !headers.get('x-tenant-id')) {
    headers.set('x-tenant-id', tenantCookie);
  }

  // Observability debug logging
  if (process.env.OBS_DEBUG_REQUESTS === 'true') {
    const safe = scrub({
      url: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll()
    });
    console.debug('[observability] incoming request', safe);
  }

  // Create response with security headers
  const response = NextResponse.next({
    request: {
      headers
    }
  });

  // =============================================================================
  // SECURITY HEADERS
  // =============================================================================

  // HSTS: Force HTTPS for 2 years, include subdomains
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable unnecessary browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // =============================================================================
  // CONTENT SECURITY POLICY
  // =============================================================================

  // CSP Report-Only in staging (for testing)
  // CSP Enforce in production (after 2 weeks of report-only analysis)
  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

  if (isStaging || isProduction) {
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self + Supabase + Stripe
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://js.stripe.com",
      // Styles: self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs + HTTPS (for OCR images)
      "img-src 'self' data: https:",
      // Fonts: self + data URIs
      "font-src 'self' data:",
      // Connect: self + Supabase + Stripe + DocFlow APIs
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.docflow.fi wss://*.supabase.co",
      // Frames: Stripe only
      "frame-src https://js.stripe.com",
      // Frame ancestors: none (prevent embedding)
      "frame-ancestors 'none'",
      // Base URI: self only
      "base-uri 'self'",
      // Form actions: self only
      "form-action 'self'",
      // Upgrade insecure requests
      "upgrade-insecure-requests",
    ];

    // Add report URI in staging
    if (isStaging) {
      cspDirectives.push("report-uri /api/csp-report");
    }

    const cspValue = cspDirectives.join('; ');

    // Report-Only in staging, Enforce in production
    const cspHeader = isStaging 
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    response.headers.set(cspHeader, cspValue);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)']
};
