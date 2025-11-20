'use client'

import { AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUserFriendlyError, isRecoverableError, getRecoveryAction, type ErrorInfo } from '@/lib/errors'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  title?: string
  className?: string
  showDetails?: boolean
}

export function ErrorState({
  error,
  onRetry,
  title,
  className,
  showDetails = false
}: ErrorStateProps) {
  const errorInfo = getUserFriendlyError(error)
  const canRetry = isRecoverableError(error) && onRetry
  const recoveryAction = getRecoveryAction(error)
  const locale = 'fi' // Could be dynamic

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'network':
      case 'server':
        return AlertCircle
      case 'auth':
        return AlertTriangle
      default:
        return AlertCircle
    }
  }

  const getErrorVariant = (type: ErrorInfo['type']): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (type) {
      case 'auth':
        return 'destructive'
      case 'server':
        return 'destructive'
      case 'network':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const Icon = getErrorIcon(errorInfo.type)

  return (
    <Card className={cn("border-destructive/50", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-destructive" />
          <CardTitle>{title || errorInfo.userMessage[locale]}</CardTitle>
        </div>
        <CardDescription>
          <Badge variant={getErrorVariant(errorInfo.type)} className="mt-2">
            {errorInfo.type}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorInfo.recovery && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Mitä voin tehdä?</p>
            <p className="text-muted-foreground">{errorInfo.recovery[locale]}</p>
          </div>
        )}

        {showDetails && error instanceof Error && (
          <details className="rounded-lg border p-3 text-xs">
            <summary className="cursor-pointer font-medium mb-2">
              Tekninen tieto
            </summary>
            <pre className="mt-2 overflow-auto text-xs">
              {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        {canRetry && (
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yritä uudelleen
          </Button>
        )}

        {recoveryAction === 'login' && (
          <Button 
            onClick={() => window.location.href = '/login'} 
            variant="outline"
            className="w-full"
          >
            Kirjaudu sisään
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

