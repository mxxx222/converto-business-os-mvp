import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  
  // Enhanced error context
  beforeSend(event, hint) {
    // Add custom context for B2B platform
    if (event.user) {
      event.user = {
        ...event.user,
        segment: 'b2b_user',
        product: 'document_automation'
      };
    }
    
    // Filter sensitive data
    if (event.request?.data && typeof event.request.data === 'object') {
      const data = event.request.data as any;
      delete data.password;
      delete data.credit_card;
      delete data.api_key;
    }
    
    return event;
  },
  
  // Custom tags for B2B context
  initialScope: {
    tags: {
      "application": "converto-business-os",
      "product_tier": "b2b_automation",
      "market": "finland"
    }
  },

  // Note: Integrations would be configured based on Sentry version
  // integrations: [
  //   new Sentry.Replay({
  //     maskAllText: true,
  //     blockAllMedia: true,
  //   }),
  //   new Sentry.BrowserTracing({
  //     tracePropagationTargets: [
  //       "localhost",
  //       "converto.fi",
  //       /^\//,
  //     ],
  //   }),
  // ],
});
