'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { hasPermission, type Permission } from '@/lib/auth/rbac';

interface ProtectedButtonProps {
  permission: Permission;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fallback?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button that only renders if user has the required permission
 */
export function ProtectedButton({
  permission,
  children,
  onClick,
  className,
  fallback,
  disabled,
  type = 'button',
}: ProtectedButtonProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!user || !hasPermission(role, permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <button type={type} onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
}
