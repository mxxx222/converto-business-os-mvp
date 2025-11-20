/**
 * Error utilities for production-ready error handling
 * Provides error classification, user-friendly messages, and recovery suggestions
 */

export type ErrorType = 'network' | 'auth' | 'validation' | 'server' | 'unknown'

export interface ErrorInfo {
  type: ErrorType
  message: string
  userMessage: {
    fi: string
    en: string
  }
  recovery?: {
    fi: string
    en: string
  }
  code?: string
  statusCode?: number
  details?: any
}

/**
 * Classify error type based on error object
 */
export function classifyError(error: unknown): ErrorType {
  if (!error) return 'unknown'

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('failed to fetch')
    ) {
      return 'network'
    }

    // Auth errors
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('authentication') ||
      message.includes('token') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return 'auth'
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('422')
    ) {
      return 'validation'
    }

    // Server errors
    if (
      message.includes('server') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    ) {
      return 'server'
    }
  }

  // Check for HTTP status codes
  if (typeof error === 'object' && error !== null) {
    const err = error as any
    if (err.statusCode || err.status) {
      const status = err.statusCode || err.status
      if (status >= 500) return 'server'
      if (status === 401 || status === 403) return 'auth'
      if (status === 422) return 'validation'
    }
  }

  return 'unknown'
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown, locale: 'fi' | 'en' = 'fi'): ErrorInfo {
  const type = classifyError(error)
  const errorObj = error instanceof Error ? error : new Error(String(error))

  const messages: Record<ErrorType, { fi: string; en: string }> = {
    network: {
      fi: 'Yhteysongelma',
      en: 'Connection Error'
    },
    auth: {
      fi: 'Kirjautuminen vaaditaan',
      en: 'Authentication Required'
    },
    validation: {
      fi: 'Tarkista syötteet',
      en: 'Validation Error'
    },
    server: {
      fi: 'Palvelinvirhe',
      en: 'Server Error'
    },
    unknown: {
      fi: 'Tuntematon virhe',
      en: 'Unknown Error'
    }
  }

  const recoveryMessages: Record<ErrorType, { fi: string; en: string }> = {
    network: {
      fi: 'Tarkista internet-yhteytesi ja yritä uudelleen.',
      en: 'Check your internet connection and try again.'
    },
    auth: {
      fi: 'Kirjaudu ulos ja takaisin sisään.',
      en: 'Please log out and log back in.'
    },
    validation: {
      fi: 'Tarkista että kaikki pakolliset kentät on täytetty oikein.',
      en: 'Please check that all required fields are filled correctly.'
    },
    server: {
      fi: 'Palvelin on tilapäisesti poissa käytöstä. Yritä myöhemmin uudelleen.',
      en: 'The server is temporarily unavailable. Please try again later.'
    },
    unknown: {
      fi: 'Yritä päivittää sivu tai ota yhteyttä tukeen.',
      en: 'Try refreshing the page or contact support.'
    }
  }

  // Extract status code if available
  let statusCode: number | undefined
  if (typeof error === 'object' && error !== null) {
    const err = error as any
    statusCode = err.statusCode || err.status || err.response?.status
  }

  return {
    type,
    message: errorObj.message,
    userMessage: {
      fi: messages[type].fi,
      en: messages[type].en
    },
    recovery: {
      fi: recoveryMessages[type].fi,
      en: recoveryMessages[type].en
    },
    code: (error as any)?.code,
    statusCode,
    details: error instanceof Error ? { stack: errorObj.stack } : error
  }
}

/**
 * Log error for debugging and monitoring
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = getUserFriendlyError(error)
  
  console.error('Error occurred:', {
    type: errorInfo.type,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    statusCode: errorInfo.statusCode,
    context,
    error: error instanceof Error ? error : String(error)
  })

  // Integrate with Sentry
  if (typeof window !== 'undefined') {
    try {
      // Dynamic import to avoid SSR issues
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          contexts: {
            custom: {
              context,
              errorType: errorInfo.type,
              statusCode: errorInfo.statusCode,
            }
          },
          tags: {
            errorType: errorInfo.type,
            context: context || 'unknown',
          }
        })
      }).catch(() => {
        // Sentry not available, skip
      })
    } catch {
      // Sentry not available, skip
    }
  }
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: unknown): boolean {
  const type = classifyError(error)
  return type === 'network' || type === 'server'
}

/**
 * Get error recovery action
 */
export function getRecoveryAction(error: unknown): string | null {
  const type = classifyError(error)
  
  switch (type) {
    case 'network':
      return 'retry'
    case 'server':
      return 'retry'
    case 'auth':
      return 'login'
    case 'validation':
      return 'fix'
    default:
      return null
  }
}

