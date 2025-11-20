'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api, queryKeys } from '@/lib/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, UsersIcon, FileTextIcon, ClockIcon } from 'lucide-react'

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899'
}

const STATUS_COLORS = {
  completed: COLORS.success,
  processing: COLORS.primary,
  pending: COLORS.warning,
  error: COLORS.danger
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: queryKeys.analytics.overview(timeRange),
    queryFn: () => api.getAnalyticsOverview(timeRange),
    refetchInterval: 60000 // 1 min
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: queryKeys.analytics.revenue(timeRange),
    queryFn: () => api.getRevenueAnalytics(timeRange),
    refetchInterval: 60000
  })

  const { data: processingData, isLoading: processingLoading } = useQuery({
    queryKey: queryKeys.analytics.processing(timeRange),
    queryFn: () => api.getProcessingAnalytics(timeRange),
    refetchInterval: 60000
  })

  const { data: customerGrowth, isLoading: customerLoading } = useQuery({
    queryKey: queryKeys.analytics.customerGrowth(timeRange),
    queryFn: () => api.getCustomerGrowth(timeRange),
    refetchInterval: 60000
  })

  const { data: statusDistribution, isLoading: statusLoading } = useQuery({
    queryKey: queryKeys.analytics.statusDistribution,
    queryFn: () => api.getStatusDistribution(),
    refetchInterval: 30000
  })

  const formatCurrency = (value: number) => `€${value.toLocaleString('fi-FI')}`
  const formatNumber = (value: number) => value.toLocaleString('fi-FI')
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const MetricCard = ({ title, value, change, icon: Icon, format = 'number' }: any) => {
    const isPositive = change > 0
    const formattedValue = format === 'currency' ? formatCurrency(value) : format === 'percentage' ? formatPercentage(value) : formatNumber(value)
    const formattedChange = format === 'currency' ? formatCurrency(Math.abs(change)) : format === 'percentage' ? formatPercentage(Math.abs(change)) : formatNumber(Math.abs(change))

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedValue}</div>
          <div className={`text-xs flex items-center mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
            {formattedChange} from last period
          </div>
        </CardContent>
      </Card>
    )
  }

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="365d">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={overview?.totalRevenue || 0}
          change={overview?.revenueGrowth || 0}
          icon={TrendingUpIcon}
          format="currency"
        />
        <MetricCard
          title="Documents Processed"
          value={overview?.totalDocuments || 0}
          change={overview?.documentsGrowth || 0}
          icon={FileTextIcon}
          format="number"
        />
        <MetricCard
          title="Success Rate"
          value={overview?.successRate || 0}
          change={overview?.successRateChange || 0}
          icon={ArrowUpIcon}
          format="percentage"
        />
        <MetricCard
          title="Avg Processing Time"
          value={overview?.avgProcessingTime || 0}
          change={overview?.processingTimeChange || 0}
          icon={ClockIcon}
          format="number"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              // @ts-expect-error - Recharts type definition compatibility issue
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="mrr" stroke={COLORS.success} strokeWidth={2} name="MRR" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Processing Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Volume</CardTitle>
            <CardDescription>Documents processed daily</CardDescription>
          </CardHeader>
          <CardContent>
            {processingLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              // @ts-expect-error - Recharts type definition compatibility issue
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success" fill={COLORS.success} name="Success" />
                  <Bar dataKey="failed" fill={COLORS.danger} name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Customer Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>Active customers over time</CardDescription>
          </CardHeader>
          <CardContent>
            {customerLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              // @ts-expect-error - Recharts type definition compatibility issue
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="active" stackId="1" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.6} name="Active" />
                  <Area type="monotone" dataKey="trial" stackId="1" stroke={COLORS.warning} fill={COLORS.warning} fillOpacity={0.6} name="Trial" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
            <CardDescription>Current processing status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              // @ts-expect-error - Recharts type definition compatibility issue
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

