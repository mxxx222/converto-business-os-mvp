/** @fileoverview Toast notification system for admin UI */

'use client';

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>('info');
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback((msg: string, toastType: ToastType = 'info') => {
    setType(toastType);
    setMessage(msg);
    setIsVisible(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setIsVisible(false);
      setMessage(null);
    }, 3000);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    setMessage(null);
  }, []);

  const ToastComponent = () => {
    if (!isVisible || !message) return null;

    const bgColor = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-600',
      info: 'bg-gray-800'
    }[type];

    const icon = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[type];

    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium">{message}</span>
          <button 
            onClick={hide}
            className="ml-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return { show, hide, Toast: ToastComponent };
}