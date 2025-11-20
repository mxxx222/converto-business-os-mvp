'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { WebSocketProvider } from '@/lib/websocket'
import { ConnectionStatus } from '@/components/ConnectionStatus'

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 2,
            refetchOnWindowFocus: true,
          },
        },
      })
  )

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && pathname === '/login') {
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT' && pathname?.startsWith('/dashboard')) {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  // Use Fly.io backend WebSocket in production, localhost for local development
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://docflow-admin-api.fly.dev/ws'

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider url={wsUrl}>
        <div className="flex min-h-screen flex-col">
          {/* Header with connection status */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">DocFlow Dashboard</h1>
              </div>
              <ConnectionStatus />
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" richColors />
      </WebSocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}