/**
 * Supabase Database Client for API Routes
 * Provides typed database access with RLS support
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthUser } from './auth';
import * as Sentry from '@sentry/nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Get Supabase client with service role (bypasses RLS)
 * Use with caution - only for admin operations
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get Supabase client with RLS context for specific tenant
 * This sets PostgreSQL session variables for Row Level Security
 */
export async function getSupabaseWithRLS(user: AuthUser): Promise<SupabaseClient> {
  const client = getSupabaseAdmin();

  try {
    // Set PostgreSQL session variables for RLS
    await client.rpc('set_config', {
      setting_name: 'app.current_tenant_id',
      setting_value: user.tenant_id,
      is_local: true,
    });

    await client.rpc('set_config', {
      setting_name: 'app.user_role',
      setting_value: user.role,
      is_local: true,
    });

    // Tag Sentry with tenant context
    Sentry.setTag('tenant_id', user.tenant_id);
    Sentry.setTag('user_role', user.role);
    Sentry.setUser({
      id: user.id,
      tenant_id: user.tenant_id,
    });

    return client;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'rls-setup' },
      extra: { tenant_id: user.tenant_id },
    });
    throw error;
  }
}

/**
 * Execute query with automatic RLS context
 */
export async function withRLS<T>(
  user: AuthUser,
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const client = await getSupabaseWithRLS(user);
  return operation(client);
}

/**
 * Database helper functions
 */

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Paginate query results
 */
export async function paginate<T>(
  query: any,
  params: PaginationParams = {}
): Promise<PaginatedResponse<T>> {
  const limit = Math.min(params.limit || 50, 200);
  const offset = params.offset || 0;

  // Get total count
  const { count } = await query.select('*', { count: 'exact', head: true });

  // Get paginated data
  const { data, error } = await query
    .select('*')
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    total: count || 0,
    limit,
    offset,
    hasMore: (count || 0) > offset + limit,
  };
}

/**
 * Safely get single record by ID with tenant isolation
 */
export async function getById<T>(
  user: AuthUser,
  table: string,
  id: string
): Promise<T | null> {
  const client = await getSupabaseWithRLS(user);

  const { data, error } = await client
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found or no access
      return null;
    }
    throw error;
  }

  return data as T;
}

/**
 * Insert record with automatic tenant_id
 */
export async function insert<T>(
  user: AuthUser,
  table: string,
  data: Partial<T>
): Promise<T> {
  const client = await getSupabaseWithRLS(user);

  const { data: inserted, error } = await client
    .from(table)
    .insert({
      ...data,
      tenant_id: user.tenant_id,
    })
    .select()
    .single();

  if (error) {
    Sentry.captureException(error, {
      tags: { component: 'db-insert', table },
      extra: { tenant_id: user.tenant_id },
    });
    throw error;
  }

  return inserted as T;
}

/**
 * Update record with RLS enforcement
 */
export async function update<T>(
  user: AuthUser,
  table: string,
  id: string,
  data: Partial<T>
): Promise<T | null> {
  const client = await getSupabaseWithRLS(user);

  const { data: updated, error } = await client
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    Sentry.captureException(error, {
      tags: { component: 'db-update', table },
      extra: { tenant_id: user.tenant_id, record_id: id },
    });
    throw error;
  }

  return updated as T;
}

/**
 * Delete record with RLS enforcement
 */
export async function deleteRecord(
  user: AuthUser,
  table: string,
  id: string
): Promise<boolean> {
  const client = await getSupabaseWithRLS(user);

  const { error } = await client
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === 'PGRST116') {
      return false;
    }
    Sentry.captureException(error, {
      tags: { component: 'db-delete', table },
      extra: { tenant_id: user.tenant_id, record_id: id },
    });
    throw error;
  }

  return true;
}

