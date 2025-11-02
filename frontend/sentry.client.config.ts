import * as Sentry from '@sentry/nextjs';

// OPTIMIZED: Maximum ROI Sentry Configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // OPTIMIZED: Performance Monitoring (APM) - 100% transactions
  tracesSampleRate: 1.0,

  // OPTIMIZED: Session Replay - Higher sampling for better insights
  replaysSessionSampleRate: 0.2, // 20% of sessions (increase from 10%)
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions

  // OPTIMIZED: Release Tracking
  release: process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown',
  environment: process.env.NODE_ENV || 'development',

  // OPTIMIZED: Integrations for maximum value
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // OPTIMIZED: Better replay quality
      maskAllText: false, // See text for better debugging
      blockAllMedia: false, // See media for better context
    }),
    // OPTIMIZED: User Feedback Widget (automatic error feedback)
    // Note: feedbackIntegration requires @sentry-internal/feedback package
    // Uncomment when package is installed:
    // Sentry.feedbackIntegration({
    //   autoInject: true,
    //   showName: true,
    //   showEmail: true,
    //   colorScheme: 'system',
    // }),
  ],

  // OPTIMIZED: Better error context
  attachStacktrace: true,
  sendDefaultPii: false, // Don't send PII

  // OPTIMIZED: Custom tags for filtering
  initialScope: {
    tags: {
      service: 'converto-frontend',
      component: 'nextjs',
    },
  },

  // OPTIMIZED: Filter sensitive data
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }
    return event;
  },

  // OPTIMIZED: Ignore common non-critical errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // Network errors that are handled
    'NetworkError',
    'Failed to fetch',
    // Bot traffic
    'bot',
  ],
});
