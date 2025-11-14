import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, string | undefined>;
      if (headers.authorization) {
        delete headers.authorization;
      }
      if (headers.cookie) {
        delete headers.cookie;
      }
    }
    return event;
  },
  initialScope: {
    tags: { app: 'converto-business-os', tier: 'backend' }
  }
});

export {};
