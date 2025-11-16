/**
 * Test Error Endpoint for Sentry Verification
 * Triggers test errors to verify Sentry integration
 */

import { NextRequest } from 'next/server';
import { errorResponse } from '../_lib/response';
import * as Sentry from '@sentry/nextjs';

// Use Edge Runtime for fast error testing
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const errorType = url.searchParams.get('type') || 'generic';

  // Add breadcrumb for debugging
  Sentry.addBreadcrumb({
    message: 'Test error triggered',
    category: 'test',
    level: 'info',
    data: { error_type: errorType },
  });

  switch (errorType) {
    case 'generic':
      // Generic test error
      const error = new Error('Test error for Sentry verification');
      error.name = 'TestError';
      Sentry.captureException(error, {
        tags: {
          test_type: 'generic',
          component: 'test-endpoint',
        },
        extra: {
          triggered_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
        },
      });
      throw error;

    case 'validation':
      // Validation error simulation
      Sentry.captureMessage('Test validation error', {
        level: 'error',
        tags: {
          test_type: 'validation',
          component: 'test-endpoint',
        },
      });
      return errorResponse('VALIDATION_ERROR', 'Test validation error', null, 422);

    case 'auth':
      // Auth error simulation
      Sentry.captureMessage('Test authentication error', {
        level: 'warning',
        tags: {
          test_type: 'auth',
          component: 'test-endpoint',
        },
      });
      return errorResponse('UNAUTHORIZED', 'Test authentication error', null, 401);

    case 'performance':
      // Performance issue simulation
      const start = Date.now();
      
      // Simulate slow operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duration = Date.now() - start;
      
      Sentry.captureMessage('Test slow operation', {
        level: 'warning',
        tags: {
          test_type: 'performance',
          component: 'test-endpoint',
        },
        extra: {
          duration_ms: duration,
        },
      });
      
      return errorResponse('TIMEOUT', 'Test slow operation completed', { duration_ms: duration }, 408);

    default:
      return errorResponse('INVALID_TEST_TYPE', 'Invalid test error type', { 
        available_types: ['generic', 'validation', 'auth', 'performance'] 
      }, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Capture custom test event
    Sentry.captureMessage('Custom test event', {
      level: 'info',
      tags: {
        test_type: 'custom',
        component: 'test-endpoint',
      },
      extra: body,
    });

    // Simulate processing error
    if (body.should_fail) {
      throw new Error('Simulated processing error');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Test event captured',
      data: body,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        test_type: 'custom_post',
        component: 'test-endpoint',
      },
    });
    
    return errorResponse('PROCESSING_ERROR', 'Test processing failed', null, 500);
  }
}
