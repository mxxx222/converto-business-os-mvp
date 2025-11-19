// Enhanced API Client for DocFlow Admin Dashboard
// Production-ready with real-time data, JWT authentication, and comprehensive error handling

import { toast } from 'sonner'

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
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    this.loadTokens()
  }

  // Token management
  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('docflow_admin_token')
      this.refreshToken = localStorage.getItem('docflow_refresh_token')
    }
  }

  private saveTokens(token: string, refreshToken: string): void {
    this.token = token
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('docflow_admin_token', token)
      localStorage.setItem('docflow_refresh_token', refreshToken)
    }
  }

  clearTokens(): void {
    this.token = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('docflow_admin_token')
      localStorage.removeItem('docflow_refresh_token')
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data: AuthResponse = await response.json()
      this.saveTokens(data.access_token, data.refresh_token)
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.request('/auth/logout', { method: 'POST' })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
    }
  }

  async refreshAuthToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve)
      })
    }

    this.isRefreshing = true

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data: { access_token: string } = await response.json()
      this.token = data.access_token
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('docflow_admin_token', data.access_token)
      }

      // Notify all subscribers
      this.refreshSubscribers.forEach(subscriber => subscriber(data.access_token))
      this.refreshSubscribers = []

      return data.access_token
    } catch (error) {
      this.clearTokens()
      throw error
    } finally {
      this.isRefreshing = false
    }
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

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    let response = await fetch(url, {
      ...options,
      headers
    })

    // Handle token expiration
    if (response.status === 401 && this.refreshToken) {
      try {
        const newToken = await this.refreshAuthToken()
        headers['Authorization'] = `Bearer ${newToken}`
        
        // Retry the original request with new token
        response = await fetch(url, {
          ...options,
          headers
        })
      } catch (refreshError) {
        this.clearTokens()
        window.location.href = '/login'
        throw new Error('Authentication required')
      }
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