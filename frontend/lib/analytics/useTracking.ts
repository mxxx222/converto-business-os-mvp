'use client';

import { useCallback } from 'react';
import { trackEvent } from '../analytics';
import { TRACKING_EVENTS } from './events';

export function useTracking() {
  const trackEventFn = useCallback((event: string, data?: Record<string, any>) => {
    trackEvent(event, data);
  }, []);

  return {
    trackEvent: trackEventFn,
    TRACKING_EVENTS,
  };
}
