/**
 * Tenant Context Management for API Routes
 * Handles tenant isolation and RLS setup
 */

import { NextRequest } from 'next/server';
import { AuthUser } from './auth';
import * as Sentry from '@sentry/nextjs';

/**
 * Extract tenant ID from request
 */
export function getTenantId(request: NextRequest, user?: AuthUser | null): string {
  // Priority 1: User's tenant_id
  if (user?.tenant_id) {
    return user.tenant_id;
  }

  // Priority 2: X-Tenant-ID header
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) {
    return headerTenantId;
  }

  // Priority 3: Query parameter
  const url = new URL(request.url);
  const queryTenantId = url.searchParams.get('tenant_id');
  if (queryTenantId) {
    return queryTenantId;
  }

  // Default: 'default' tenant
  return 'default';
}

/**
 * Validate tenant access
 * Ensures user can only access their own tenant's data
 */
export function validateTenantAccess(
  user: AuthUser,
  requestedTenantId: string
): boolean {
  // Admin can access all tenants
  if (user.role === 'admin' || user.role === 'support') {
    return true;
  }

  // Regular users can only access their own tenant
  if (user.tenant_id !== requestedTenantId) {
    Sentry.captureMessage('Tenant access violation attempt', {
      level: 'warning',
      tags: {
        component: 'tenant-validation',
        user_tenant: user.tenant_id,
        requested_tenant: requestedTenantId,
      },
      extra: {
        user_id: user.id,
        user_role: user.role,
      },
    });
    return false;
  }

  return true;
}

/**
 * Require tenant access - throws 403 if invalid
 */
export function requireTenantAccess(
  user: AuthUser,
  requestedTenantId: string
): void {
  if (!validateTenantAccess(user, requestedTenantId)) {
    throw new Error('Forbidden: Tenant access denied');
  }
}

/**
 * Set tenant context for Sentry
 */
export function setTenantContext(user: AuthUser): void {
  Sentry.setTag('tenant_id', user.tenant_id);
  Sentry.setTag('user_role', user.role);
  Sentry.setUser({
    id: user.id,
    tenant_id: user.tenant_id,
  });
}

/**
 * Get tenant metadata from database
 */
export interface TenantMetadata {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  features: string[];
  limits: {
    api_calls_per_day: number;
    storage_gb: number;
    users: number;
  };
  created_at: string;
}

/**
 * Check if tenant has feature enabled
 */
export function hasTenantFeature(
  metadata: TenantMetadata,
  feature: string
): boolean {
  return metadata.features.includes(feature);
}

/**
 * Check if tenant is within limits
 */
export interface UsageStats {
  api_calls_today: number;
  storage_used_gb: number;
  active_users: number;
}

export function checkTenantLimits(
  metadata: TenantMetadata,
  usage: UsageStats
): {
  within_limits: boolean;
  exceeded: string[];
} {
  const exceeded: string[] = [];

  if (usage.api_calls_today >= metadata.limits.api_calls_per_day) {
    exceeded.push('api_calls');
  }

  if (usage.storage_used_gb >= metadata.limits.storage_gb) {
    exceeded.push('storage');
  }

  if (usage.active_users >= metadata.limits.users) {
    exceeded.push('users');
  }

  return {
    within_limits: exceeded.length === 0,
    exceeded,
  };
}

/**
 * Generate tenant-scoped cache key
 */
export function getTenantCacheKey(
  tenant_id: string,
  resource: string,
  id?: string
): string {
  return id
    ? `tenant:${tenant_id}:${resource}:${id}`
    : `tenant:${tenant_id}:${resource}`;
}

