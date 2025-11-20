// Enhanced API Client for DocFlow Admin Dashboard
// Production-ready with real-time data, JWT authentication, and comprehensive error handling

import { toast } from 'sonner'
import { supabase } from './supabase'

// Type definitions for API responses
export interface DashboardMetrics {
  documentsToday: number
  documentsGrowth: number
  successRate: number
  successRateChange: number
  activeCustomers: number
  customersChange: number
  monthlyRevenue: number
  revenueChange: number
  avgProcessingTime: number
  processingTimeChange: number
  queueSize: number
  systemUptime: number
}

export interface Document {
  id: string
  filename: string
  customerId: string
  customerName: string
  uploadedAt: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  ocrConfidence?: number
  processingTime?: number
  fileSize: number
  fileType: string
  extractedData?: {
    amount?: number
    currency?: string
    date?: string
    merchant?: string
    vatNumber?: string
  }
}

export interface DocumentsResponse {
  data: Document[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DocumentFilters {
  status?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface Customer {
  id: string
  companyName: string
  email: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trial' | 'suspended' | 'churned'
  joinedAt: string
  lastActivity: string
  documentsCount: number
  monthlyRevenue: number
  billingCycle: 'monthly' | 'annual'
  stripeCustomerId?: string
}

export interface AnalyticsData {
  processingVolume: TimeSeriesData[]
  revenueGrowth: TimeSeriesData[]
  customerGrowth: TimeSeriesData[]
  systemPerformance: {
    avgResponseTime: number
    uptime: number
    errorRate: number
  }
  topCustomers: CustomerMetric[]
  popularFileTypes: FileTypeMetric[]
}

export interface TimeSeriesData {
  date: string
  value: number
}

export interface CustomerMetric {
  customerId: string
  companyName: string
  documentsProcessed: number
  revenue: number
}

export interface FileTypeMetric {
  fileType: string
  count: number
  percentage: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SystemStatus {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  uptimeHours: number
  activeConnections: number
  queueSize: number
  lastError?: string
}

export interface ApiError {
  message: string
  code: string
  details?: any
}

// Enhanced API Client
class DocFlowAPI {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  // Token management using Supabase session
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No authentication token available. Please log in.')
    }
    return session.access_token
  }

  clearTokens(): void {
    // Tokens are managed by Supabase, no manual clearing needed
    // This method is kept for backward compatibility
  }

  // Authentication - handled by Supabase, kept for backward compatibility
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Login is now handled directly via Supabase in login page
    // This method is kept for backward compatibility but should not be used
    throw new Error('Please use Supabase auth.signInWithPassword() directly')
  }

  async logout(): Promise<void> {
    // Logout is handled by Supabase auth.signOut()
    // This method is kept for backward compatibility
    await supabase.auth.signOut()
  }

  async refreshAuthToken(): Promise<string> {
    // Token refresh is handled automatically by Supabase
    // This method is kept for backward compatibility
    return await this.getAuthToken()
  }

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request('/admin/metrics')
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.request('/admin/system-status')
  }

  // Document endpoints
  async getDocuments(params?: DocumentFilters): Promise<DocumentsResponse> {
    const query = params ? `?${new URLSearchParams(params as any)}` : ''
    return this.request(`/admin/documents${query}`)
  }

  async getDocument(id: string): Promise<Document> {
    return this.request(`/admin/documents/${id}`)
  }

  async reprocessDocument(id: string): Promise<void> {
    return this.request(`/admin/documents/${id}/reprocess`, { method: 'POST' })
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request(`/admin/documents/${id}`, { method: 'DELETE' })
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await this.fetchWithAuth(`${this.baseURL}/admin/documents/${id}/download`)
    
    if (!response.ok) {
      throw new Error('Download failed')
    }

    return response.blob()
  }

  // Customer endpoints
  async getCustomers(): Promise<Customer[]> {
    return this.request('/admin/customers')
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request(`/admin/customers/${id}`)
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    return this.request(`/admin/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    return this.request('/admin/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    })
  }

  // Analytics endpoints
  async getAnalytics(timeRange: string = '30d'): Promise<AnalyticsData> {
    return this.request(`/admin/analytics?range=${timeRange}`)
  }

  async getRevenueAnalytics(timeRange: string = '30d'): Promise<TimeSeriesData[]> {
    return this.request(`/admin/analytics/revenue?range=${timeRange}`)
  }

  // System endpoints
  async getLogs(level?: string, limit: number = 100): Promise<any[]> {
    const query = level ? `?level=${level}&limit=${limit}` : `?limit=${limit}`
    return this.request(`/admin/logs${query}`)
  }

  async clearQueue(): Promise<void> {
    return this.request('/admin/queue/clear', { method: 'POST' })
  }

  async restartService(service: string): Promise<void> {
    return this.request(`/admin/services/${service}/restart`, { method: 'POST' })
  }

  // Real-time events (Server-Sent Events)
  subscribeToEvents(callback: (event: any) => void): EventSource {
    const eventSource = new EventSource(`${this.baseURL}/admin/events`, {
      withCredentials: true
    })

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Error parsing event data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
    }

    return eventSource
  }

  // Core request handler with automatic token refresh
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Get token from Supabase session
    try {
      const token = await this.getAuthToken()
      headers['Authorization'] = `Bearer ${token}`
    } catch (error) {
      // If no token, continue without auth header (will fail with 401)
      console.warn('No auth token available for request')
    }

    let response = await fetch(url, {
      ...options,
      headers
    })

    // Handle token expiration - Supabase handles refresh automatically
    // But if we get 401, redirect to login
    if (response.status === 401) {
      // Supabase will handle token refresh automatically
      // If still 401 after refresh, user needs to re-authenticate
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Authentication required')
    }

    return response
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, options)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      
      if (error instanceof Error) {
        // Show user-friendly error messages
        if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          toast.error('Network error: Unable to connect to server')
        } else if (error.message.includes('401')) {
          toast.error('Session expired. Please log in again.')
          this.clearTokens()
          window.location.href = '/login'
        } else {
          toast.error(`Operation failed: ${error.message}`)
        }
      }
      
      throw error
    }
  }
}

// Export singleton instance
export const api = new DocFlowAPI()

// React Query hooks (optional, for convenience)
export const queryKeys = {
  dashboard: {
    metrics: ['dashboard', 'metrics'],
    systemStatus: ['dashboard', 'system-status']
  },
  documents: {
    all: ['documents'],
    list: (filters?: DocumentFilters) => ['documents', 'list', filters],
    detail: (id: string) => ['documents', 'detail', id]
  },
  customers: {
    all: ['customers'],
    detail: (id: string) => ['customers', 'detail', id]
  },
  analytics: {
    all: ['analytics'],
    revenue: (range: string) => ['analytics', 'revenue', range]
  }
}