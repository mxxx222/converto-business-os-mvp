/**
 * A/B Testing Manager - Converto Conversion Optimization
 * Test A (Current) vs B (Optimized) with 50/50 traffic split
 */

export interface ABTestVariant {
  id: 'A' | 'B';
  name: string;
  description: string;
  trafficPercentage: number;
  active: boolean;
}

export interface ABTestMetrics {
  variant: 'A' | 'B';
  pageViews: number;
  conversions: number;
  bounceRate: number;
  avgTimeOnPage: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  revenue: number;
}

class ABTestingManager {
  private static instance: ABTestingManager;
  private currentVariant: 'A' | 'B' | null = null;
  private metrics: Map<'A' | 'B', ABTestMetrics> = new Map();
  private testStartTime: Date = new Date();

  // Test configuration
  private readonly TEST_DURATION_DAYS = 14; // Minimum 2 weeks for statistical significance
  private readonly MIN_VISITORS_PER_VARIANT = 100;
  private readonly CONFIDENCE_LEVEL = 95; // 95% confidence required

  private constructor() {
    this.initializeMetrics();
  }

  static getInstance(): ABTestingManager {
    if (!ABTestingManager.instance) {
      ABTestingManager.instance = new ABTestingManager();
    }
    return ABTestingManager.instance;
  }

  /**
   * Assign visitor to variant based on traffic split
   */
  assignVariant(): 'A' | 'B' {
    // Check if user already has a variant assigned
    const storedVariant = this.getStoredVariant();
    if (storedVariant) {
      this.currentVariant = storedVariant;
      return storedVariant;
    }

    // Check test status
    if (!this.isTestActive()) {
      this.currentVariant = 'A'; // Default to control if test not active
      return 'A';
    }

    // Generate consistent variant assignment based on user ID/session
    const userHash = this.generateUserHash();
    const random = this.hashToRandom(userHash);

    // 50/50 split for this test
    this.currentVariant = random < 0.5 ? 'A' : 'B';

    // Store in localStorage for consistency
    this.storeVariant(this.currentVariant);

    // Track assignment
    this.trackEvent('variant_assignment', { variant: this.currentVariant });

    return this.currentVariant;
  }

  /**
   * Track user interaction for metrics
   */
  trackEvent(eventType: string, data: Record<string, any>) {
    if (!this.currentVariant) return;

    const timestamp = new Date().toISOString();
    const event = {
      variant: this.currentVariant,
      eventType,
      data,
      timestamp,
      sessionId: this.getSessionId(),
    };

    // Send to analytics platforms
    this.sendToAnalytics(event);

    // Store locally for dashboard
    this.storeEventLocally(event);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, referrer?: string) {
    this.trackEvent('page_view', { page, referrer });

    // Update metrics
    const metrics = this.getMetrics(this.currentVariant!);
    metrics.pageViews++;
    this.updateMetrics(this.currentVariant!, metrics);
  }

  /**
   * Track conversion
   */
  trackConversion(conversionType: string, value?: number) {
    this.trackEvent('conversion', {
      type: conversionType,
      value: value || 0
    });

    // Update conversion metrics
    const metrics = this.getMetrics(this.currentVariant!);
    metrics.conversions++;
    if (value) metrics.revenue += value;
    this.updateMetrics(this.currentVariant!, metrics);
  }

  /**
   * Track click-through rate
   */
  trackClick(element: string, target: string) {
    this.trackEvent('click', { element, target });
  }

  /**
   * Track bounce (user left without interaction)
   */
  trackBounce(page: string, timeOnPage: number) {
    this.trackEvent('bounce', { page, timeOnPage });

    const metrics = this.getMetrics(this.currentVariant!);
    metrics.bounceRate = ((metrics.bounceRate * (metrics.pageViews - 1)) + (timeOnPage < 30000 ? 1 : 0)) / metrics.pageViews;
    this.updateMetrics(this.currentVariant!, metrics);
  }

  /**
   * Get current test configuration
   */
  getTestConfig(): ABTestVariant[] {
    return [
      {
        id: 'A',
        name: 'Control (Current)',
        description: 'Current Converto website with existing conversion flow',
        trafficPercentage: 50,
        active: true,
      },
      {
        id: 'B',
        name: 'Optimized (Conversion-Focused)',
        description: 'Optimized version with improved conversion elements',
        trafficPercentage: 50,
        active: true,
      }
    ];
  }

