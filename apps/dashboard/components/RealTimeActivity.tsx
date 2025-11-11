'use client'

import { useState, useEffect } from 'react'

interface Activity {
  id: string
  type: 'document_processed' | 'ocr_completed' | 'error' | 'customer_added' | 'payment_received'
  message: string
  timestamp: string
  metadata: {
    documentId?: string
    customerName?: string
    amount?: number
    errorMessage?: string
  }
  severity: 'info' | 'warning' | 'error' | 'success'
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'document_processed',
    message: 'Invoice from Acme Corp processed successfully',
    timestamp: '2 minutes ago',
    metadata: { documentId: 'doc_123', customerName: 'Acme Corp' },
    severity: 'success'
  },
  {
    id: '2',
    type: 'ocr_completed',
    message: 'OCR processing completed for receipt #456',
    timestamp: '5 minutes ago',
    metadata: { documentId: 'doc_456' },
    severity: 'info'
  },
  {
    id: '3',
    type: 'error',
    message: 'OCR failed for document - low quality image',
    timestamp: '8 minutes ago',
    metadata: { documentId: 'doc_789', errorMessage: 'Image quality too low' },
    severity: 'error'
  },
  {
    id: '4',
    type: 'customer_added',
    message: 'New customer registered: Tech Solutions Oy',
    timestamp: '12 minutes ago',
    metadata: { customerName: 'Tech Solutions Oy' },
    severity: 'success'
  },
  {
    id: '5',
    type: 'payment_received',
    message: 'Monthly subscription payment received',
    timestamp: '15 minutes ago',
    metadata: { amount: 299 },
    severity: 'success'
  }
]

export default function RealTimeActivity() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true)
    
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // In real implementation, this would be WebSocket data
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'document_processed',
        message: 'New document processed automatically',
        timestamp: 'Just now',
        metadata: { documentId: `doc_${Date.now()}` },
        severity: 'info'
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]) // Keep last 20 activities
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'document_processed':
        return '📄'
      case 'ocr_completed':
        return '🔍'
      case 'error':
        return '❌'
      case 'customer_added':
        return '👤'
      case 'payment_received':
        return '💳'
      default:
        return '📋'
    }
  }

  const getSeverityColor = (severity: Activity['severity']) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const filterActivities = (type?: Activity['type']) => {
    if (!type) return activities
    return activities.filter(activity => activity.type === type)
  }

  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all')

  const filteredActivities = filterActivities(filter === 'all' ? undefined : filter)

  return (
    <div className="p-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`status-indicator ${isConnected ? 'status-online' : 'status-offline'}`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
          <span className="text-xs text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString('fi-FI')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Activity['type'] | 'all')}
            className="input text-sm"
          >
            <option value="all">All Activities</option>
            <option value="document_processed">Documents</option>
            <option value="ocr_completed">OCR</option>
            <option value="error">Errors</option>
            <option value="customer_added">Customers</option>
            <option value="payment_received">Payments</option>
          </select>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activities to display
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-600">{activity.message}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(activity.severity)}`}>
                    {activity.severity}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {activity.timestamp}
                  {activity.metadata.documentId && (
                    <span className="ml-2">• Document: {activity.metadata.documentId}</span>
                  )}
                  {activity.metadata.customerName && (
                    <span className="ml-2">• Customer: {activity.metadata.customerName}</span>
                  )}
                  {activity.metadata.amount && (
                    <span className="ml-2">• Amount: €{activity.metadata.amount}</span>
                  )}
                  {activity.metadata.errorMessage && (
                    <span className="ml-2 text-red-600">• Error: {activity.metadata.errorMessage}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connection Stats */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">247</div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">1,523</div>
            <div className="text-xs text-gray-500">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">89%</div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">12</div>
            <div className="text-xs text-gray-500">Active Errors</div>
          </div>
        </div>
      </div>
    </div>
  )
}