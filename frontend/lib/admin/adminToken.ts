/** @fileoverview Admin JWT token signing and verification utilities */

import jwt from 'jsonwebtoken';

/**
 * Validate required admin environment variables at startup
 * Throws error if critical variables are missing
 */
export function validateAdminEnv(): void {
  const required = [
    'ADMIN_JWT_SECRET',
    'NEXT_PUBLIC_API_URL', 
    'NEXT_PUBLIC_WS_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const error = `Missing required admin environment variables: ${missing.join(', ')}`;
    console.error('❌ Admin ENV Validation Failed:', error);
    throw new Error(error);
  }
  
  console.log('✅ Admin environment variables validated');
}

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-admin-secret-change-in-production';
const ADMIN_REQUIRED_ROLE = process.env.ADMIN_REQUIRED_ROLE || 'admin';

export interface AdminTokenPayload {
  sub: string;
  role: string;
  tenantId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign an admin JWT token with 10-15 minute expiration
 */
export function signAdminToken(payload: { sub: string; role: string; tenantId?: string }): string {
  const expiresIn = 15 * 60; // 15 minutes
  return jwt.sign(
    {
      sub: payload.sub,
      role: payload.role,
      tenantId: payload.tenantId,
    },
    ADMIN_SECRET,
    {
      expiresIn,
      issuer: 'docflow-admin',
      audience: 'docflow-admin-dashboard',
    }
  );
}

/**
 * Verify an admin JWT token
 */
export function verifyAdminToken(token: string | undefined): AdminTokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET, {
      issuer: 'docflow-admin',
      audience: 'docflow-admin-dashboard',
    }) as AdminTokenPayload;

    // Verify role
    if (decoded.role !== ADMIN_REQUIRED_ROLE) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

