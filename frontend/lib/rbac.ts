/**
 * RBAC (Role-Based Access Control) + Team Management
 *
 * Defines roles, permissions, and access control logic.
 * Works with Supabase team_members and module permissions.
 */

export type Role = 'viewer' | 'editor' | 'admin' | 'owner';

export interface RoleDefinition {
  role: Role;
  label: string;
  read: boolean;
  write: boolean;
  manage: boolean;
  billing: boolean;
  permissions: string[];
}

export const ROLES: Record<Role, RoleDefinition> = {
  viewer: {
    role: 'viewer',
    label: 'Viewer',
    read: true,
    write: false,
    manage: false,
    billing: false,
    permissions: ['read'],
  },

  editor: {
    role: 'editor',
    label: 'Editor',
    read: true,
    write: true,
    manage: false,
    billing: false,
    permissions: ['read', 'write'],
  },

  admin: {
    role: 'admin',
    label: 'Admin',
    read: true,
    write: true,
    manage: true,
    billing: false,
    permissions: ['read', 'write', 'manage'],
  },

  owner: {
    role: 'owner',
    label: 'Owner',
    read: true,
    write: true,
    manage: true,
    billing: true,
    permissions: ['read', 'write', 'manage', 'billing'],
  },
};

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: Role;
  permissions: string[];
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  tier: 'starter' | 'pro' | 'scale';
  stripeCustomerId?: string;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Check if user has permission
 */
export function hasPermission(
  userRole: Role,
  requiredPermission: string
): boolean {
  const roleDef = ROLES[userRole];
  if (!roleDef) return false;

  // Check general permissions
  if (roleDef.permissions.includes(requiredPermission)) {
    return true;
  }

  // Check specific permission
  const permissionMap: Record<string, keyof RoleDefinition> = {
    'read': 'read',
    'write': 'write',
    'manage': 'manage',
    'billing': 'billing',
  };

  const key = permissionMap[requiredPermission];
  return key ? (roleDef[key] as boolean) : false;
}

/**
 * Check if user can perform action on resource
 */
export function canPerform(
  userRole: Role,
  action: 'read' | 'write' | 'manage' | 'billing',
  resource?: string
): boolean {
  const roleDef = ROLES[userRole];
  if (!roleDef) return false;

  return roleDef[action];
}

/**
 * Get allowed actions for role
 */
export function getAllowedActions(role: Role): string[] {
  const roleDef = ROLES[role];
  return roleDef?.permissions || [];
}

/**
 * Check if role can be modified by other role
 */
export function canModifyRole(actorRole: Role, targetRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    viewer: 1,
    editor: 2,
    admin: 3,
    owner: 4,
  };

  const actorLevel = roleHierarchy[actorRole] || 0;
  const targetLevel = roleHierarchy[targetRole] || 0;

  // Can only modify roles below your level
  return actorLevel > targetLevel;
}

/**
 * Check if user can access module
 */
export function canAccessModule(
  userRole: Role,
  modulePermissions: string[]
): boolean {
  const roleDef = ROLES[userRole];
  if (!roleDef || !modulePermissions.length) return true; // Public module

  // Check if user has any of the required permissions
  return modulePermissions.some(permission =>
    roleDef.permissions.includes(permission)
  );
}

/**
 * Get role display name
 */
export function getRoleLabel(role: Role): string {
  return ROLES[role]?.label || role;
}

/**
 * Team permission utilities
 */
export const TeamPermissions = {
  /**
   * Check if user can invite members
   */
  canInviteMembers: (role: Role): boolean => canPerform(role, 'manage'),

  /**
   * Check if user can remove members
   */
  canRemoveMembers: (role: Role): boolean => canPerform(role, 'manage'),

  /**
   * Check if user can change billing
   */
  canChangeBilling: (role: Role): boolean => canPerform(role, 'billing'),

  /**
   * Check if user can activate modules
   */
  canActivateModules: (role: Role): boolean => canPerform(role, 'write'),

  /**
   * Check if user can manage team settings
   */
  canManageSettings: (role: Role): boolean => canPerform(role, 'manage'),
};

/**
 * Module-specific permissions
 */
export const ModulePermissions = {
  SALES_READ: 'sales.read',
  SALES_WRITE: 'sales.write',
  CRM_READ: 'crm.read',
  CRM_WRITE: 'crm.write',
  ANALYTICS_READ: 'analytics.read',
  EMAIL_WRITE: 'email.write',
  SUPPORT_WRITE: 'support.write',
  BRANDING_WRITE: 'branding.write',
};

export default ROLES;
