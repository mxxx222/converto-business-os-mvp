'use client';

import { showToast as showToastImpl, removeToast } from '@/components/dashboard/Toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export function useToast() {
  return {
    toast: (options: ToastOptions) => {
      const message = options.title
        ? options.description
          ? `${options.title}: ${options.description}`
          : options.title
        : options.description || 'Notification';
      showToastImpl(message, options.type || 'info', options.duration || 5000);
    },
    success: (message: string, duration?: number) => {
      showToastImpl(message, 'success', duration);
    },
    error: (message: string, duration?: number) => {
      showToastImpl(message, 'error', duration);
    },
    info: (message: string, duration?: number) => {
      showToastImpl(message, 'info', duration);
    },
    warning: (message: string, duration?: number) => {
      showToastImpl(message, 'warning', duration);
    },
  };
}
