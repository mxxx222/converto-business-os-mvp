'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { trackEvent, identifyUser, trackPageView as trackPostHogPageView } from '@/lib/analytics/posthog';

export function useAnalytics() {
  const { user, role } = useAuth();

  useEffect(() => {
    if (user) {
      // Set user properties via identify
      identifyUser(user.id, {
        email: user.email,
        role: role,
        created_at: new Date().toISOString(),
      });

      // Track login
      trackEvent('user_login', {
        email: user.email,
        role: role,
      });
    }
  }, [user, role]);

  return { trackEvent, trackPageView: trackPostHogPageView };
}

/**
 * Track feature usage
 */
export function useFeatureTracking() {
  return {
    trackInsightsView: () => trackEvent('insights_viewed'),
    trackReceiptUpload: (count: number) => trackEvent('receipt_uploaded', { count }),
    trackReportGenerated: (type: string) => trackEvent('report_generated', { type }),
    trackSettingsChanged: (setting: string) => trackEvent('settings_changed', { setting }),
    trackDashboardView: (dashboardType: string) => trackEvent('dashboard_view', { dashboard_type: dashboardType }),
  };
}
