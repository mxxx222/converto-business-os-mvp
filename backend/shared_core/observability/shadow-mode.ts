import { NextRequest, NextResponse } from "next/server";

interface ShadowModeConfig {
  enabled: boolean;
  targetUrl: string;
  headers: Record<string, string>;
  timeout: number;
  driftThreshold: number; // percentage
}

interface ShadowResult {
  original: {
    status: number;
    body: any;
    latency: number;
  };
  shadow: {
    status: number;
    body: any;
    latency: number;
  };
  drift: {
    statusMatch: boolean;
    bodyMatch: boolean;
    latencyDiff: number;
    driftPercentage: number;
  };
}

export class ShadowMode {
  private config: ShadowModeConfig;
  private results: ShadowResult[] = [];
  private driftAlerts: string[] = [];

  constructor(config: ShadowModeConfig) {
    this.config = config;
  }

  async executeShadow(request: NextRequest, originalResponse: NextResponse): Promise<ShadowResult> {
    if (!this.config.enabled) {
      return null as any;
    }

    const startTime = Date.now();
    
    try {
      // Clone the request for shadow execution
      const shadowRequest = new Request(this.config.targetUrl + request.url, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          ...this.config.headers,
          'X-Shadow-Mode': 'true',
          'X-Original-Request-ID': crypto.randomUUID(),
        },
        body: request.method !== 'GET' ? await request.clone().text() : undefined,
      });

      const shadowResponse = await fetch(shadowRequest, {
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const shadowBody = await shadowResponse.text();
      const shadowLatency = Date.now() - startTime;

      const originalBody = await originalResponse.clone().text();
      const originalLatency = Date.now() - startTime;

      const result: ShadowResult = {
        original: {
          status: originalResponse.status,
          body: JSON.parse(originalBody),
          latency: originalLatency,
        },
        shadow: {
          status: shadowResponse.status,
          body: JSON.parse(shadowBody),
          latency: shadowLatency,
        },
        drift: {
          statusMatch: originalResponse.status === shadowResponse.status,
          bodyMatch: this.compareBodies(JSON.parse(originalBody), JSON.parse(shadowBody)),
          latencyDiff: Math.abs(originalLatency - shadowLatency),
          driftPercentage: this.calculateDriftPercentage(originalLatency, shadowLatency),
        }
      };

      this.results.push(result);
      this.checkDriftThreshold(result);

      return result;
    } catch (error) {
      console.error("Shadow mode execution failed:", error);
      return null as any;
    }
  }

  private compareBodies(original: any, shadow: any): boolean {
    // Simple deep comparison (use lodash.isEqual in production)
    return JSON.stringify(original) === JSON.stringify(shadow);
  }

  private calculateDriftPercentage(original: number, shadow: number): number {
    if (original === 0) return 0;
    return Math.abs((shadow - original) / original) * 100;
  }

  private checkDriftThreshold(result: ShadowResult): void {
    if (result.drift.driftPercentage > this.config.driftThreshold) {
      const alert = `🚨 Drift alert: ${result.drift.driftPercentage.toFixed(2)}% difference detected`;
      this.driftAlerts.push(alert);
      console.warn(alert);
    }
  }

  getDriftReport(): {
    totalRequests: number;
    statusMatches: number;
    bodyMatches: number;
    averageDrift: number;
    alerts: string[];
  } {
    const totalRequests = this.results.length;
    const statusMatches = this.results.filter(r => r.drift.statusMatch).length;
    const bodyMatches = this.results.filter(r => r.drift.bodyMatch).length;
    const averageDrift = this.results.reduce((sum, r) => sum + r.drift.driftPercentage, 0) / totalRequests;

    return {
      totalRequests,
      statusMatches,
      bodyMatches,
      averageDrift,
      alerts: this.driftAlerts,
    };
  }

  getRecentResults(limit: number = 10): ShadowResult[] {
    return this.results.slice(-limit);
  }
}

// Global shadow mode instance
export const shadowMode = new ShadowMode({
  enabled: process.env.SHADOW_MODE_ENABLED === "true",
  targetUrl: process.env.SHADOW_TARGET_URL || "https://staging.converto.fi",
  headers: {
    "X-Shadow-Source": "production",
  },
  timeout: 5000,
  driftThreshold: 10, // 10% drift threshold
});
