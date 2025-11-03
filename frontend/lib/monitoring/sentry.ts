import * as Sentry from '@sentry/nextjs';

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  message: string,
  category: string = 'user-action',
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
}

/**
 * Track API calls
 */
export function trackApiCall(method: string, endpoint: string, duration: number, status: number) {
  addBreadcrumb(
    `${method} ${endpoint} - ${status} (${duration}ms)`,
    'api',
    status >= 400 ? 'error' : 'info'
  );
}

/**
 * Track user actions
 */
export function trackUserAction(action: string, details?: Record<string, any>) {
  addBreadcrumb(
    `${action}${details ? ': ' + JSON.stringify(details) : ''}`,
    'user-action',
    'info'
  );
}
