'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useActivities, useActivitiesRealtime } from '@/hooks/useActivities'
import { FileText, User, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fi } from 'date-fns/locale'
import { toast } from 'sonner'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
import type { Activity as APIActivity } from '@/lib/api-client'

interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
  status?: 'success' | 'error' | 'info' | 'warning'
  metadata?: any
}

// Map API activity to component activity
function mapAPIActivityToComponent(activity: APIActivity): Activity {
  // Parse activity type and message to determine status
  let status: 'success' | 'error' | 'info' | 'warning' = 'info'
  
  if (activity.type.includes('error') || activity.type.includes('failed')) {
    status = 'error'
  } else if (activity.type.includes('completed') || activity.type.includes('success')) {
    status = 'success'
  } else if (activity.type.includes('processing') || activity.type.includes('warning')) {
    status = 'warning'
  }

  return {
    id: activity.id,
    type: activity.type,
    message: activity.message,
    timestamp: activity.created_at,
    status,
    metadata: activity.metadata
  }
}

export default function RealTimeActivity() {
  const { data: apiActivities, isLoading, error } = useActivities(50)
  
  // Enable real-time updates
  useActivitiesRealtime()

  // Map API activities to component format and keep last 50
  const activities = useMemo(() => {
    return (apiActivities || []).map(mapAPIActivityToComponent).slice(0, 50)
  }, [apiActivities])

  // Show toast for important events (only on new activities via real-time)
  // This is handled by the real-time subscription in the hook

  const getActivityIcon = (type: string, status?: string) => {
    if (type === 'document') {
      if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />
      if (status === 'error') return <XCircle className="h-4 w-4 text-red-600" />
      if (status === 'warning') return <Clock className="h-4 w-4 text-yellow-600" />
      return <FileText className="h-4 w-4 text-blue-600" />
    }
    if (type === 'customer') {
      return <User className="h-4 w-4 text-purple-600" />
    }
    return <FileText className="h-4 w-4 text-gray-600" />
  }

  const getStatusBadge = (status?: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      info: 'outline'
    }

    return (
      <Badge variant={variants[status || 'info'] as any} className="text-xs">
        {status || 'info'}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Activity</CardTitle>
          <CardDescription>Live updates from your system</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading activities..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Activity</CardTitle>
          <CardDescription>Live updates from your system</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState 
            message="Failed to load activities" 
            error={error instanceof Error ? error : new Error('Unknown error')}
          />
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Activity</CardTitle>
          <CardDescription>Live updates from your system</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState message="No activities yet" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Real-Time Activity
          <Badge variant="outline" className="ml-2">
            {activities.length} events
          </Badge>
        </CardTitle>
        <CardDescription>Live updates from your system</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <div className="mt-0.5">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: fi
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
