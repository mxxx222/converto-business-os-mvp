'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { hasPermission, type Permission } from '@/lib/auth/rbac';

interface ProtectedContentProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Content that only renders if user has the required permission
 */
export function ProtectedContent({
  permission,
  children,
  fallback,
}: ProtectedContentProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!user || !hasPermission(role, permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
