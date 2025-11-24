'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to Sentry or other error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-[400px] flex items-center justify-center p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-white border-2 border-red-200 rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900">
                Jotain meni pieleen
              </h2>
            </div>
            
            <p className="text-gray-700 mb-6">
              Pahoittelut, tapahtui odottamaton virhe. Yritämme korjata ongelman mahdollisimman pian.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                <summary className="font-semibold cursor-pointer mb-2">
                  Tekninen tieto (vain kehityksessä)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                aria-label="Yritä uudelleen"
              >
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
                Yritä uudelleen
              </button>
              <Link
                href="/"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Palaa etusivulle
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

