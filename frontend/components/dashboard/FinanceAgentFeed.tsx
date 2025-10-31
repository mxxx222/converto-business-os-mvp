'use client';

import { useEffect, useState } from 'react';
import { Brain, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';

interface AgentInsight {
  id: string;
  category: string;
  insight_type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: {
    title?: string;
    recommendation?: string;
    confidence?: number;
  };
}

export function FinanceAgentFeed({ tenantId }: { tenantId?: string }) {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      // Use demo data if no tenantId
      setInsights([
        {
          id: '1',
          category: 'spending_alert',
          insight_type: 'anomaly',
          message: 'Ruokakulut kasvoivat 35% viime kuuhun verrattuna',
          severity: 'warning',
          metadata: {
            title: 'Kulutuspoikkeama havaittu',
            recommendation: 'Tarkista toistuvat tilaukset ja etsi säästömahdollisuuksia',
            confidence: 0.87,
          },
        },
        {
          id: '2',
          category: 'tax_optimization',
          insight_type: 'opportunity',
          message: 'Voi olla oikeutettu ALV-vähennykseen 250€ edestä',
          severity: 'info',
          metadata: {
            title: 'Verooptimointimahdollisuus',
            recommendation: 'Keskustele kirjanpitäjän kanssa ALV-vähennyksistä',
            confidence: 0.75,
          },
        },
      ]);
      setLoading(false);
      return;
    }

    // Fetch from FinanceAgent API
    fetch(`/api/v1/finance-agent/insights?tenant_id=${tenantId}&days_back=30`)
      .then((res) => res.json())
      .then((data) => {
        setInsights(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load FinanceAgent insights:', err);
        setLoading(false);
      });
  }, [tenantId]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            FinanceAgent Insights
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            FinanceAgent Insights
          </h3>
        </div>
        {insights.length > 0 && (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
            {insights.length} uutta
          </span>
        )}
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Ei aktiivisia insights. FinanceAgent analysoi dataasi ja ilmoittaa tärkeistä havainnoista.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getSeverityIcon(insight.severity)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {insight.metadata?.title || insight.message}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {insight.message}
                  </p>
                  {insight.metadata?.recommendation && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-700/50 rounded text-sm">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        💡 Suositus:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {insight.metadata.recommendation}
                      </p>
                    </div>
                  )}
                  {insight.metadata?.confidence && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-purple-600 h-1.5 rounded-full"
                          style={{ width: `${insight.metadata.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(insight.metadata.confidence * 100).toFixed(0)}% luottamus
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

