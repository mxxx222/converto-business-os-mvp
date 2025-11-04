import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// Edge Runtime for better performance
export const runtime = 'edge';

/**
 * OpenAI Usage Analytics Endpoint
 * Tracks API usage for cost optimization and monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json();

    // Validate metrics
    if (!metrics.model || !metrics.totalTokens) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    // Log to Sentry for monitoring (Edge Runtime compatible)
    try {
      Sentry.addBreadcrumb({
        category: 'openai_usage',
        message: `OpenAI API usage: ${metrics.model}`,
        level: 'info',
        data: {
          model: metrics.model,
          tokens: metrics.totalTokens,
          cost: metrics.cost,
          endpoint: metrics.endpoint,
        },
      });
    } catch (sentryError) {
      // Silently fail if Sentry is not available (Edge Runtime limitation)
      console.log('[OpenAI Usage]', metrics);
    }

    // TODO: Store in database for analytics dashboard
    // For now, we just log to Sentry/console

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OpenAI usage tracking error:', error);
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
