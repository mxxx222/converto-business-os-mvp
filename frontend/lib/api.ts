import { getAuthHeaders } from './auth';

/**
 * Centralized API client for making authenticated requests to the backend.
 * Automatically includes JWT token from Supabase session.
 */

const getApiBaseUrl = (): string => {
  // Check for NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE;
  
  if (apiUrl) {
    // Remove trailing slash
    return apiUrl.replace(/\/$/, '');
  }
  
  // Default to relative paths (same origin)
  return '';
};

export interface ApiCallOptions extends RequestInit {
  /**
   * Skip automatic JWT token inclusion (for public endpoints)
   */
  skipAuth?: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Make an authenticated API call to the backend.
 * 
 * @param endpoint - API endpoint path (e.g., '/api/v1/documents')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with response data
 * @throws ApiError if request fails
 * 
 * @example
 * ```typescript
 * const documents = await apiCall('/api/v1/documents', { method: 'GET' });
 * ```
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...fetchOptions } = options;
  
  // Get base URL
  const baseUrl = getApiBaseUrl();
  
  // Build full URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Get auth headers if not skipped
  const authHeaders = skipAuth ? {} : await getAuthHeaders();
  
  // Merge headers
  const allHeaders = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...headers,
  };
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: allHeaders,
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    if (!response.ok) {
      // Try to parse error response
      let errorData: ApiError;
      if (isJson) {
        errorData = await response.json();
      } else {
        errorData = {
          error: 'HTTP_ERROR',
          message: `Request failed with status ${response.status}: ${response.statusText}`,
        };
      }
      
      throw errorData;
    }
    
    // Return parsed JSON or empty object for non-JSON responses
    if (isJson) {
      return await response.json();
    }
    
    // For non-JSON responses, return text or empty object
    if (contentType?.includes('text/')) {
      return (await response.text()) as unknown as T;
    }
    
    return {} as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error && typeof error === 'object' && 'error' in error) {
      throw error;
    }
    
    // Wrap other errors
    throw {
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network request failed',
    } as ApiError;
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiCallOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, data?: any, options?: Omit<ApiCallOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(endpoint: string, data?: any, options?: Omit<ApiCallOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T = any>(endpoint: string, data?: any, options?: Omit<ApiCallOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(endpoint: string, options?: Omit<ApiCallOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }),
};

