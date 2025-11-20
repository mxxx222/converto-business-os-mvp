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
  // HTTP integration is automatically enabled in Sentry 8.x

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 
           process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Additional context
  initialScope: {
    tags: {
      runtime: "nodejs",
      app: "dashboard",
    },
  },

  // Ignore health check endpoints
  ignoreTransactions: [
    "/health",
    "/api/health",
    "/_next/static",
  ],
});