  /**
   * Get metrics for specific variant
   */
  getMetrics(variant: 'A' | 'B'): ABTestMetrics {
    return this.metrics.get(variant) || {
      variant,
      pageViews: 0,
      conversions: 0,
      bounceRate: 0,
      avgTimeOnPage: 0,
      ctr: 0,
      conversionRate: 0,
      revenue: 0,
    };
  }

  /**
   * Get test results and statistical analysis
   */
  getTestResults() {
    const variantA = this.getMetrics('A');
    const variantB = this.getMetrics('B');

    // Calculate conversion rates
    const conversionRateA = variantA.pageViews > 0 ? (variantA.conversions / variantA.pageViews) * 100 : 0;
    const conversionRateB = variantB.pageViews > 0 ? (variantB.conversions / variantB.pageViews) * 100 : 0;

    // Statistical significance test (simplified)
    const improvement = conversionRateB - conversionRateA;
    const isSignificant = this.isStatisticallySignificant(variantA, variantB);

    // Recommendation
    const recommendation = isSignificant && improvement > 20 ?
      'Deploy B (Significant improvement)' :
      isSignificant && improvement > 0 ?
      'Deploy B (Moderate improvement)' :
      'Continue testing (No significant improvement)';

    return {
      testDuration: Math.floor((new Date().getTime() - this.testStartTime.getTime()) / (1000 * 60 * 60 * 24)),
      variantA: {
        ...variantA,
        conversionRate: conversionRateA,
      },
      variantB: {
        ...variantB,
        conversionRate: conversionRateB,
      },
      improvement: {
        absolute: improvement,
        relative: conversionRateA > 0 ? (improvement / conversionRateA) * 100 : 0,
      },
      statisticalSignificance: {
        isSignificant,
        confidenceLevel: this.CONFIDENCE_LEVEL,
        pValue: this.calculatePValue(variantA, variantB),
      },
      recommendation,
      testComplete: this.isTestComplete(),
    };
  }

  /**
   * Check if test should be completed
   */
  private isTestComplete(): boolean {
    const variantA = this.getMetrics('A');
    const variantB = this.getMetrics('B');

    // Check minimum visitor requirement
    if (variantA.pageViews < this.MIN_VISITORS_PER_VARIANT ||
        variantB.pageViews < this.MIN_VISITORS_PER_VARIANT) {
      return false;
    }

    // Check duration requirement
    const daysRunning = (new Date().getTime() - this.testStartTime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysRunning < this.TEST_DURATION_DAYS) {
      return false;
    }

    // Check if we have a clear winner
    const results = this.getTestResults();
    return results.statisticalSignificance.isSignificant;
  }

  /**
   * Check if test is currently active
   */
  private isTestActive(): boolean {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false;

    // Check if test was manually disabled
    const testDisabled = localStorage.getItem('converto_ab_test_disabled');
    if (testDisabled === 'true') return false;

    // Check test schedule (can be configured for specific dates)
    const testStart = new Date('2025-11-03'); // Test starts today
    const testEnd = new Date('2025-12-03'); // Test runs for 1 month

    const now = new Date();
    return now >= testStart && now <= testEnd;
  }

  // Private helper methods
  private generateUserHash(): string {
    // Generate consistent hash based on session/user data
    const sessionId = this.getSessionId();
    const userAgent = navigator.userAgent;
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp

    return btoa(sessionId + userAgent + timestamp).slice(-16);
  }

  private hashToRandom(hash: string): number {
    let hashNum = 0;
    for (let i = 0; i < hash.length; i++) {
      hashNum = (hashNum * 31 + hash.charCodeAt(i)) % 1000;
    }
    return hashNum / 1000;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('converto_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('converto_session_id', sessionId);
    }
    return sessionId;
  }

