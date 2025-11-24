/**
 * Rate limiting utilities for API calls
 * Provides 429 responses with Retry-After headers and X-RateLimit headers
 */

export interface RateLimitConfig {
  limit: number; // Maximum requests
  windowMs: number; // Time window in milliseconds
  key?: string; // Optional key for scoping (e.g., tenantId, userId)
}

export interface RateLimitState {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (can be upgraded to Redis in production)
const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Check rate limit and return headers
 */
export function checkRateLimit(
  config: RateLimitConfig,
  identifier: string
): {
  allowed: boolean;
  headers: HeadersInit;
  retryAfter?: number;
} {
  const key = config.key ? `${config.key}:${identifier}` : identifier;
  const now = Date.now();
  
  let state = rateLimitStore.get(key);
  
  // Initialize or reset if window expired
  if (!state || now >= state.resetAt) {
    state = {
      count: 0,
      resetAt: now + config.windowMs
    };
  }
  
  // Increment count
  state.count++;
  rateLimitStore.set(key, state);
  
  const remaining = Math.max(0, config.limit - state.count);
  const retryAfter = state.count > config.limit 
    ? Math.ceil((state.resetAt - now) / 1000)
    : undefined;
  
  const headers: HeadersInit = {
    'X-RateLimit-Limit': config.limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(state.resetAt).toISOString()
  };
  
  if (retryAfter !== undefined) {
    headers['Retry-After'] = retryAfter.toString();
  }
  
  return {
    allowed: state.count <= config.limit,
    headers,
    retryAfter
  };
}

/**
 * Create 429 Too Many Requests response
 */
export function createRateLimitResponse(
  retryAfter: number,
  headers?: HeadersInit
): Response {
  const responseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Retry-After': retryAfter.toString(),
    ...headers
  };
  
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
      retryAfter
    }),
    {
      status: 429,
      headers: responseHeaders
    }
  );
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    // Extract identifier from request (IP, user ID, tenant ID, etc.)
    const identifier = 
      request.headers.get('X-User-ID') ||
      request.headers.get('X-Tenant-ID') ||
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For')?.split(',')[0] ||
      'anonymous';
    
    const { allowed, headers, retryAfter } = checkRateLimit(config, identifier);
    
    if (!allowed && retryAfter !== undefined) {
      return createRateLimitResponse(retryAfter, headers);
    }
    
    // Call handler and add rate limit headers to response
    const response = await handler(request);
    
    // Add rate limit headers to response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  };
}

/**
 * Default rate limit configs
 */
export const DEFAULT_RATE_LIMITS = {
  // 60 requests per minute per tenant
  tenant: {
    limit: 60,
    windowMs: 60 * 1000,
    key: 'tenant'
  },
  // 10 requests per second per user
  user: {
    limit: 10,
    windowMs: 1000,
    key: 'user'
  },
  // 100 requests per minute per IP
  ip: {
    limit: 100,
    windowMs: 60 * 1000,
    key: 'ip'
  }
};

/**
 * Cleanup expired rate limit entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, state] of rateLimitStore.entries()) {
    if (now >= state.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

