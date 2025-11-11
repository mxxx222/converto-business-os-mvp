// Simple admin authentication utilities
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

// Mock admin users for demo purposes
const mockUsers: AdminUser[] = [
  {
    id: 'admin_001',
    email: 'admin@docflow.fi',
    name: 'System Administrator',
    role: 'super_admin',
    permissions: ['all']
  },
  {
    id: 'admin_002',
    email: 'support@docflow.fi',
    name: 'Support Agent',
    role: 'admin',
    permissions: ['read', 'write', 'customers', 'analytics']
  }
]

export async function validateAdminToken(token: string): Promise<AdminUser | null> {
  // In production, this would validate against a real JWT token
  // For demo purposes, we'll use a simple check
  if (token === 'demo_admin_token') {
    return mockUsers[0] // Return first admin
  }
  
  if (token === 'demo_support_token') {
    return mockUsers[1] // Return support agent
  }
  
  return null
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  // In production, this would verify against a real user database
  // For demo purposes, accept any email with password 'admin123'
  if (password === 'admin123') {
    return mockUsers[0] // Return first admin
  }
  
  if (email === 'support@docflow.fi' && password === 'support123') {
    return mockUsers[1] // Return support agent
  }
  
  return null
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