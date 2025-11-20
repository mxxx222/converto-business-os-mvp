'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWebSocket } from '@/lib/websocket'
import { FileText, User, CheckCircle, XCircle, Clock, ArrowUpCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fi } from 'date-fns/locale'
import { toast } from 'sonner'

interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
  status?: 'success' | 'error' | 'info' | 'warning'
  metadata?: any
}

export default function RealTimeActivity() {
  const { lastMessage } = useWebSocket()
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!lastMessage) return

    // Convert WebSocket message to activity
    const activity = messageToActivity(lastMessage)
    if (activity) {
      setActivities(prev => [activity, ...prev].slice(0, 50)) // Keep last 50
      
      // Show toast for important events
      if (shouldShowToast(lastMessage.type)) {
        showNotificationToast(activity)
      }
    }
  }, [lastMessage])

  const messageToActivity = (message: any): Activity | null => {
    const { type, data, timestamp } = message

    switch (type) {
      case 'document.created':
        return {
          id: data.id,
          type: 'document',
          message: `New document uploaded: ${data.filename}`,
          timestamp,
          status: 'info',
          metadata: data
        }

      case 'document.processing':
        return {
          id: data.id,
          type: 'document',
          message: `Processing document: ${data.filename}`,
          timestamp,
          status: 'warning',
          metadata: data
        }

      case 'document.completed':
        return {
          id: data.id,
          type: 'document',
          message: `Document processed successfully: ${data.filename}`,
          timestamp,
          status: 'success',
          metadata: data
        }

      case 'document.failed':
        return {
          id: data.id,
          type: 'document',
          message: `Failed to process: ${data.filename}`,
          timestamp,
          status: 'error',
          metadata: data
        }

      case 'customer.created':
        return {
          id: data.id,
          type: 'customer',
          message: `New customer: ${data.email}`,
          timestamp,
          status: 'success',
          metadata: data
        }

      case 'customer.subscription_changed':
        return {
          id: data.id,
          type: 'customer',
          message: `${data.email} upgraded to ${data.plan}`,
          timestamp,
          status: 'success',
          metadata: data
        }

      default:
        return null
    }
  }

  const shouldShowToast = (type: string) => {
    return ['document.completed', 'document.failed', 'customer.created'].includes(type)
  }

  const showNotificationToast = (activity: Activity) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }

    const toastFn = activity.status === 'error' ? toast.error : 
                    activity.status === 'warning' ? toast.warning : 
                    toast.success

    toastFn(activity.message, {
      icon: icons[activity.status || 'info'],
      duration: 4000
    })
  }

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

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Activity</CardTitle>
          <CardDescription>Live updates from your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Waiting for activity...</p>
            <p className="text-xs text-muted-foreground mt-1">Events will appear here in real-time</p>
          </div>
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
