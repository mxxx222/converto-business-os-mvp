/** @fileoverview Authenticated fetch hook for admin API calls */

'use client';

export interface AuthedFetchOptions extends RequestInit {
  timeout?: number;
}

export function useAuthedFetch(adminToken: string, baseUrl?: string) {
  const apiBase = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return async function authedFetch(endpoint: string, options: AuthedFetchOptions = {}) {
    const { timeout = 10000, ...init } = options;
    
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${adminToken}`);
    
    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        ...init,
        headers,
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      // Try to parse JSON, but handle non-JSON responses
      let json: any = {};
      try {
        const text = await response.text();
        json = text ? JSON.parse(text) : {};
      } catch {
        // If not JSON, use the text as a simple response
        json = { data: await response.text(), status: response.status };
      }

      if (!response.ok) {
        const error = new Error(json?.error || `HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).response = response;
        (error as any).data = json;
        throw error;
      }

      return json;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };
}