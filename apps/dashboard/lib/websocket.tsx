'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface WebSocketContextValue {
  status: WebSocketStatus
  lastMessage: WebSocketMessage | null
  sendMessage: (message: any) => void
  reconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
  url: string
  autoConnect?: boolean
  reconnectInterval?: number
  onMessage?: (message: WebSocketMessage) => void
}

export function WebSocketProvider({
  children,
  url,
  autoConnect = true,
  reconnectInterval = 5000,
  onMessage
}: WebSocketProviderProps) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [shouldReconnect, setShouldReconnect] = useState(autoConnect)

  const connect = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    console.log('Connecting to WebSocket:', url)
    setStatus('connecting')

    try {
      const socket = new WebSocket(url)

      socket.onopen = () => {
        console.log('WebSocket connected')
        setStatus('connected')
        toast.success('Connected to real-time updates', {
          duration: 2000,
          icon: '🟢'
        })
      }

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('WebSocket message:', message)
          setLastMessage(message)
          onMessage?.(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('error')
        toast.error('Connection error', {
          description: 'Failed to connect to real-time updates',
          icon: '🔴'
        })
      }

      socket.onclose = () => {
        console.log('WebSocket disconnected')
        setStatus('disconnected')
        setWs(null)

        // Auto-reconnect
        if (shouldReconnect) {
          console.log(`Reconnecting in ${reconnectInterval}ms...`)
          setTimeout(() => {
            if (shouldReconnect) {
              connect()
            }
          }, reconnectInterval)
        }
      }

      setWs(socket)
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setStatus('error')
    }
  }, [url, shouldReconnect, reconnectInterval, onMessage, ws])

  const sendMessage = useCallback((message: any) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }, [ws])

  const reconnect = useCallback(() => {
    setShouldReconnect(true)
    if (ws) {
      ws.close()
    }
    connect()
  }, [ws, connect])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      setShouldReconnect(false)
      if (ws) {
        ws.close()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect])

  return (
    <WebSocketContext.Provider value={{ status, lastMessage, sendMessage, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

