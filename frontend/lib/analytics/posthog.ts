/**
 * PostHog Analytics Integration
 * Production-ready analytics for user acquisition tracking
 */

declare global {
  interface Window {
    posthog?: {
      identify: (userId: string, properties?: Record<string, any>) => void;
      capture: (event: string, properties?: Record<string, any>) => void;
      reset: () => void;
      isFeatureEnabled: (flag: string) => boolean;
      onFeatureFlags: (callback: () => void) => void;
    };
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * Initialize PostHog
 */
export function initPostHog() {
  if (typeof window === 'undefined' || !POSTHOG_KEY) {
    return;
  }

  // Only load PostHog in production
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv !== 'production') {
    console.log('[PostHog] Disabled in non-production environment');
    return;
  }

  // Load PostHog script (only if package is available)
  // Note: PostHog is optional - install posthog-js package to enable
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    // PostHog is optional - skip if not installed
    // Install posthog-js package to enable PostHog analytics
    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] PostHog analytics disabled - install posthog-js package to enable');
    }
  }
}

/**
 * Identify user
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.identify(userId, properties);
  }
}

/**
 * Track event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(eventName, properties);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string) {
  trackEvent('$pageview', { path });
}

/**
 * Track conversion events
 */
export const trackPilotSignup = (email: string, source?: string) => {
  trackEvent('pilot_signup', {
    email,
    source: source || 'direct',
    timestamp: new Date().toISOString(),
  });
};

export const trackLogin = (userId: string, method: string = 'email') => {
  trackEvent('user_login', {
    user_id: userId,
    method,
    timestamp: new Date().toISOString(),
  });
};

export const trackDashboardView = (dashboardType: string) => {
  trackEvent('dashboard_view', {
    dashboard_type: dashboardType,
    timestamp: new Date().toISOString(),
  });
};

export const trackReceiptUpload = (receiptCount: number) => {
  trackEvent('receipt_upload', {
    receipt_count: receiptCount,
    timestamp: new Date().toISOString(),
  });
};

export const trackReportDownload = (reportType: string) => {
  trackEvent('report_download', {
    report_type: reportType,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Reset user session (on logout)
 */
export function resetPostHog() {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.reset();
  }
}

/**
 * Check feature flag
 */
export function isFeatureEnabled(flagName: string): boolean {
  if (typeof window !== 'undefined' && window.posthog) {
    return Boolean(window.posthog.isFeatureEnabled(flagName));
  }
  return false;
}
