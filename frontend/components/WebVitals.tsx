'use client';

import { useEffect } from 'react';
import { trackCoreWebVitals } from '@/lib/monitoring/performance';

export function WebVitals() {
  useEffect(() => {
    // Initialize Web Vitals tracking
    trackCoreWebVitals();
  }, []);

  return null; // This component doesn't render anything
}
