'use client'

import { useState, useEffect } from 'react'

interface APIEndpoint {
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: string
  description: string
}

interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  lastCheck: string
  details: string
}

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  service: string
  message: string
  timestamp: string
  resolved: boolean
}

const mockEndpoints: APIEndpoint[] = [
  {
    name: 'Document Upload',
    path: '/api/documents/upload',
    method: 'POST',
    status: 'healthy',
    uptime: 99.98,
    responseTime: 245,
    errorRate: 0.02,
    lastCheck: '2025-11-11T03:25:00Z',
    description: 'Handle document uploads and initial processing'
  },
  {
    name: 'OCR Processing',
    path: '/api/ocr/process',
    method: 'POST',
    status: 'degraded',
    uptime: 97.5,
    responseTime: 1240,
    errorRate: 2.1,
    lastCheck: '2025-11-11T03:25:00Z',
    description: 'OCR text extraction from uploaded documents'
  },
  {
    name: 'Customer Management',
    path: '/api/customers',
    method: 'GET',
    status: 'healthy',
    uptime: 99.95,
    responseTime: 156,
    errorRate: 0.01,
    lastCheck: '2025-11-11T03:25:00Z',
    description: 'Customer CRUD operations'
  },
  {
    name: 'Analytics Data',
    path: '/api/analytics',
    method: 'GET',
    status: 'healthy',
    uptime: 99.92,
    responseTime: 89,
    errorRate: 0.03,
    lastCheck: '2025-11-11T03:25:00Z',
    description: 'Analytics and reporting data endpoints'
  },
  {
    name: 'Billing System',
    path: '/api/billing',
    method: 'POST',
    status: 'down',
    uptime: 85.2,
    responseTime: 0,
    errorRate: 14.8,
    lastCheck: '2025-11-11T03:25:00Z',
    description: 'Payment processing and invoice generation'
  }
]

const mockServices: ServiceHealth[] = [
  {
    name: 'WebSocket Server',
    status: 'healthy',
    uptime: 99.99,
    lastCheck: '2025-11-11T03:25:00Z',
    details: 'Real-time connections stable'
  },
  {
    name: 'OCR Service',
    status: 'degraded',
    uptime: 97.8,
    lastCheck: '2025-11-11T03:25:00Z',
    details: 'Higher than normal response times'
  },
  {
    name: 'Database',
    status: 'healthy',
    uptime: 99.97,
    lastCheck: '2025-11-11T03:25:00Z',
    details: 'All queries performing normally'
  },
  {
    name: 'File Storage',
    status: 'healthy',
    uptime: 99.95,
    lastCheck: '2025-11-11T03:25:00Z',
    details: 'Upload/download operations normal'
  },
  {
    name: 'Email Service',
    status: 'down',
    uptime: 0,
    lastCheck: '2025-11-11T03:25:00Z',
    details: 'Service completely unavailable'
  }
]

const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    type: 'error',
    service: 'Billing System',
    message: 'Payment processing completely down',
    timestamp: '2025-11-11T03:20:00Z',
    resolved: false
  },
  {
    id: 'alert_002',
    type: 'warning',
    service: 'OCR Service',
    message: 'Response time above 1 second threshold',
    timestamp: '2025-11-11T03:15:00Z',
    resolved: false
  },
  {
    id: 'alert_003',
    type: 'info',
    service: 'Email Service',
    message: 'Service maintenance completed',
    timestamp: '2025-11-11T02:45:00Z',
    resolved: true
  }
]

