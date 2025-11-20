// Supabase-based authentication utilities
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
  permissions: string[]
}

export interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Convert Supabase User to AdminUser
function mapSupabaseUserToAdminUser(supabaseUser: User | null): AdminUser | null {
  if (!supabaseUser) return null
  
  // Extract role from user metadata or default to admin
  const userMetadata = supabaseUser.user_metadata || {}
  const role = userMetadata.role || 'admin'
  const permissions = role === 'super_admin' 
    ? ['all'] 
    : ['read', 'write', 'customers', 'analytics']
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: userMetadata.name || userMetadata.full_name || supabaseUser.email?.split('@')[0] || 'Admin User',
    role: role as 'admin' | 'super_admin',
    permissions
  }
}

export class AuthManager {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async getAdminUser(): Promise<AdminUser | null> {
    const user = await this.getUser()
    return mapSupabaseUserToAdminUser(user)
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session
  }

  async logout() {
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authManager = new AuthManager()

// Legacy functions for backward compatibility
export async function validateAdminToken(token: string): Promise<AdminUser | null> {
  // Validate token via Supabase session
  const session = await authManager.getSession()
  if (session?.access_token === token) {
    return await authManager.getAdminUser()
  }
  return null
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  // Use Supabase password authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error || !data.user) {
    return null
  }
  
  return mapSupabaseUserToAdminUser(data.user)
}

export function hasPermission(user: AdminUser | null, permission: string): boolean {
  if (!user) return false
  if (user.permissions.includes('all')) return true
  return user.permissions.includes(permission)
}

export function canAccessModule(user: AdminUser | null, module: string): boolean {
  if (!user) return false
  if (user.permissions.includes('all')) return true
  
  const modulePermissions: Record<string, string[]> = {
    'activity': ['read'],
    'queue': ['read', 'write'],
    'ocr': ['read', 'write'],
    'customers': ['customers'],
    'analytics': ['analytics'],
    'billing': ['read', 'write'],
    'api': ['read']
  }
  
  const requiredPermissions = modulePermissions[module] || []
  return requiredPermissions.some(permission => hasPermission(user, permission))
}