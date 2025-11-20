'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { getUserFriendlyError, logError, isRecoverableError } from '@/lib/errors'
import * as Sentry from '@sentry/nextjs'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: getUserFriendlyError(error)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    logError(error, 'ErrorBoundary')
    
    // Send to Sentry with React component stack
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        }
      },
      tags: {
        errorBoundary: true,
      }
    })
    
    // Call custom error handler if provided
    if (this.props.onError) {
      const errorDetails = getUserFriendlyError(error)
      this.props.onError(error, errorDetails)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo } = this.state
      const canRecover = error ? isRecoverableError(error) : false
      const locale = 'fi' // Could be dynamic based on user preference

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Jotain meni pieleen</CardTitle>
              </div>
              <CardDescription>
                {errorInfo?.userMessage[locale] || 'Tuntematon virhe tapahtui'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorInfo?.recovery && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium mb-1">Mitä voin tehdä?</p>
                  <p className="text-muted-foreground">{errorInfo.recovery[locale]}</p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && error && (
                <details className="rounded-lg border p-3 text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Tekninen tieto (vain kehitysympäristössä)
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

              <div className="flex flex-col gap-2">
                {canRecover && (
                  <Button onClick={this.handleReset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Yritä uudelleen
                  </Button>
                )}
                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Päivitä sivu
                </Button>
                <Button onClick={this.handleGoHome} variant="ghost">
                  <Home className="mr-2 h-4 w-4" />
                  Siirry etusivulle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