  private getStoredVariant(): 'A' | 'B' | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('converto_ab_variant');
      return (stored === 'A' || stored === 'B') ? stored : null;
    } catch {
      return null;
    }
  }

  private storeVariant(variant: 'A' | 'B') {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('converto_ab_variant', variant);
        localStorage.setItem('converto_ab_variant_assigned', new Date().toISOString());
      } catch (error) {
        console.warn('Failed to store A/B test variant:', error);
      }
    }
  }

  private initializeMetrics() {
    this.metrics.set('A', {
      variant: 'A',
      pageViews: 0,
      conversions: 0,
      bounceRate: 0,
      avgTimeOnPage: 0,
      ctr: 0,
      conversionRate: 0,
      revenue: 0,
    });
    this.metrics.set('B', {
      variant: 'B',
      pageViews: 0,
      conversions: 0,
      bounceRate: 0,
      avgTimeOnPage: 0,
      ctr: 0,
      conversionRate: 0,
      revenue: 0,
    });
  }

  private updateMetrics(variant: 'A' | 'B', metrics: ABTestMetrics) {
    this.metrics.set(variant, metrics);

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`converto_ab_metrics_${variant}`, JSON.stringify(metrics));
      } catch (error) {
        console.warn('Failed to store A/B test metrics:', error);
      }
    }
  }

  private sendToAnalytics(event: any) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('event', 'ab_test_event', {
          event_category: 'A/B Testing',
          event_label: `${event.variant}_${event.eventType}`,
          custom_parameters: {
            variant: event.variant,
            event_type: event.eventType,
            ...event.data,
          },
        });
      } catch (error) {
        console.warn('Failed to send GA4 event:', error);
      }
    }

    // Plausible
    if (typeof window !== 'undefined' && window.plausible) {
      try {
        window.plausible(`AB Test: ${event.variant} ${event.eventType}`, {
          props: {
            variant: event.variant,
            ...event.data,
          },
        });
      } catch (error) {
        console.warn('Failed to send Plausible event:', error);
      }
    }
  }

  private storeEventLocally(event: any) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('converto_ab_events') || '[]';
        const events = JSON.parse(stored);
        events.push(event);

        // Keep only last 1000 events
        if (events.length > 1000) {
          events.splice(0, events.length - 1000);
        }

        localStorage.setItem('converto_ab_events', JSON.stringify(events));
      } catch (error) {
        console.warn('Failed to store A/B test event:', error);
      }
    }
  }

  private isStatisticallySignificant(variantA: ABTestMetrics, variantB: ABTestMetrics): boolean {
    // Simplified z-test for conversion rates
    const n1 = variantA.pageViews;
    const n2 = variantB.pageViews;
    const p1 = variantA.conversions / Math.max(n1, 1);
    const p2 = variantB.conversions / Math.max(n2, 1);

    const pooled = (variantA.conversions + variantB.conversions) / (n1 + n2);
    const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));

    if (se === 0) return false;

    const z = Math.abs(p2 - p1) / se;

    // For 95% confidence level, z-score needs to be > 1.96
    return z > 1.96 && Math.min(n1, n2) >= this.MIN_VISITORS_PER_VARIANT;
  }

  private calculatePValue(variantA: ABTestMetrics, variantB: ABTestMetrics): number {
    // Simplified p-value calculation
    // In production, use a proper statistical library
    const n1 = variantA.pageViews;
    const n2 = variantB.pageViews;
    const p1 = variantA.conversions / Math.max(n1, 1);
    const p2 = variantB.conversions / Math.max(n2, 1);

    const pooled = (variantA.conversions + variantB.conversions) / (n1 + n2);
    const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));

    if (se === 0) return 1;

    const z = Math.abs(p2 - p1) / se;

    // Approximate p-value from z-score
    if (z > 3) return 0.001;
    if (z > 2.58) return 0.01;
    if (z > 1.96) return 0.05;
    if (z > 1.64) return 0.1;
    return 0.2;
  }
}

export const abTesting = ABTestingManager.getInstance();

// React hook for A/B testing
export function useABTesting() {
  const variant = abTesting.assignVariant();

  return {
    variant,
    isOptimized: variant === 'B',
    trackEvent: abTesting.trackEvent.bind(abTesting),
    trackPageView: abTesting.trackPageView.bind(abTesting),
    trackConversion: abTesting.trackConversion.bind(abTesting),
    trackClick: abTesting.trackClick.bind(abTesting),
    trackBounce: abTesting.trackBounce.bind(abTesting),
    getTestResults: abTesting.getTestResults.bind(abTesting),
  };
}
