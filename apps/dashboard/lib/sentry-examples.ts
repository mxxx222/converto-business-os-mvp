/**
 * Sentry Usage Examples
 * 
 * This file demonstrates how to use Sentry features in the dashboard app:
 * - Exception catching with captureException
 * - Tracing spans for performance monitoring
 * - Structured logging with logger
 * 
 * These examples should be used as guidance when implementing Sentry functionality.
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Example 1: Exception Catching
 * 
 * Use Sentry.captureException(error) in try-catch blocks or areas where exceptions are expected
 */
export async function exampleExceptionCatching() {
  try {
    // Some operation that might fail
    const result = await someRiskyOperation()
    return result
  } catch (error) {
    // Capture exception in Sentry
    Sentry.captureException(error, {
      contexts: {
        custom: {
          operation: 'riskyOperation',
          userId: 'user-123',
        }
      },
      tags: {
        feature: 'example',
        severity: 'high',
      }
    })
    
    // Re-throw or handle as needed
    throw error
  }
}

/**
 * Example 2: Tracing Span in Component Action
 * 
 * Create spans for meaningful actions like button clicks
 */
export function exampleComponentSpan() {
  const handleButtonClick = () => {
    Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Analytics Export Button Click',
      },
      (span) => {
        const exportFormat = 'csv'
        const timeRange = '30d'
        
        // Add attributes to span
        span.setAttribute('export.format', exportFormat)
        span.setAttribute('export.timeRange', timeRange)
        
        // Perform the action
        exportAnalytics(exportFormat, timeRange)
      }
    )
  }
  
  return handleButtonClick
}

/**
 * Example 3: Tracing Span in API Call
 * 
 * Wrap API calls with spans to track performance
 */
export async function exampleAPISpan(userId: string) {
  return Sentry.startSpan(
    {
      op: 'http.client',
      name: `GET /api/users/${userId}`,
    },
    async (span) => {
      span.setAttribute('user.id', userId)
      
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      
      span.setAttribute('http.status_code', response.status)
      span.setAttribute('response.size', JSON.stringify(data).length)
      
      return data
    }
  )
}

/**
 * Example 4: Structured Logging
 * 
 * Use Sentry logger for structured logs
 */
export function exampleStructuredLogging() {
  const { logger } = Sentry
  
  // Trace level - very detailed
  logger.trace('Starting database connection', { 
    database: 'users',
    host: 'db.example.com'
  })
  
  // Debug level - debugging information
  const userId = 'user-123'
  logger.debug(logger.fmt`Cache miss for user: ${userId}`)
  
  // Info level - general information
  logger.info('Updated profile', { 
    profileId: 345,
    changes: ['email', 'avatar']
  })
  
  // Warn level - warnings
  logger.warn('Rate limit reached for endpoint', {
    endpoint: '/api/results/',
    isEnterprise: false,
    retryAfter: 60
  })
  
  // Error level - errors
  logger.error('Failed to process payment', {
    orderId: 'order_123',
    amount: 99.99,
    currency: 'EUR'
  })
  
  // Fatal level - critical errors
  logger.fatal('Database connection pool exhausted', {
    database: 'users',
    activeConnections: 100,
    maxConnections: 100
  })
}

/**
 * Example 5: Span with Child Spans
 * 
 * Create nested spans for complex operations
 */
export async function exampleNestedSpans() {
  return Sentry.startSpan(
    {
      op: 'task.process',
      name: 'Process Document Upload',
    },
    async (parentSpan) => {
      parentSpan.setAttribute('document.type', 'invoice')
      
      // Child span 1: Validate
      await Sentry.startSpan(
        {
          op: 'task.validate',
          name: 'Validate Document',
        },
        async (span) => {
          span.setAttribute('validation.rules', 'strict')
          await validateDocument()
        }
      )
      
      // Child span 2: Process
      await Sentry.startSpan(
        {
          op: 'task.process',
          name: 'Process OCR',
        },
        async (span) => {
          span.setAttribute('ocr.engine', 'tesseract')
          await processOCR()
        }
      )
      
      // Child span 3: Store
      await Sentry.startSpan(
        {
          op: 'db.write',
          name: 'Store Results',
        },
        async (span) => {
          span.setAttribute('db.table', 'documents')
          await storeResults()
        }
      )
    }
  )
}

// Placeholder functions for examples
async function someRiskyOperation() {
  return Promise.resolve({ success: true })
}

function exportAnalytics(format: string, timeRange: string) {
  console.log(`Exporting ${format} for ${timeRange}`)
}

async function validateDocument() {
  return Promise.resolve()
}

async function processOCR() {
  return Promise.resolve()
}

async function storeResults() {
  return Promise.resolve()
}

