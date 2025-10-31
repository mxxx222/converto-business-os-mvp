/**
 * API client for Converto Business OS Backend.
 * Handles authentication, error handling, and API calls.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.converto.fi';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token if available (for future use)
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : null;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.message || 'API request failed');
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/health');
  }

  // Finance Agent endpoints
  async getFinanceInsights(userId: string) {
    return this.request(`/api/finance-agent/insights/${userId}`);
  }

  // Receipts endpoints
  async getReceipts() {
    return this.request('/api/receipts');
  }

  // OCR endpoints
  async processReceipt(image: File | Blob) {
    const formData = new FormData();
    formData.append('file', image);
    
    return fetch(`${this.baseUrl}/api/ocr/receipt`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type - browser will set it with boundary
      },
    }).then(res => res.json());
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default for convenience
export default apiClient;

