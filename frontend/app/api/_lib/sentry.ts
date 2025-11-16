/**
 * Sentry Error Capture for API Routes
 * Provides consistent error handling and reporting
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';
import { AuthUser } from './auth';

/**
 * Capture API route error with context
 */
export function captureAPIError(
  error: Error | unknown,
  request: NextRequest,
  user?: AuthUser | null,
  extra?: Record<string, any>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  Sentry.captureException(error, {
    level: 'error',
    tags: {
      component: 'api-route',
      method: request.method,
      path: new URL(request.url).pathname,
      tenant_id: user?.tenant_id,
      user_role: user?.role,
    },
    extra: {
      url: request.url,
      method: request.method,
      headers: scrubHeaders(request.headers),
      user_id: user?.id,
      ...extra,
    },
    user: user ? {
      id: user.id,
      tenant_id: user.tenant_id,
    } : undefined,
  });
}

/**
 * Scrub sensitive headers before sending to Sentry
 */
function scrubHeaders(headers: Headers): Record<string, string> {
  const scrubbed: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

  headers.forEach((value, key) => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      scrubbed[key] = '[REDACTED]';
    } else {
      scrubbed[key] = value;
    }
  });

  return scrubbed;
}

/**
 * Capture performance metric
 */
export function capturePerformance(
  operation: string,
  duration: number,
  user?: AuthUser | null,
  extra?: Record<string, any>
) {
  if (duration > 1000) { // Only capture slow operations (>1s)
    Sentry.captureMessage(`Slow operation: ${operation}`, {
      level: 'warning',
      tags: {
        component: 'api-performance',
        operation,
        tenant_id: user?.tenant_id,
      },
      extra: {
        duration_ms: duration,
        ...extra,
      },
    });
  }
}

/**
 * Measure API route execution time
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  user?: AuthUser | null
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - start;
    
    capturePerformance(operation, duration, user);
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    Sentry.captureException(error, {
      tags: {
        component: 'api-performance',
        operation,
        tenant_id: user?.tenant_id,
      },
      extra: {
        duration_ms: duration,
        failed: true,
      },
    });
    
    throw error;
  }
}

/**
 * Set breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture business event (non-error)
 */
export function captureEvent(
  message: string,
  level: 'info' | 'warning' | 'error',
  user?: AuthUser | null,
  extra?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    tags: {
      component: 'api-event',
      tenant_id: user?.tenant_id,
      user_role: user?.role,
    },
    extra,
    user: user ? {
      id: user.id,
      tenant_id: user.tenant_id,
    } : undefined,
  });
}

