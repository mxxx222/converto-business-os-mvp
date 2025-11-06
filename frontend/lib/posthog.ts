import posthog from 'posthog-js';

// Window interface for posthog is declared in lib/analytics/posthog.ts

export function initPostHog() {
  if (typeof window === 'undefined') {
    return;
  }

  const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!POSTHOG_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] NEXT_PUBLIC_POSTHOG_KEY not set - analytics disabled');
    }
    return;
  }

  // Only initialize in production or when explicitly enabled
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production' || process.env.NEXT_PUBLIC_AB_TESTING === 'true') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // We handle pageviews manually
      autocapture: false,
      disable_session_recording: true, // Privacy-friendly - no session recordings
      persistence: 'localStorage', // Use localStorage instead of cookies
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PostHog] Initialized successfully');
        }
      },
    });
    window.posthog = posthog as any;
  }
}

export default posthog;
