// import posthog from 'posthog-js'; // Optional - install posthog-js package to enable
// Mock posthog for type checking
const posthog: any = null;

// Window interface for posthog is declared in lib/analytics/posthog.ts

export function initPostHog() {
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_AB_TESTING === 'true' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: true, // ei nauhoituksia
      persistence: 'localStorage', // ei cookieita
    });
    window.posthog = posthog as any;
  }
}

export default posthog;
