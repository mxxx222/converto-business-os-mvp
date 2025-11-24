/**
 * RBAC (Role-Based Access Control) for Admin Dashboard
 * Roles: admin > support > readonly
 */

export type AdminRole = 'admin' | 'support' | 'readonly';

export interface AdminTokenPayload {
  role: AdminRole;
  tenantId?: string;
  userId?: string;
  exp?: number;
}

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  admin: 3,
  support: 2,
  readonly: 1
};

/**
 * Verify admin token and extract payload
 */
export function verifyAdminToken(token: string | null | undefined): AdminTokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    // In production, use proper JWT verification
    // For MVP, we'll do basic validation
    const adminSecret = process.env.ADMIN_JWT_SECRET;
    if (!adminSecret) {
      console.warn('ADMIN_JWT_SECRET not configured');
      return null;
    }

    // Simple token validation (replace with proper JWT library in production)
    if (token === adminSecret || token.startsWith('admin_')) {
      // Extract role from token (simplified)
      let role: AdminRole = 'readonly';
      if (token.includes('admin')) {
        role = 'admin';
      } else if (token.includes('support')) {
        role = 'support';
      }

      return {
        role,
        tenantId: 'default',
        userId: 'system'
      };
    }

    // Try to decode as JWT (basic check)
    const parts = token.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.role && ROLE_HIERARCHY[payload.role as AdminRole]) {
          return payload as AdminTokenPayload;
        }
      } catch {
        // Invalid JWT format
      }
    }

    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Require admin authentication
 * Returns 401 if no token, 403 if insufficient role
 */
export function requireAdminAuth(
  token: string | null | undefined,
  requiredRole: AdminRole = 'readonly'
): AdminTokenPayload {
  const payload = verifyAdminToken(token);
  
  if (!payload) {
    throw new Error('UNAUTHORIZED'); // Will be caught and converted to 401
  }

  if (!hasRole(payload.role, requiredRole)) {
    throw new Error('FORBIDDEN'); // Will be caught and converted to 403
  }

  return payload;
}

/**
 * Assert role requirement (for use in API routes)
 */
export function assertRole(
  token: string | null | undefined,
  requiredRole: AdminRole = 'readonly'
): AdminTokenPayload {
  return requireAdminAuth(token, requiredRole);
}

/**
 * Get admin token from request headers
 */
export function getAdminTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return headers.get('X-Admin-Token');
}

/**
 * Create 401 Unauthorized response
 */
export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Unauthorized', message: 'Missing or invalid admin token' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create 403 Forbidden response
 */
export function createForbiddenResponse(requiredRole: AdminRole): Response {
  return new Response(
    JSON.stringify({
      error: 'Forbidden',
      message: `Insufficient permissions. Required role: ${requiredRole}`
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

