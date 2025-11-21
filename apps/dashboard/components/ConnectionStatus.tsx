'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff } from 'lucide-react'

type ConnectionStatus = 'connected' | 'disconnected' | 'checking'

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking')

  useEffect(() => {
    // Check Supabase connection status
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('activities').select('id').limit(1)
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is fine
          setStatus('disconnected')
        } else {
          setStatus('connected')
        }
      } catch {
        setStatus('disconnected')
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30s

    return () => clearInterval(interval)
  }, [])

  const statusConfig = {
    checking: {
      label: 'Checking...',
      color: 'bg-yellow-500',
      icon: WifiOff,
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
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${config.color} ${status === 'connected' ? 'animate-pulse' : ''}`} />
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    </div>
  )
}

