'use client';

import { ReactNode, useEffect } from 'react';
import { initPostHog } from '@/lib/posthog';

interface AnalyticsProviderProps {
  children: ReactNode;
  config?: {
    enableDebug?: boolean;
    enableGA4?: boolean;
    enablePostHog?: boolean;
  };
}

export function AnalyticsProvider({ children, config = {} }: AnalyticsProviderProps) {
  useEffect(() => {
    if (config.enablePostHog) {
      initPostHog();
    }
  }, [config.enablePostHog]);

  return <>{children}</>;
}
