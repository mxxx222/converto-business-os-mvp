'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  ClockIcon,
  FileTextIcon,
  RefreshCwIcon,
  CheckCircleIcon
} from 'lucide-react'
import { api, queryKeys } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function LiveMetricsCards() {
  const { 
    data: metrics, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: () => api.getDashboardMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  })

  const { 
    data: systemStatus, 
    isLoading: statusLoading 
  } = useQuery({
    queryKey: queryKeys.dashboard.systemStatus,
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success('Metrics refreshed')
    } catch (error) {
      toast.error('Failed to refresh metrics')
    }
  }

  if (isLoading || statusLoading) {
    return <MetricsSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Failed to load metrics</h3>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const metricsConfig = [
    {
      title: "Documents Today",
      value: metrics?.documentsToday || 0,
      change: metrics?.documentsGrowth || 0,
      icon: FileTextIcon,
      format: 'number',
      description: "Documents processed today"
    },
    {
      title: "Success Rate", 
      value: metrics?.successRate || 0,
      change: metrics?.successRateChange || 0,
      icon: CheckCircleIcon,
      format: 'percentage',
      description: "OCR processing success rate"
    },
    {
      title: "Active Customers",
      value: metrics?.activeCustomers || 0,
      change: metrics?.customersChange || 0,
      icon: UsersIcon,
      format: 'number',
      description: "Active customer accounts"
    },
    {
      title: "Monthly Revenue",
      value: metrics?.monthlyRevenue || 0,
      change: metrics?.revenueChange || 0,
      icon: TrendingUpIcon,
      format: 'currency',
      description: "Current monthly recurring revenue"
    },
    {
      title: "Avg Processing Time",
      value: metrics?.avgProcessingTime || 0,
      change: metrics?.processingTimeChange || 0,
      icon: ClockIcon,
      format: 'time',
      description: "Average document processing time"
    },
    {
      title: "Queue Size",
      value: metrics?.queueSize || 0,
      change: 0,
      icon: RefreshCwIcon,
      format: 'number',
      description: "Documents waiting in queue"
    }
  ]

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'currency':
        return `€${value.toLocaleString()}`
      case 'time':
        return `${value.toFixed(1)}s`
      default:
        return value.toLocaleString()
    }
  }

  const formatChange = (change: number, format: string) => {
    const prefix = change > 0 ? '+' : ''
    const absChange = Math.abs(change)
    
    switch (format) {
      case 'percentage':
        return `${prefix}${absChange.toFixed(1)}%`
      case 'currency':
        return `${prefix}€${absChange.toLocaleString()}`
      case 'time':
        return `${prefix}${absChange.toFixed(1)}s`
      default:
        return `${prefix}${absChange}`
    }
  }

  const getChangeColor = (change: number, metric: string) => {
    if (metric === 'Avg Processing Time' || metric === 'Queue Size') {
      return change < 0 ? 'text-green-600' : 'text-red-600'
    }
    return change > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getSystemStatusBadge = () => {
    if (!systemStatus) return null
    
    const isHealthy = systemStatus.cpuUsage < 80 && 
                     systemStatus.memoryUsage < 85 && 
                     systemStatus.uptimeHours > 0
    
    return (
      <Badge variant={isHealthy ? 'success' : 'destructive'} className="ml-2">
        {isHealthy ? 'Healthy' : 'Degraded'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with system status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <div className="flex items-center mt-1">
            <p className="text-sm text-gray-600">
              Real-time system metrics
            </p>
            {getSystemStatusBadge()}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {systemStatus && (
            <div className="text-sm text-gray-500">
              Uptime: {systemStatus.uptimeHours.toFixed(1)}h
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricsConfig.map((metric) => {
          const isPositive = metric.change > 0
          const changeColor = getChangeColor(metric.change, metric.title)
          const Icon = metric.icon
          const showChange = metric.title !== 'Queue Size' // Don't show change for queue

          return (
            <Card 
              key={metric.title} 
              className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(metric.value, metric.format)}
                </div>
                {showChange && (
                  <div className={`text-xs ${changeColor} flex items-center mt-1`}>
                    {isPositive ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {formatChange(metric.change, metric.format)} from last month
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* System Status Details */}
      {systemStatus && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">CPU Usage:</span>
              <span className={`ml-2 ${
                systemStatus.cpuUsage > 80 ? 'text-red-600' : 
                systemStatus.cpuUsage > 60 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {systemStatus.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Memory Usage:</span>
              <span className={`ml-2 ${
                systemStatus.memoryUsage > 85 ? 'text-red-600' : 
                systemStatus.memoryUsage > 70 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {systemStatus.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Connections:</span>
              <span className="ml-2 text-foreground">
                {systemStatus.activeConnections}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Queue Size:</span>
              <span className={`ml-2 ${
                systemStatus.queueSize > 50 ? 'text-red-600' : 
                systemStatus.queueSize > 20 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {systemStatus.queueSize}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-36 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}