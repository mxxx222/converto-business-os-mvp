'use client';

import { useEffect } from 'react';
import { useABTest } from '@/lib/analytics/useABTest';
import { trackEvent } from '@/lib/analytics';

export function ABTestTracker() {
  const { variant, isClient } = useABTest();

  useEffect(() => {
    if (!isClient || !variant) return;

    // Track A/B test exposure
    trackEvent('ab_test_exposure', {
      test_name: 'storybrand_vs_original',
      variant,
      timestamp: new Date().toISOString(),
    });

    // PostHog tracking (if enabled)
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('ab_test_exposure', {
        test_name: 'storybrand_vs_original',
        variant,
        timestamp: new Date().toISOString(),
      });

      // Properties are already set via capture event above
    }

    // Plausible tracking
    trackEvent('AB Test Exposure', {
      test: 'storybrand_vs_original',
      variant,
    });
  }, [variant, isClient]);

  return null; // This component doesn't render anything
}
