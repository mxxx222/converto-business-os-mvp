/**
 * Plausible Analytics - Optimized Implementation
 * Maximizes token usage with goals, revenue tracking, and Stats API
 */

export interface PlausibleGoal {
  name: string;
  value?: number;
  revenue?: number;
  currency?: string;
  props?: Record<string, any>;
}

export interface PlausibleEvent {
  name: string;
  props?: Record<string, any>;
  callback?: () => void;
}

class PlausibleOptimized {
  private domain: string;
  private apiKey: string | null = null;
  private goals: Set<string> = new Set();

  constructor() {
    this.domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'converto.fi';
    this.apiKey = process.env.PLAUSIBLE_API_KEY || null;

    // Initialize goals
    this.goals = new Set([
      'Pilot Signup',
      'Payment',
      'Demo Booking',
      'Form Submit',
      'Document Download',
      'Newsletter Signup',
    ]);
  }

  /**
   * Track page view (automatic, but can be called manually)
   */
  trackPageView(path?: string): void {
    if (typeof window === 'undefined') return;

    const url = path || window.location.pathname;
    if (window.plausible) {
      window.plausible('pageview', {
        props: {
          path: url,
          referrer: document.referrer,
        },
      });
    }
  }

  /**
   * Track goal conversion with revenue
   */
  trackGoal(goal: PlausibleGoal): void {
    if (typeof window === 'undefined') return;

    if (window.plausible) {
      const event: PlausibleEvent = {
        name: goal.name,
        props: {
          ...goal.props,
          ...(goal.value && { value: goal.value }),
          ...(goal.revenue && { revenue: goal.revenue }),
          ...(goal.currency && { currency: goal.currency }),
        },
      };

      window.plausible(event.name, { props: event.props });
    }

    // Server-side tracking (if API key available)
    if (this.apiKey) {
      this.trackServerSide(goal);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(event: PlausibleEvent): void {
    if (typeof window === 'undefined') return;

    if (window.plausible) {
      const options: any = { props: event.props };
      if (event.callback) {
        options.callback = event.callback;
      }
      window.plausible(event.name, options);
    }
  }

  /**
   * Track revenue (payment/subscription)
   */
  trackRevenue(amount: number, currency: string = 'EUR', props?: Record<string, any>): void {
    this.trackGoal({
      name: 'Payment',
      revenue: amount,
      value: amount,
      currency,
      props: {
        ...props,
        event_type: 'revenue',
      },
    });
  }

  /**
   * Track outbound link click
   */
  trackOutboundLink(url: string, props?: Record<string, any>): void {
    this.trackEvent({
      name: 'Outbound Link Click',
      props: {
        ...props,
        url,
        link_type: 'external',
      },
    });
  }

  /**
   * Track file download
   */
  trackDownload(filename: string, fileType: string, props?: Record<string, any>): void {
    this.trackEvent({
      name: 'File Download',
      props: {
        ...props,
        filename,
        file_type: fileType,
      },
    });
  }

  /**
   * Track 404 error
   */
  track404(path: string, referrer?: string): void {
    this.trackEvent({
      name: '404 Error',
      props: {
        path,
        referrer: referrer || document.referrer,
      },
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, success: boolean, props?: Record<string, any>): void {
    this.trackGoal({
      name: 'Form Submit',
      props: {
        ...props,
        form_name: formName,
        success,
      },
    });
  }

  /**
   * Track email event (server-side)
   */
  async trackEmailEvent(event: 'open' | 'click', emailId: string, props?: Record<string, any>): Promise<void> {
    if (!this.apiKey) return;

    await fetch('/api/analytics/plausible', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Email ${event.charAt(0).toUpperCase() + event.slice(1)}`,
        props: {
          ...props,
          email_id: emailId,
          event_type: 'email',
        },
      }),
    });
  }

  /**
   * Server-side tracking (via API)
   */
  private async trackServerSide(goal: PlausibleGoal): Promise<void> {
    if (!this.apiKey) return;

    try {
      await fetch('/api/analytics/plausible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: goal.name,
          domain: this.domain,
          url: window.location.href,
          props: goal.props,
          revenue: goal.revenue,
        }),
      });
    } catch (error) {
      console.warn('Failed to track server-side:', error);
    }
  }

  /**
   * Get stats from Plausible Stats API
   */
  async getStats(period: string = '30d', metrics: string[] = ['visitors', 'pageviews']): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Plausible API key not configured');
    }

    const params = new URLSearchParams({
      site_id: this.domain,
      period,
      metrics: metrics.join(','),
    });

    const response = await fetch(`/api/analytics/plausible/stats?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Plausible API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get conversion funnel
   */
  async getConversionFunnel(period: string = '30d'): Promise<any> {
    const goals = Array.from(this.goals);
    const funnel = {
      visitors: 0,
      pilot_signups: 0,
      payments: 0,
      conversion_rate: 0,
    };

    try {
      const stats = await this.getStats(period, ['visitors']);
      funnel.visitors = stats.results?.visitors?.value || 0;

      // Get goal completions
      for (const goal of goals) {
        const goalStats = await this.getStats(period, ['events']);
        // Parse goal stats (simplified)
        if (goal === 'Pilot Signup') {
          funnel.pilot_signups = goalStats.results?.events?.value || 0;
        }
        if (goal === 'Payment') {
          funnel.payments = goalStats.results?.events?.value || 0;
        }
      }

      funnel.conversion_rate = funnel.visitors > 0
        ? (funnel.payments / funnel.visitors * 100).toFixed(2)
        : '0';

      return funnel;
    } catch (error) {
      console.error('Failed to get conversion funnel:', error);
      return funnel;
    }
  }
}

// Export singleton instance
export const plausible = new PlausibleOptimized();

// React hook for easy usage
export function usePlausible() {
  return {
    trackGoal: (goal: PlausibleGoal) => plausible.trackGoal(goal),
    trackEvent: (event: PlausibleEvent) => plausible.trackEvent(event),
    trackRevenue: (amount: number, currency?: string, props?: Record<string, any>) =>
      plausible.trackRevenue(amount, currency, props),
    trackDownload: (filename: string, fileType: string, props?: Record<string, any>) =>
      plausible.trackDownload(filename, fileType, props),
    trackFormSubmit: (formName: string, success: boolean, props?: Record<string, any>) =>
      plausible.trackFormSubmit(formName, success, props),
    getStats: (period?: string, metrics?: string[]) => plausible.getStats(period, metrics),
    getConversionFunnel: (period?: string) => plausible.getConversionFunnel(period),
  };
}

// Global window types
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any>; callback?: () => void }) => void;
  }
}
