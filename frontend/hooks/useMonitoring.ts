'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { setUserContext, clearUserContext, addBreadcrumb } from '@/lib/monitoring/sentry';

export function useMonitoring() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserContext(user.id, user.email || undefined);
      addBreadcrumb(`User logged in: ${user.email}`, 'auth', 'info');
    } else {
      clearUserContext();
    }
  }, [user]);
}
