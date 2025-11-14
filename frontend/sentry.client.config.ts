import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    if (event.user) {
      event.user.email = undefined;
    }
    return event;
  },
  initialScope: {
    tags: { app: 'converto-business-os', tier: 'frontend' }
  }
});

export function setClientContext({
  tenantId,
  requestId
}: {
  tenantId?: string;
  requestId?: string;
}) {
  if (tenantId) {
    Sentry.setTag('tenant_id', tenantId);
  }
  if (requestId) {
    Sentry.setTag('request_id', requestId);
  }
}
