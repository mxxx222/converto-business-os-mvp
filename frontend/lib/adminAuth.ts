/** @fileoverview Admin authentication utility for API routes with RBAC */

import { verifyAdminToken } from '@/lib/admin/adminToken';

export type AdminRole = 'admin' | 'support' | 'readonly';

export async function requireAdminAuth(req: Request): Promise<{tenantId: string; role: AdminRole}> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const payload = verifyAdminToken(token); // validates signature + expiry
  if (!payload) throw new Response('Unauthorized', { status: 401 });
  const { tenantId, role } = payload;
  if (!tenantId) throw new Response('Unauthorized', { status: 401 });
  if (!['admin','support','readonly'].includes(role)) {
    throw new Response('Forbidden', { status: 403 });
  }
  return { tenantId, role: role as AdminRole };
}

export function assertRole(role: AdminRole, allowed: AdminRole[]) {
  if (!allowed.includes(role)) throw new Response('Forbidden', { status: 403 });
}

