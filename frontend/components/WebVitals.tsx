'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/monitoring/performance';

export function WebVitals() {
  useEffect(() => {
    // Initialize Web Vitals tracking
    initPerformanceMonitoring();
  }, []);

  return null; // This component doesn't render anything
}
