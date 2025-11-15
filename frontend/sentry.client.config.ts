/**
 * Sentry Client-Side Configuration
 * 
 * Initializes Sentry for browser/client-side error tracking and performance monitoring.
 * 
 * Features:
 * - Error tracking with sourcemaps
 * - Performance monitoring (tracing)
 * - Aggressive PII scrubbing (GDPR-compliant)
 * - ENV-controlled sampling
 * - Noise filtering (browser extensions, etc.)
 */

import * as Sentry from "@sentry/nextjs";

// PII scrubbing utility
function scrubPII(event: Sentry.Event): Sentry.Event | null {
  // Remove sensitive headers
  if (event.request?.headers) {
    const safeHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(event.request.headers)) {
      const lowerKey = key.toLowerCase();
      if (!['authorization', 'cookie', 'set-cookie', 'x-api-key'].includes(lowerKey)) {
        safeHeaders[key] = value;
      }
    }
    event.request.headers = safeHeaders;
  }

  // Remove cookies
  if (event.request?.cookies) {
    event.request.cookies = {};
  }

  // Scrub user data (keep only non-PII)
  if (event.user) {
    const { email, ip_address, username, ...safeUser } = event.user;
    event.user = safeUser;
  }

  // Scrub breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.data) {
        const { authorization, cookie, ...safeData } = breadcrumb.data;
        breadcrumb.data = safeData;
      }
      return breadcrumb;
    });
  }

  // Scrub exception messages (remove email patterns)
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map((exception) => {
      if (exception.value) {
        exception.value = exception.value.replace(
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
          '[REDACTED_EMAIL]'
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

  // Sampling - ENV-controlled (default 0.1 = 10%)
  tracesSampleRate: parseFloat(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.1"
  ),

  // Replay - disabled initially (expensive on quota)
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,

  // Performance monitoring
  integrations: [
    new Sentry.BrowserTracing({
      // Only trace important routes
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/.*\.docflow\.fi/,
      ],

      // Ignore health checks and static assets
      shouldCreateSpanForRequest: (url) => {
        return !url.includes("/health") && 
               !url.includes("/_next/static") &&
               !url.includes("/favicon.ico");
      },
    }),
  ],

  // Ignore common noise
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    
    // Network errors (user's connection issue, not our bug)
    "NetworkError",
    "Failed to fetch",
    "Load failed",
    
    // Cancelled requests (user navigation, not an error)
    "AbortError",
    "The operation was aborted",
    
    // Browser quirks
    "SecurityError",
    "NotAllowedError",
  ],

  // Deny URLs - don't report errors from these sources
  denyUrls: [
    /chrome-extension:\/\//,
    /moz-extension:\/\//,
    /safari-extension:\/\//,
    /^file:\/\//,
  ],

  // PII Scrubbing (GDPR-compliant)
  beforeSend(event, hint) {
    // Don't send if DSN not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    return scrubPII(event);
  },

  // Release tracking (set by Vercel)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Additional context
  initialScope: {
    tags: {
      runtime: "browser",
    },
  },
});
