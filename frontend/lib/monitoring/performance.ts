// Performance monitoring utilities for Converto Business OS

export function trackPageLoad(pageName: string) {
  if (typeof window === 'undefined') return;

  // Measure time to interactive
  if (window.performance) {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Track key metrics
    const metrics = {
      page_load_time: navTiming.loadEventEnd - navTiming.fetchStart,
      dom_interactive: navTiming.domInteractive - navTiming.fetchStart,
      first_contentful_paint: 0, // Would be measured with PerformanceObserver
    };

    // Send to analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_performance', {
        event_category: 'performance',
        event_label: pageName,
        value: Math.round(metrics.page_load_time),
        custom_map: {
          metric1: metrics.dom_interactive,
          metric2: metrics.page_load_time
        }
      });
    }

    // Log slow pages
    if (metrics.page_load_time > 3000) {
      console.warn(`Slow page load: ${pageName} took ${metrics.page_load_time}ms`);
    }
  }
}

export function trackAPICall(endpoint: string, duration: number, success: boolean) {
  // Track API performance
  if ((window as any).gtag) {
    (window as any).gtag('event', 'api_call', {
      event_category: 'api',
      event_label: endpoint,
      value: duration,
      success: success
    });
  }

  // Log slow or failed API calls
  if (!success || duration > 5000) {
    console.warn(`API issue: ${endpoint} - Duration: ${duration}ms, Success: ${success}`);
  }
}

export function trackUserAction(action: string, metadata?: any) {
  // Track user interactions
  if ((window as any).gtag) {
    (window as any).gtag('event', 'user_action', {
      event_category: 'engagement',
      event_label: action,
      ...metadata
    });
  }
}

export function trackFormInteraction(formName: string, field: string, action: string) {
  // Track form field interactions for optimization
  if ((window as any).gtag) {
    (window as any).gtag('event', 'form_interaction', {
      event_category: 'form',
      event_label: `${formName}_${field}_${action}`,
      form_name: formName,
      field_name: field,
      action: action
    });
  }
}

export function trackConversion(type: string, value: number, metadata?: any) {
  // Track conversions
  if ((window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      event_category: 'conversion',
      event_label: type,
      value: value,
      currency: 'EUR',
      ...metadata
    });
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if ((window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: 'LCP',
          value: Math.round(lastEntry.startTime)
        });
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if ((window as any).gtag && entry.processingStart) {
          (window as any).gtag('event', 'web_vitals', {
            event_category: 'performance',
            event_label: 'FID',
            value: Math.round(entry.processingStart - entry.startTime)
          });
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      if ((window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: 'CLS',
          value: Math.round(clsValue * 1000)
        });
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}
