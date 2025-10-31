'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import type { Receipt } from '../../types/receipt';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { OSLayout } from '../../components/dashboard/OSLayout';
import { KPIWidget } from '../../components/dashboard/KPIWidget';
import { FinanceAgentFeed } from '../../components/dashboard/FinanceAgentFeed';
import { ReceiptList } from '../../components/dashboard/ReceiptList';
import { showToast } from '../../components/dashboard/Toast';
import { Euro, TrendingUp, Receipt as ReceiptIcon, Zap, Workflow } from 'lucide-react';
import Link from 'next/link';

const SUPABASE_CONFIGURED = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [kpis, setKpis] = useState({
    cashFlow: { value: '0', change: 0 },
    monthlySpending: { value: '0', change: 0 },
    receiptsProcessed: { value: 0, change: 0 },
    aiInsights: { value: 0 },
  });

  const supabase = createClient();

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      setSupabaseError('Supabase ei ole konfiguroitu');
      return;
    }

    // Get current user
    supabase.auth.getUser().then(({ data: { user }, error }: any) => {
      if (error) {
        console.error('Error fetching user:', error);
        setSupabaseError(error.message || 'Virhe käyttäjän haussa');
        setLoading(false);
        return;
      }
      setUser(user);
      if (user) {
        loadReceipts();
        setupRealtimeSubscription();
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (typeof supabase.removeAllChannels === 'function') {
        supabase.removeAllChannels();
      }
    };
  }, []);

  useEffect(() => {
    // Calculate KPIs from receipts
    if (receipts.length > 0) {
      const total = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const monthly = receipts.filter(
        (r) => r.created_at && new Date(r.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const monthlyTotal = monthly.reduce((sum, r) => sum + (r.total_amount || 0), 0);

      setKpis({
        cashFlow: {
          value: total.toFixed(2) + '€',
          change: 12.5, // Mock - would calculate from previous period
        },
        monthlySpending: {
          value: monthlyTotal.toFixed(2) + '€',
          change: -5.2, // Mock
        },
        receiptsProcessed: {
          value: receipts.length,
          change: receipts.length > 0 ? 15.0 : 0,
        },
        aiInsights: {
          value: 3, // Mock - would fetch from FinanceAgent
        },
      });

      if (!loading) {
        showToast(`${receipts.length} kuittia ladattu`, 'success');
      }
    }
  }, [receipts, loading]);

  const loadReceipts = async () => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReceipts(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading receipts:', error);
      setSupabaseError('Virhe kuitteja ladatessa');
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!SUPABASE_CONFIGURED) {
      return;
    }

    const channel = supabase
      .channel('receipts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'receipts',
        },
        (payload: RealtimePostgresChangesPayload<Receipt>) => {
          console.log('New receipt inserted:', payload.new);
          setReceipts((prev) => [payload.new as Receipt, ...prev]);
          showToast('Uusi kuitti lisätty', 'success');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'receipts',
        },
        (payload: RealtimePostgresChangesPayload<Receipt>) => {
          const updatedReceipt = payload.new as Receipt;
          if (updatedReceipt?.id) {
            setReceipts((prev) =>
              prev.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r))
            );
          }
        }
      )
      .subscribe();

    return channel;
  };

  if (loading) {
    return (
      <OSLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600 dark:text-gray-400">Ladataan dashboardia...</div>
        </div>
      </OSLayout>
    );
  }

  if (supabaseError || !SUPABASE_CONFIGURED) {
    return (
      <OSLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <div className="text-6xl mb-4">⚙️</div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Supabase ei ole konfiguroitu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Dashboard tarvitsee Supabase-ympäristömuuttujat toimiakseen täysin.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Lisää frontend/.env.local:
              </p>
              <code className="text-xs text-blue-800 dark:text-blue-200 block whitespace-pre-wrap">
                NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{'\n'}
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
              </code>
            </div>
            <div className="space-y-2">
              <a
                href="/premium"
                className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siirry marketing-sivulle
              </a>
            </div>
          </div>
        </div>
      </OSLayout>
    );
  }

  if (!user) {
    return (
      <OSLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Kirjautuminen vaaditaan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Kirjaudu sisään nähdäksesi dashboardin.
            </p>
            <a
              href="/premium"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siirry etusivulle
            </a>
          </div>
        </div>
      </OSLayout>
    );
  }

  return (
    <OSLayout currentPath="/dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tervetuloa takaisin{user.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tässä on yhteenveto yrityksestäsi tänään.
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIWidget
            title="Kassavirta"
            value={kpis.cashFlow.value}
            change={kpis.cashFlow.change}
            changeLabel="vs. edellinen kuukausi"
            icon={<Euro className="w-5 h-5" />}
            color="green"
            loading={loading}
          />
          <KPIWidget
            title="Kuukausikulut"
            value={kpis.monthlySpending.value}
            change={kpis.monthlySpending.change}
            changeLabel="vs. edellinen kuukausi"
            icon={<TrendingUp className="w-5 h-5" />}
            color="orange"
            loading={loading}
          />
          <KPIWidget
            title="Käsitellyt kuitit"
            value={kpis.receiptsProcessed.value.toString()}
            change={kpis.receiptsProcessed.change}
            changeLabel="tänään"
            icon={<ReceiptIcon className="w-5 h-5" />}
            color="blue"
            loading={loading}
          />
          <KPIWidget
            title="AI Insights"
            value={kpis.aiInsights.value.toString()}
            changeLabel="aktiiviset"
            icon={<Zap className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FinanceAgent Feed - Takes 2 columns */}
          <div className="lg:col-span-2">
            <FinanceAgentFeed tenantId={user.id} />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nopeat toiminnot
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left font-medium">
                  + Lisää kuitti
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left font-medium">
                  📊 Näytä raportti
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left font-medium">
                  ⚙️ Asetukset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Receipts */}
        <ReceiptList receipts={receipts} loading={loading} />
      </div>
    </OSLayout>
  );
}
