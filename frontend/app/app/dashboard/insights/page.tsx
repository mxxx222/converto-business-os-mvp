'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/useAuth';
import { useRealtimeInsights } from '@/hooks/useRealtimeInsights';
import { useMonitoring } from '@/hooks/useMonitoring';
import { useAnalytics, useFeatureTracking } from '@/hooks/useAnalytics';
import { fetchInsights } from '@/lib/api/finance-agent';
import { OSLayout } from '@/components/dashboard/OSLayout';
import { TrendingUp, AlertCircle, Lightbulb, Target, Loader } from 'lucide-react';
import Link from 'next/link';
import type { InsightUpdate } from '@/lib/realtime/subscriptions';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'achievement';
  impact: 'high' | 'medium' | 'low';
  action?: string;
  action_url?: string;
  confidence: number;
  created_at: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, team } = useAuth();
  const { trackPageView } = useAnalytics();
  const { trackInsightsView } = useFeatureTracking();

  // Initialize monitoring
  useMonitoring();

  // Track analytics
  useEffect(() => {
    trackPageView('insights_dashboard');
    trackInsightsView();
  }, [trackPageView, trackInsightsView]);

  // Subscribe to realtime insights
  useRealtimeInsights((newInsight: InsightUpdate) => {
    setInsights((prev) => {
      // Tarkista onko insight jo olemassa
      const exists = prev.some((i) => i.id === newInsight.id);
      if (!exists) {
        return [{ ...newInsight, created_at: new Date().toISOString() } as Insight, ...prev];
      }
      return prev;
    });
  });

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInsights();
      setInsights(data.insights || []);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Virhe ladattaessa insights-dataa');
      // Fallback: use demo insights
      setInsights(getDemoInsights());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const getDemoInsights = (): Insight[] => [
    {
      id: '1',
      title: 'Kassavirta-ongelma heinäkuussa',
      description:
        'Kulujen kasvu 45% viime kuusta. Pääasiassa palkat ja vuokra. Suositus: Tarkista palkkasumma.',
      type: 'warning',
      impact: 'high',
      action: 'Tarkista palkkasumma',
      action_url: '/app/dashboard/reports?period=last_month',
      confidence: 0.95,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Mahdollisuus ALV-optimointiin',
      description: 'Voit hyödyntää ALV-vähennyksiä paremmin. Potentiaalinen säästö: 2400€/vuosi.',
      type: 'opportunity',
      impact: 'high',
      action: 'Katso ALV-raportti',
      action_url: '/app/dashboard/reports?type=vat',
      confidence: 0.88,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Kuitit käsitelty 100%',
      description: 'Kaikki tämän kuukauden kuitit on käsitelty ja tarkistettu. Nolla virheitä!',
      type: 'achievement',
      impact: 'low',
      confidence: 1.0,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Uudet asiakkaat',
      description: '3 uutta asiakasta viime viikolla. Liikevaihto kasvoi 12%.',
      type: 'recommendation',
      impact: 'medium',
      action: 'Näytä asiakasraportti',
      action_url: '/app/dashboard/reports?type=customers',
      confidence: 0.92,
      created_at: new Date().toISOString(),
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="text-green-500" size={24} />;
      case 'warning':
        return <AlertCircle className="text-orange-500" size={24} />;
      case 'recommendation':
        return <Lightbulb className="text-blue-500" size={24} />;
      case 'achievement':
        return <Target className="text-purple-500" size={24} />;
      default:
        return null;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'Mahdollisuus';
      case 'warning':
        return 'Varoitus';
      case 'recommendation':
        return 'Suositus';
      case 'achievement':
        return 'Saavutus';
      default:
        return type;
    }
  };

  return (
    <OSLayout currentPath="/app/dashboard/insights">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automaattiset suositukset liiketoimintasi optimoimiseksi (Realtime)
          </p>
        </div>

        {/* Yhteenveto */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Mahdollisuudet</p>
            <p className="text-2xl font-bold text-green-600">
              {insights.filter((i) => i.type === 'opportunity').length}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Varoitukset</p>
            <p className="text-2xl font-bold text-orange-600">
              {insights.filter((i) => i.type === 'warning').length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Suositukset</p>
            <p className="text-2xl font-bold text-blue-600">
              {insights.filter((i) => i.type === 'recommendation').length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Saavutukset</p>
            <p className="text-2xl font-bold text-purple-600">
              {insights.filter((i) => i.type === 'achievement').length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader className="inline-block animate-spin h-8 w-8 text-green-500" />
            <p className="text-gray-600 dark:text-gray-400 mt-2">Ladataan insights...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Näytetään demo-data</p>
          </div>
        )}

        {/* Insights-lista */}
        <div className="grid gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`border rounded-lg p-6 ${getImpactColor(insight.impact)} transition hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(insight.type)}</div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {insight.title}
                      </h3>
                      <span className="inline-block text-xs font-semibold px-2 py-1 bg-white dark:bg-gray-800 rounded mt-1">
                        {getTypeLabel(insight.type)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-white dark:bg-gray-800 rounded text-gray-900 dark:text-white">
                      {Math.round(insight.confidence * 100)}% varmuus
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {insight.description}
                  </p>

                  {insight.action && insight.action_url && (
                    <Link
                      href={insight.action_url}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      → {insight.action}
                    </Link>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-4 pt-4 border-t border-current border-opacity-10">
                {new Date(insight.created_at).toLocaleDateString('fi-FI', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>

        {insights.length === 0 && !loading && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
            <Lightbulb size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Ei insights-dataa saatavilla</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Insights päivittyvät automaattisesti kun dataa kertyy
            </p>
          </div>
        )}
      </div>
    </OSLayout>
  );
}
