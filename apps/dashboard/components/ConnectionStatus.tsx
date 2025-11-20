'use client'

import { useWebSocket } from '@/lib/websocket'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function ConnectionStatus() {
  const { status, reconnect } = useWebSocket()

  const statusConfig = {
    connecting: {
      label: 'Connecting...',
      color: 'bg-yellow-500',
      icon: RefreshCw,
      variant: 'secondary' as const
    },
    connected: {
      label: 'Live',
      color: 'bg-green-500',
      icon: Wifi,
      variant: 'default' as const
    },
    disconnected: {
      label: 'Disconnected',
      color: 'bg-gray-500',
      icon: WifiOff,
      variant: 'secondary' as const
    },
    error: {
      label: 'Error',
      color: 'bg-red-500',
      icon: WifiOff,
      variant: 'destructive' as const
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${config.color} animate-pulse`} />
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      {(status === 'disconnected' || status === 'error') && (
        <Button
          size="sm"
          variant="ghost"
          onClick={reconnect}
          className="h-7 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

