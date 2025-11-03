/**
 * Web Vitals tracking
 */
export function reportWebVitals(metric: any) {
  // Send to analytics
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    }).catch((err) => console.error('Failed to report web vitals:', err));
  }
}

/**
 * Track Core Web Vitals
 */
export function trackCoreWebVitals() {
  if (typeof window === 'undefined') return;

  // LCP (Largest Contentful Paint)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lcp = (entry as any).renderTime || (entry as any).loadTime;
        console.log('LCP:', lcp);
        reportWebVitals({ name: 'LCP', value: lcp, id: 'lcp' });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Browser doesn't support LCP
  }

  // FID (First Input Delay)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as any).processingDuration;
        console.log('FID:', fid);
        reportWebVitals({ name: 'FID', value: fid, id: 'fid' });
      }
    }).observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // Browser doesn't support FID
  }

  // CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shiftEntry = entry as any;
        if (!shiftEntry.hadRecentInput) {
          clsValue += shiftEntry.value;
          console.log('CLS:', clsValue);
          reportWebVitals({ name: 'CLS', value: clsValue, id: 'cls' });
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Browser doesn't support CLS
  }
}
