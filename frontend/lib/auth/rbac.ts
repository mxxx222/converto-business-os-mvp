/**
 * Role-Based Access Control (RBAC) for Converto Business OS
 * Supports: viewer, editor, admin, owner roles
 */

export type UserRole = 'viewer' | 'editor' | 'admin' | 'owner';

export type Permission =
  | 'read:receipts'
  | 'write:receipts'
  | 'delete:receipts'
  | 'read:insights'
  | 'read:reports'
  | 'write:reports'
  | 'manage:team'
  | 'manage:billing'
  | 'manage:organization';

export const rolePermissions: Record<UserRole, Permission[]> = {
  viewer: ['read:receipts', 'read:insights', 'read:reports'],
  editor: ['read:receipts', 'write:receipts', 'read:insights', 'read:reports'],
  admin: [
    'read:receipts',
    'write:receipts',
    'delete:receipts',
    'read:insights',
    'read:reports',
    'write:reports',
    'manage:team',
    'manage:billing',
  ],
  owner: [
    'read:receipts',
    'write:receipts',
    'delete:receipts',
    'read:insights',
    'read:reports',
    'write:reports',
    'manage:team',
    'manage:billing',
    'manage:organization',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if role can delete receipts
 */
export function canDelete(role: UserRole): boolean {
  return hasPermission(role, 'delete:receipts');
}

/**
 * Check if role can manage team members
 */
export function canManageTeam(role: UserRole): boolean {
  return hasPermission(role, 'manage:team');
}

/**
 * Check if role can manage billing
 */
export function canManageBilling(role: UserRole): boolean {
  return hasPermission(role, 'manage:billing');
}

/**
 * Check if role can manage organization settings
 */
export function canManageOrganization(role: UserRole): boolean {
  return hasPermission(role, 'manage:organization');
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if role is at least editor level
 */
export function isEditorOrAbove(role: UserRole): boolean {
  return ['editor', 'admin', 'owner'].includes(role);
}

/**
 * Check if role is at least admin level
 */
export function isAdminOrAbove(role: UserRole): boolean {
  return ['admin', 'owner'].includes(role);
}

/**
 * Check if role is owner
 */
export function isOwner(role: UserRole): boolean {
  return role === 'owner';
}
