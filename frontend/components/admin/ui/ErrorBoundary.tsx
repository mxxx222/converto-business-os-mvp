/** @fileoverview React Error Boundary for Admin Dashboard segments */

'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  segmentName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AdminSegmentErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console/Sentry without PII
    console.error(`Admin segment error in ${this.props.segmentName}:`, {
      error: error.message,
      stack: error.stack?.substring(0, 500), // Truncate stack trace
      componentStack: errorInfo.componentStack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });

    // In production, you would send this to Sentry or similar service
    if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
      (window as any).__SENTRY__.captureException(error, {
        tags: {
          component: 'AdminSegment',
          segmentName: this.props.segmentName
        },
        extra: {
          componentStack: errorInfo.componentStack
        }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-medium text-red-900 mb-1">
            {this.props.segmentName} Error
          </h3>
          <p className="text-sm text-red-700 mb-3">
            This segment encountered an error and needs to be refreshed.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-red-600 cursor-pointer">
                Development Error Details
              </summary>
              <pre className="text-xs text-red-800 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  segmentName: string
) {
  return function WrappedComponent(props: T) {
    return (
      <AdminSegmentErrorBoundary segmentName={segmentName}>
        <Component {...props} />
      </AdminSegmentErrorBoundary>
    );
  };
}

/**
 * Simple error boundary for individual components
 */
export function ErrorBoundary({ children, fallback }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <AdminSegmentErrorBoundary segmentName="Component">
      {children}
    </AdminSegmentErrorBoundary>
  );
}
