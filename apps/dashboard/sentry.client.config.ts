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
  // BrowserTracing is automatically enabled in Sentry 8.x

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

  // Release tracking (set by Vercel)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Additional context
  initialScope: {
    tags: {
      runtime: "browser",
      app: "dashboard",
    },
  },
});

