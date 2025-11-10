/** @fileoverview Common UI state components for admin modules */

'use client';

import React from 'react';

interface EmptyStateProps {
  children?: React.ReactNode;
  icon?: string;
  title?: string;
  description?: string;
}

export function EmptyState({ 
  children = "No data available", 
  icon = "📭",
  title,
  description 
}: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-2">{icon}</div>
      {title && <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>}
      {description && <p className="text-sm text-gray-500 mb-3">{description}</p>}
      <p className="text-sm text-gray-400">{children}</p>
    </div>
  );
}

interface ErrorStateProps {
  error: Error | string | null;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
  
  return (
    <div className="text-center py-6">
      <div className="text-red-500 text-2xl mb-2">⚠️</div>
      <h3 className="text-sm font-medium text-red-900 mb-1">Error Loading Data</h3>
      <p className="text-sm text-red-700 mb-3">{errorMessage}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  count?: number;
  message?: string;
}

export function LoadingState({ count = 3, message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      <div className="text-center text-sm text-gray-500 mb-4">{message}</div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex space-x-3">
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'md', 
  loading = false,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}