export default function APIMonitoring() {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>(mockEndpoints)
  const [services, setServices] = useState<ServiceHealth[]>(mockServices)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'services' | 'alerts'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setEndpoints(prev => prev.map(endpoint => ({
        ...endpoint,
        responseTime: Math.max(50, endpoint.responseTime + (Math.random() - 0.5) * 50),
        errorRate: Math.max(0, Math.min(100, endpoint.errorRate + (Math.random() - 0.5) * 2)),
        lastCheck: new Date().toISOString()
      })))

      setServices(prev => prev.map(service => ({
        ...service,
        uptime: Math.max(80, Math.min(100, service.uptime + (Math.random() - 0.5) * 0.5)),
        lastCheck: new Date().toISOString()
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      healthy: 'badge-success',
      degraded: 'badge-warning',
      down: 'badge-destructive'
    }
    return <span className={`badge ${styles[status as keyof typeof styles]}`}>{status}</span>
  }

  const getAlertBadge = (type: Alert['type']) => {
    const styles = {
      error: 'badge-destructive',
      warning: 'badge-warning',
      info: 'badge-secondary'
    }
    return <span className={`badge ${styles[type]}`}>{type}</span>
  }

  const averageUptime = services.reduce((sum, service) => sum + service.uptime, 0) / services.length
  const averageResponseTime = endpoints.reduce((sum, ep) => sum + ep.responseTime, 0) / endpoints.length
  const totalErrors = alerts.filter(alert => !alert.resolved && alert.type === 'error').length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium">API Monitoring</h3>
          <p className="text-sm text-gray-500">
            System health and performance monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh</span>
          </label>
          
          <button className="btn btn-outline text-sm">
            Run Health Check
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === 'overview' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === 'endpoints' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Endpoints
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === 'services' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === 'alerts' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Alerts ({alerts.filter(a => !a.resolved).length})
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className={`metric-value ${getStatusColor(averageUptime >= 99 ? 'text-green-600' : 'text-yellow-600')}`}>
                {averageUptime.toFixed(2)}%
              </div>
              <div className="metric-label">System Uptime</div>
              <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value text-blue-600">{Math.round(averageResponseTime)}ms</div>
              <div className="metric-label">Avg Response Time</div>
              <div className="text-xs text-gray-500 mt-1">All endpoints</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value text-red-600">{totalErrors}</div>
              <div className="metric-label">Active Errors</div>
              <div className="text-xs text-gray-500 mt-1">Requiring attention</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value text-green-600">{endpoints.filter(ep => ep.status === 'healthy').length}</div>
              <div className="metric-label">Healthy Endpoints</div>
              <div className="text-xs text-gray-500 mt-1">Out of {endpoints.length}</div>
            </div>
          </div>

          {/* Service Status Grid */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium mb-4">Service Health Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{service.name}</h5>
                    {getStatusBadge(service.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Uptime: {service.uptime.toFixed(2)}%</div>
                    <div>Last Check: {new Date(service.lastCheck).toLocaleTimeString('fi-FI')}</div>
                    <div className="text-xs">{service.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium mb-4">Recent Alerts</h4>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getAlertBadge(alert.type)}
                      <span className="font-medium">{alert.service}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString('fi-FI')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{alert.message}</div>
                  {alert.resolved && (
                    <div className="text-xs text-green-600 mt-1">✓ Resolved</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <h4 className="font-medium">{endpoint.name}</h4>
                  <code className="text-sm text-gray-600">{endpoint.path}</code>
                </div>
                {getStatusBadge(endpoint.status)}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">{endpoint.description}</div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Response Time</div>
                  <div className="font-medium">{Math.round(endpoint.responseTime)}ms</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Uptime</div>
                  <div className={`font-medium ${getStatusColor(endpoint.uptime >= 99 ? 'text-green-600' : 'text-yellow-600')}`}>
                    {endpoint.uptime.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Error Rate</div>
                  <div className={`font-medium ${endpoint.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                    {endpoint.errorRate.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Last Check</div>
                  <div className="text-sm">{new Date(endpoint.lastCheck).toLocaleTimeString('fi-FI')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.name} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">{service.name}</h4>
                {getStatusBadge(service.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Uptime</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          service.uptime >= 99 ? 'bg-green-500' : 
                          service.uptime >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${service.uptime}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{service.uptime.toFixed(2)}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Last Health Check</div>
                  <div className="text-sm">{new Date(service.lastCheck).toLocaleString('fi-FI')}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Status Details</div>
                  <div className="text-sm text-gray-700">{service.details}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No alerts
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${
                alert.resolved ? 'bg-gray-50 border-gray-200' : 
                alert.type === 'error' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAlertBadge(alert.type)}
                    <h4 className="font-medium">{alert.service}</h4>
                    {alert.resolved && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Resolved
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString('fi-FI')}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mt-2">{alert.message}</div>
                {!alert.resolved && (
                  <div className="mt-3 flex space-x-2">
                    <button className="btn btn-primary text-xs">
                      Acknowledge
                    </button>
                    <button className="btn btn-outline text-xs">
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}