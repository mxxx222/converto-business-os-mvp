import { cookies } from 'next/headers';
import { signAdminToken, validateAdminEnv } from '@/lib/admin/adminToken';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Admin Dashboard - DocFlow',
  description: 'Complete admin control plane with real-time monitoring and management'
};

export default async function AdminDashboardPage() {
  // Validate admin environment at runtime (not build time)
  if (process.env.NODE_ENV === 'production') {
    try {
      validateAdminEnv();
    } catch (error) {
      console.error('Admin environment validation failed:', error);
    }
  }
  
  // In production, derive these from session/auth
  const role = process.env.ADMIN_REQUIRED_ROLE || 'admin';
  const tenantId = 'tenant-1'; // TODO: Get from session/auth
  const sub = 'admin@docflow.fi'; // TODO: Get from session/auth
  
  // Mint short-lived admin JWT (10-15 min expiration)
  const adminToken = signAdminToken({ sub, role, tenantId });

  // Set httpOnly cookie for SSR/middleware
  const cookieStore = await cookies();
  cookieStore.set('admin_token', adminToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60, // 15 minutes
  });

  return (
    <AdminDashboardClient
      adminToken={adminToken}
      tenantId={tenantId}
      apiUrl={process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '')}
      wsUrl={process.env.NEXT_PUBLIC_WS_URL || (process.env.NODE_ENV === 'development' ? 'ws://localhost:8000' : '')}
    />
  );
}
