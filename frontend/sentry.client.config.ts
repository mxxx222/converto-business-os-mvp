import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring - 100% sampling with paid DSN
  tracesSampleRate: 1.0, // 100% - maksullinen DSN kestää
  profilesSampleRate: 0.1, // 10% profiling

  // Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'dev',

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Mask sensitive data
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Performance monitoring
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
    }

    // Filter noise
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        if (errorMessage.includes('ResizeObserver')) {
          return null; // Ignore ResizeObserver errors
        }
      }
    }

    return event;
  },
});
