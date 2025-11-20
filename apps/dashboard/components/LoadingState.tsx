'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingState({ 
  message = 'Ladataan...', 
  fullScreen = false,
  className 
}: LoadingStateProps) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      fullScreen ? "min-h-screen" : "py-12",
      className
    )}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

