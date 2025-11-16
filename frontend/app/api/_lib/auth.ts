/**
 * Supabase Auth Helpers for API Routes
 * Verifies JWT tokens and extracts user context
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client with service role (lazy initialization)
let supabaseAdmin: any = null;

function initSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Supabase URL and Service Role Key are required');
  }
  
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  return supabaseAdmin;
}

export interface AuthUser {
  id: string;
  email: string;
  tenant_id: string;
  role: string;
  metadata?: Record<string, any>;
}

/**
 * Extract and verify JWT from Authorization header
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      Sentry.captureMessage('Auth verification failed', {
        level: 'warning',
        extra: { error: error?.message },
      });
      return null;
    }

    // Extract tenant_id from user metadata
    const tenant_id = user.user_metadata?.tenant_id || user.app_metadata?.tenant_id || 'default';
    const role = user.user_metadata?.role || user.app_metadata?.role || 'user';

    return {
      id: user.id,
      email: user.email!,
      tenant_id,
      role,
      metadata: user.user_metadata,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'auth-verification' },
    });
    return null;
  }
}

/**
 * Get user from cookie-based session (for SSR)
 */
export async function getUserFromCookie(request: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      return null;
    }

    // Extract Supabase auth token from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies['sb-access-token'] || cookies['supabase-auth-token'];

    if (!accessToken) {
      return null;
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    const tenant_id = user.user_metadata?.tenant_id || user.app_metadata?.tenant_id || 'default';
    const role = user.user_metadata?.role || user.app_metadata?.role || 'user';

    return {
      id: user.id,
      email: user.email!,
      tenant_id,
      role,
      metadata: user.user_metadata,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'cookie-auth' },
    });
    return null;
  }
}

/**
 * Require authentication - throws 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(request) || await getUserFromCookie(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require specific role - throws 403 if insufficient permissions
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    Sentry.captureMessage('Insufficient permissions', {
      level: 'warning',
      extra: { user_role: user.role, required_roles: allowedRoles },
      tags: { tenant_id: user.tenant_id },
    });
    throw new Error('Forbidden');
  }

  return user;
}

/**
 * Get Supabase admin client (service role)
 */
export function getSupabaseAdmin() {
  return initSupabaseAdmin();
}

