import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_RUNTIME === 'nodejs') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance Monitoring - 100% sampling
    tracesSampleRate: 1.0, // 100%
    profilesSampleRate: 0.1, // 10%

    // Environment
    environment: process.env.NODE_ENV || 'development',
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'dev',

    // Server-side specific config
    integrations: [
      Sentry.httpIntegration(),
    ],

    // Track slow API calls
    beforeSendTransaction(event) {
      // Log all transactions (filtering handled by sampling rate)
      // Additional filtering can be added here if needed
      return event;
    },
  });
}

export { Sentry };
