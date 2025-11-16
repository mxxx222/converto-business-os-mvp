/**
 * Standardized API Response Helpers
 * Provides consistent response formats across all API routes
 */

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Standard API response format
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    request_id?: string;
    [key: string]: any;
  };
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>,
  status: number = 200
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Handle API errors consistently
 */
export function handleAPIError(error: Error | unknown): NextResponse<APIResponse> {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Map common errors to HTTP status codes
  if (errorMessage.includes('Unauthorized')) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', null, 401);
  }

  if (errorMessage.includes('Forbidden')) {
    return errorResponse('FORBIDDEN', 'Insufficient permissions', null, 403);
  }

  if (errorMessage.includes('Not found') || errorMessage.includes('not found')) {
    return errorResponse('NOT_FOUND', 'Resource not found', null, 404);
  }

  if (errorMessage.includes('Validation') || errorMessage.includes('Invalid')) {
    return errorResponse('VALIDATION_ERROR', errorMessage, null, 422);
  }

  if (errorMessage.includes('Rate limit')) {
    return errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429);
  }

  // Capture unexpected errors in Sentry
  Sentry.captureException(error, {
    tags: { component: 'api-error-handler' },
  });

  // Generic server error
  return errorResponse(
    'INTERNAL_ERROR',
    'An internal error occurred',
    process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    500
  );
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
  status: number = 200
): NextResponse<APIResponse<PaginatedResponse<T>>> {
  return successResponse(
    {
      data,
      pagination: {
        total,
        limit,
        offset,
        has_more: total > offset + limit,
      },
    },
    undefined,
    status
  );
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse<APIResponse<T>> {
  return successResponse(data, meta, 201);
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Accepted response (202) - for async operations
 */
export function acceptedResponse(
  message: string,
  jobId?: string
): NextResponse<APIResponse> {
  return successResponse(
    {
      message,
      job_id: jobId,
    },
    undefined,
    202
  );
}

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export function validationErrorResponse(
  errors: ValidationError[]
): NextResponse<APIResponse> {
  return errorResponse(
    'VALIDATION_ERROR',
    'Validation failed',
    { errors },
    422
  );
}

/**
 * Rate limit error response
 */
export function rateLimitResponse(
  retryAfter?: number
): NextResponse<APIResponse> {
  const response = errorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests. Please try again later.',
    { retry_after: retryAfter },
    429
  );

  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter));
  }

  return response;
}

/**
 * CORS headers for API responses
 */
export function withCORS(
  response: NextResponse,
  allowedOrigins: string[] = ['https://docflow.fi', 'https://www.docflow.fi']
): NextResponse {
  const origin = response.headers.get('origin');

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
  }

  return response;
}

