/**
 * OpenAI Usage Tracking & Optimization
 * Tracks API usage, costs, and optimizes model selection
 */

interface UsageMetrics {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number; // USD
  timestamp: string;
  endpoint: string;
}

// Model pricing (per 1M tokens) - as of 2024
const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
};

/**
 * Calculate cost for API usage
 */
export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const prices = MODEL_PRICES[model] || MODEL_PRICES['gpt-4o-mini'];
  const inputCost = (promptTokens / 1_000_000) * prices.input;
  const outputCost = (completionTokens / 1_000_000) * prices.output;
  return inputCost + outputCost;
}

/**
 * Log usage to analytics and monitoring
 */
export async function logUsage(metrics: UsageMetrics): Promise<void> {
  try {
    // Log to console (development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[OpenAI Usage]', {
        model: metrics.model,
        tokens: metrics.totalTokens,
        cost: `$${metrics.cost.toFixed(4)}`,
        endpoint: metrics.endpoint,
      });
    }

    // Send to analytics endpoint (if configured - client-side only)
    if (typeof window !== 'undefined') {
      // Client-side: Send to analytics (fire-and-forget)
      fetch('/api/analytics/openai-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      }).catch(() => {
        // Silently fail - analytics is not critical
      });
    }

    // Server-side: Log to Sentry (if available)
    if (typeof process !== 'undefined' && process.env.SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs').catch(() => null);
      if (Sentry) {
        Sentry.addBreadcrumb({
          category: 'openai',
          message: `API usage: ${metrics.model}`,
          level: 'info',
          data: {
            model: metrics.model,
            tokens: metrics.totalTokens,
            cost: metrics.cost,
          },
        });
      }
    }
  } catch (error) {
    // Silently fail - usage tracking should not break the app
    console.error('Failed to log OpenAI usage:', error);
  }
}

/**
 * Get smart model recommendation based on task complexity
 */
export function getRecommendedModel(task: 'chat' | 'analysis' | 'code' | 'simple'): string {
  const modelMap: Record<string, string> = {
    chat: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    analysis: 'gpt-4o-mini', // Cost-effective for analysis
    code: 'gpt-4o-mini', // Good for code tasks
    simple: 'gpt-4o-mini', // Always use cheapest for simple tasks
  };

  return modelMap[task] || 'gpt-4o-mini';
}

/**
 * Track and optimize API usage
 * Fire-and-forget: Doesn't block the request
 */
export function trackUsage(
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number },
  endpoint: string
): void {
  const cost = calculateCost(model, usage.prompt_tokens, usage.completion_tokens);

  // Fire-and-forget: Don't await to avoid blocking the request
  logUsage({
    model,
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
    cost,
    timestamp: new Date().toISOString(),
    endpoint,
  }).catch((error) => {
    // Silently fail - usage tracking should not break the app
    console.error('Failed to track OpenAI usage:', error);
  });
}
