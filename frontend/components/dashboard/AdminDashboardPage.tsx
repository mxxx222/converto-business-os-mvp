'use client';

import { useEffect, useState } from 'react';
import { cfg } from '@/lib/config';
import AdminActivityFeed from './AdminActivityFeed';

interface AdminSummary {
  tenant_id: string;
  total_activities: number;
  activities_by_type: Record<string, number>;
  recent_activity_count: number;
  timestamp: string;
}

interface AdminDashboardState {
  loading: boolean;
  error: string | null;
  summary: AdminSummary | null;
}

export default function AdminDashboardPage() {
  const [state, setState] = useState<AdminDashboardState>({
    loading: true,
    error: null,
    summary: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const supabaseClientModule = await import('@/lib/supabase/client');
        const supabase = supabaseClientModule.createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;
        const baseUrl = cfg.backendUrl;
        const url = `${baseUrl.replace(/\/$/, '')}/api/admin/summary`;

        const res = await fetch(url, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }
        const json = await res.json();
        if (!isMounted) return;
        setState({
          loading: false,
          error: null,
          summary: json,
        });
      } catch (error: any) {
        if (!isMounted) return;
        setState({
          loading: false,
          error: 'Ylläpitäjän yhteenvetotietojen lataaminen epäonnistui.',
          summary: null,
        });
        console.error('Failed to load admin summary', error);
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const { loading, error, summary } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ylläpitäjän hallintapaneeli</h1>
          <p className="mt-2 text-sm text-gray-600">
            Seuraa DocFlow-järjestelmän tapahtumia ja tilaa reaaliaikaisesti.
          </p>
        </header>

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
            Ladataan tietoja…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {summary && (
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Tapahtumia yhteensä
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {summary.total_activities}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Viimeisen tunnin aikana
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {summary.recent_activity_count}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Tenantti
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">{summary.tenant_id}</p>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Aktiviteettivirta</h2>
          <div className="rounded-lg border border-gray-200 bg-white">
            <AdminActivityFeed />
          </div>
        </section>
      </div>
    </div>
  );
}


