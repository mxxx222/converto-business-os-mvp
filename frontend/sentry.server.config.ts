import * as Sentry from '@sentry/nextjs';

// OPTIMIZED: Maximum ROI Server-Side Sentry Configuration
if (process.env.NEXT_RUNTIME === 'nodejs') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

    // OPTIMIZED: Performance Monitoring (APM) - 100% transactions
    tracesSampleRate: 1.0,

    // OPTIMIZED: Release Tracking
    release: process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown',
    environment: process.env.NODE_ENV || 'development',

    // OPTIMIZED: Server-side integrations
    integrations: [
      Sentry.httpIntegration(),
      // Note: nodeProfilingIntegration may require @sentry/profiling-node package
    ],

    // OPTIMIZED: Better error context
    attachStacktrace: true,
    sendDefaultPii: false,

    // OPTIMIZED: Custom tags
    initialScope: {
      tags: {
        service: 'converto-frontend',
        component: 'nextjs-server',
      },
    },

    // OPTIMIZED: Filter sensitive data
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
      }
      return event;
    },
  });
}

export { Sentry };
