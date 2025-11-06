import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  tracesSampleRate: 1.0,
  
  // Server-specific config
  environment: process.env.VERCEL_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Enhanced server context
  beforeSend(event, hint) {
    // Add server context
    if (event.contexts) {
      event.contexts.converto = {
        platform: 'b2b_document_automation',
        version: '2.0.0',
        market: 'finland'
      };
    }
    
    return event;
  },
  
  initialScope: {
    tags: {
      "application": "converto-business-os",
      "environment": "server",
      "product": "document_automation"
    }
  },
});
