/**
 * CSP Violation Report Handler
 * 
 * Collects Content Security Policy violation reports from browsers
 * and sends them to Sentry for monitoring.
 * 
 * Features:
 * - Noise filtering (browser extensions, localhost)
 * - Fingerprinting for grouping similar violations
 * - Sentry integration with proper tagging
 */

import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

// Noise patterns to filter out (not our bugs)
const NOISE_PATTERNS = [
  /chrome-extension:\/\//,
  /moz-extension:\/\//,
  /safari-extension:\/\//,
  /localhost/,
  /127\.0\.0\.1/,
  /\[::1\]/,
  /^file:\/\//,
]

/**
 * Check if CSP violation is noise (browser extension, localhost, etc.)
 */
function isNoise(violation: any): boolean {
  const blockedUri = violation['blocked-uri'] || ''
  const sourceFile = violation['source-file'] || ''
  
  return NOISE_PATTERNS.some(pattern => 
    pattern.test(blockedUri) || pattern.test(sourceFile)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Filter noise
    if (isNoise(body)) {
      console.debug('[CSP Report] Ignored noise:', body['blocked-uri'])
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }
    
    // Log to console
    console.warn('[CSP Violation]', {
      documentUri: body['document-uri'],
      violatedDirective: body['violated-directive'],
      blockedUri: body['blocked-uri'],
      sourceFile: body['source-file'],
      lineNumber: body['line-number'],
      columnNumber: body['column-number'],
    })

    // Send to Sentry with fingerprinting
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureMessage('CSP Violation', {
        level: 'warning',
        
        // Fingerprint for grouping similar violations
        fingerprint: [
          'csp-violation',
          body['violated-directive'] || 'unknown',
          body['blocked-uri'] || 'unknown',
        ],
        
        // Extra context
        extra: {
          documentUri: body['document-uri'],
          violatedDirective: body['violated-directive'],
          blockedUri: body['blocked-uri'],
          sourceFile: body['source-file'],
          lineNumber: body['line-number'],
          columnNumber: body['column-number'],
          originalPolicy: body['original-policy'],
          disposition: body['disposition'],
        },
        
        // Tags for filtering
        tags: {
          csp_directive: body['violated-directive'],
          csp_disposition: body['disposition'] || 'enforce',
        },
      })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('[CSP Report] Failed to process report:', error)
    
    // Report processing error to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          component: 'csp-report-handler',
        },
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to process report' },
      { status: 500 }
    )
  }
}

// Allow POST only
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

