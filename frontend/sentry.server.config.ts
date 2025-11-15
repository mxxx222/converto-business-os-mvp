/**
 * Sentry Server-Side Configuration
 * 
 * Initializes Sentry for Next.js server-side (API routes, SSR, etc.)
 * 
 * Features:
 * - Server-side error tracking
 * - API route performance monitoring
 * - Aggressive PII scrubbing
 * - HTTP request tracing
 */

import * as Sentry from "@sentry/nextjs";

// PII scrubbing utility (more aggressive on server)
function scrubPII(event: Sentry.Event): Sentry.Event | null {
  // Remove ALL headers (server-side can have more sensitive data)
  if (event.request?.headers) {
    event.request.headers = {};
  }

  // Remove cookies
  if (event.request?.cookies) {
    event.request.cookies = {};
  }

  // Remove query parameters (might contain tokens)
  if (event.request?.query_string) {
    event.request.query_string = "[REDACTED]";
  }

  // Scrub user data
  if (event.user) {
    const { email, ip_address, username, ...safeUser } = event.user;
    event.user = safeUser;
  }

  // Scrub breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.data) {
        // Remove all potentially sensitive data
        const { authorization, cookie, headers, ...safeData } = breadcrumb.data;
        breadcrumb.data = safeData;
      }
      return breadcrumb;
    });
  }

  // Scrub exception messages
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map((exception) => {
      if (exception.value) {
        // Remove emails
        exception.value = exception.value.replace(
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
          '[REDACTED_EMAIL]'
        );
        // Remove potential tokens
        exception.value = exception.value.replace(
          /\b[A-Za-z0-9_-]{20,}\b/g,
          '[REDACTED_TOKEN]'
        );
      }
      return exception;
    });
  }

  return event;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NEXT_PUBLIC_ENV || "development",

  // Server-side sampling (can be different from client)
  tracesSampleRate: parseFloat(
    process.env.SENTRY_SERVER_TRACES_SAMPLE_RATE || 
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 
    "0.1"
  ),

  // Integrations
  integrations: [
    new Sentry.Integrations.Http({ 
      tracing: true,
      breadcrumbs: true,
    }),
  ],

  // PII Scrubbing (aggressive on server)
  beforeSend(event, hint) {
    // Don't send if DSN not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    return scrubPII(event);
  },

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 
           process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Additional context
  initialScope: {
    tags: {
      runtime: "nodejs",
    },
  },

  // Ignore health check endpoints
  ignoreTransactions: [
    "/health",
    "/api/health",
    "/_next/static",
  ],
});
