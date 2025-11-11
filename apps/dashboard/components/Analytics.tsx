'use client'

import { useState, useEffect } from 'react'

interface KPIData {
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface ChartData {
  date: string
  value: number
  label: string
}

const mockKPIData = {
  documentsProcessed: { value: 2847, change: 12.5, trend: 'up' as const },
  revenue: { value: 12840, change: 8.3, trend: 'up' as const },
  customers: { value: 124, change: 3.2, trend: 'up' as const },
  avgProcessingTime: { value: 2.3, change: -15.2, trend: 'up' as const }, // Lower is better
  successRate: { value: 96.8, change: 1.8, trend: 'up' as const },
  activeErrors: { value: 12, change: -23.1, trend: 'up' as const }
}

const mockChartData: ChartData[] = [
  { date: '2025-11-01', value: 142, label: 'Documents' },
  { date: '2025-11-02', value: 156, label: 'Documents' },
  { date: '2025-11-03', value: 189, label: 'Documents' },
  { date: '2025-11-04', value: 203, label: 'Documents' },
  { date: '2025-11-05', value: 167, label: 'Documents' },
  { date: '2025-11-06', value: 145, label: 'Documents' },
  { date: '2025-11-07', value: 178, label: 'Documents' },
  { date: '2025-11-08', value: 234, label: 'Documents' },
  { date: '2025-11-09', value: 256, label: 'Documents' },
  { date: '2025-11-10', value: 198, label: 'Documents' },
  { date: '2025-11-11', value: 167, label: 'Documents' }
]

const revenueData: ChartData[] = [
  { date: '2025-10-01', value: 15840, label: 'Revenue (€)' },
  { date: '2025-10-08', value: 16240, label: 'Revenue (€)' },
  { date: '2025-10-15', value: 15980, label: 'Revenue (€)' },
  { date: '2025-10-22', value: 17120, label: 'Revenue (€)' },
  { date: '2025-10-29', value: 16890, label: 'Revenue (€)' },
  { date: '2025-11-05', value: 17450, label: 'Revenue (€)' },
  { date: '2025-11-11', value: 18240, label: 'Revenue (€)' }
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [chartType, setChartType] = useState<'documents' | 'revenue' | 'errors'>('documents')

  const currentData = chartType === 'documents' ? mockChartData : 
                     chartType === 'revenue' ? revenueData : 
                     mockChartData.map(d => ({ ...d, value: Math.floor(Math.random() * 20) + 5, label: 'Errors' }))

  const handleExport = () => {
    if (exportFormat === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Value', 'Type']
      const rows = currentData.map(item => [item.date, item.value, item.label])
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${chartType}-${timeRange}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // For PDF export, in real implementation this would call a server endpoint
      alert('PDF export would be generated server-side')
    }
  }

  const formatValue = (value: number, type: string) => {
    if (type === 'revenue') return `€${value.toLocaleString()}`
    if (type === 'time') return `${value}s`
    if (type === 'percentage') return `${value}%`
    return value.toLocaleString()
  }

  const renderMiniChart = (data: ChartData[]) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const range = maxValue - minValue

    return (
      <div className="flex items-end space-x-1 h-16">
        {data.map((item, index) => {
          const height = range === 0 ? 10 : ((item.value - minValue) / range) * 40 + 10
          const color = item.value > data.reduce((avg, d) => avg + d.value, 0) / data.length ? 'bg-green-500' : 'bg-blue-500'
          
          return (
            <div
              key={index}
              className={`${color} rounded-t`}
              style={{ width: '8px', height: `${height}px` }}
              title={`${item.date}: ${item.value}`}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium">Analytics & Reporting</h3>
          <p className="text-sm text-gray-500">
            Key metrics and performance insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="input text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
            className="input text-sm"
          >
            <option value="csv">Export CSV</option>
            <option value="pdf">Export PDF</option>
          </select>
          
          <button
            onClick={handleExport}
            className="btn btn-primary text-sm"
          >
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="metric-card">
          <div className="metric-value">{mockKPIData.documentsProcessed.value.toLocaleString()}</div>
          <div className="metric-label">Documents Processed</div>
          <div className={`metric-change metric-change-positive`}>
            ↗ +{mockKPIData.documentsProcessed.change}%
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">€{mockKPIData.revenue.value.toLocaleString()}</div>
          <div className="metric-label">Monthly Revenue</div>
          <div className={`metric-change metric-change-positive`}>
            ↗ +{mockKPIData.revenue.change}%
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{mockKPIData.customers.value}</div>
          <div className="metric-label">Active Customers</div>
          <div className={`metric-change metric-change-positive`}>
            ↗ +{mockKPIData.customers.change}%
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{mockKPIData.avgProcessingTime.value}s</div>
          <div className="metric-label">Avg Processing Time</div>
          <div className={`metric-change metric-change-positive`}>
            ↗ {mockKPIData.avgProcessingTime.change}%
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{mockKPIData.successRate.value}%</div>
          <div className="metric-label">Success Rate</div>
          <div className={`metric-change metric-change-positive`}>
            ↗ +{mockKPIData.successRate.change}%
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{mockKPIData.activeErrors.value}</div>
          <div className="metric-label">Active Errors</div>
          <div className={`metric-change metric-change-positive`}>
            ↗ {mockKPIData.activeErrors.change}%
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">Performance Trends</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('documents')}
              className={`px-3 py-1 text-sm rounded ${
                chartType === 'documents' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setChartType('revenue')}
              className={`px-3 py-1 text-sm rounded ${
                chartType === 'revenue' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartType('errors')}
              className={`px-3 py-1 text-sm rounded ${
                chartType === 'errors' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Errors
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          {renderMiniChart(currentData)}
        </div>
        
        <div className="text-sm text-gray-600">
          {chartType === 'documents' && 'Daily document processing volume over the selected period'}
          {chartType === 'revenue' && 'Monthly recurring revenue growth trend'}
          {chartType === 'errors' && 'Daily error rate monitoring'}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium mb-4">Top Customers by Volume</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Acme Corporation</div>
                <div className="text-sm text-gray-500">Enterprise Plan</div>
              </div>
              <div className="text-right">
                <div className="font-medium">1,247 docs</div>
                <div className="text-sm text-green-600">↗ +15%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Initech</div>
                <div className="text-sm text-gray-500">Professional Plan</div>
              </div>
              <div className="text-right">
                <div className="font-medium">890 docs</div>
                <div className="text-sm text-gray-500">→ 0%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Tech Solutions Oy</div>
                <div className="text-sm text-gray-500">Professional Plan</div>
              </div>
              <div className="text-right">
                <div className="font-medium">423 docs</div>
                <div className="text-sm text-green-600">↗ +8%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Alerts */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium mb-4">Performance Alerts</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <div className="text-sm font-medium text-yellow-800">Processing Time Increase</div>
                <div className="text-xs text-yellow-700">Average processing time up 15% this week</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <div className="text-sm font-medium text-green-800">Success Rate Improved</div>
                <div className="text-xs text-green-700">OCR accuracy improved by 1.8% this month</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600">ℹ️</span>
              <div>
                <div className="text-sm font-medium text-blue-800">New Customer Milestone</div>
                <div className="text-xs text-blue-700">Reached 124 active customers this week</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}