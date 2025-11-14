'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminDashboardPage from '@/components/dashboard/AdminDashboardPage';

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) {
        router.replace('/login');
        return;
      }

      const user: any = session.user ?? {};
      const appMeta = user.app_metadata ?? {};
      const userMeta = user.user_metadata ?? {};
      const role =
        (appMeta.role as string) ??
        (userMeta.role as string) ??
        (appMeta.user_role as string) ??
        (userMeta.user_role as string) ??
        'user';

      if (!role.toLowerCase().startsWith('admin')) {
        router.replace('/');
        return;
      }

      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Ladataan ylläpitäjän näkymää…</p>
      </div>
    );
  }

  return <AdminDashboardPage />;
}



