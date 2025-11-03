'use client';

import { useEffect } from 'react';

export function PostHogInit() {
  useEffect(() => {
    // Initialize PostHog only if AB testing is enabled
    if (process.env.NEXT_PUBLIC_AB_TESTING === 'true') {
      import('@/lib/posthog').then(({ initPostHog }) => {
        initPostHog();
      });
    }
  }, []);

  return null;
}
