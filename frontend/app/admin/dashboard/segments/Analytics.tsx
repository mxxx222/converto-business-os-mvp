/** @fileoverview Analytics - Business metrics and performance monitoring */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/admin/ui/useToast";
import { useAuthedFetch } from "@/lib/admin/hooks/useAuthedFetch";
import { EmptyState, LoadingState } from "@/components/admin/ui/CommonStates";

type Card = { label: string; value: string; hint?: string };
type Series = { date: string; docs?: number|null; revenue?: number|null; api_p95_ms?: number|null; ocr_p95_ms?: number|null };

export default function Analytics(props: { adminToken?: string }) {
  // @ts-ignore
  const token = props.adminToken ?? (typeof window !== "undefined" ? (window.__ADMIN_TOKEN__ as string) : "");
  const apiBase = process.env.NEXT_PUBLIC_API_URL!;
  const fetcher = useAuthedFetch(token);
  const { show, Toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [range, setRange] = useState<"30d"|"90d">("30d");
  const [showForecast, setShowForecast] = useState(false);

  // Feature flag check
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false";

  useEffect(() => {
    if (!isEnabled) return;
    
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetcher(`${apiBase}/api/admin/analytics/cards?range=${range}`),
      fetcher(`${apiBase}/api/admin/analytics/series?range=${range}`),
    ]).then(([c,s]) => {
      if (!mounted) return;
      setCards(c.data || []);
      setSeries(s.data || []);
    }).catch((e:any) => show(e?.message||"Failed to load analytics","error"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, range, isEnabled]);

  // Calculate baseline forecast using moving average + trend
  const forecastData = useMemo(() => {
    if (!showForecast || series.length < 7) return [];
    
    const recentData = series.slice(-7); // Last 7 days for trend
    const avgDocs = recentData.reduce((sum, d) => sum + (d.docs || 0), 0) / recentData.length;
    const avgRevenue = recentData.reduce((sum, d) => sum + (d.revenue || 0), 0) / recentData.length;
    
    // Simple linear trend calculation
    const docsTrend = recentData.length > 1 ? 
      ((recentData[recentData.length - 1].docs || 0) - (recentData[0].docs || 0)) / recentData.length : 0;
    const revenueTrend = recentData.length > 1 ? 
      ((recentData[recentData.length - 1].revenue || 0) - (recentData[0].revenue || 0)) / recentData.length : 0;
    
    // Generate 7-day forecast
    const forecast = [];
    const lastDate = new Date(series[series.length - 1].date);
    
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(lastDate.getDate() + i);
      
      const forecastDocs = Math.max(0, avgDocs + (docsTrend * i));
      const forecastRevenue = Math.max(0, avgRevenue + (revenueTrend * i));
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        docs: Math.round(forecastDocs),
        revenue: Math.round(forecastRevenue * 100) / 100,
        confidence: Math.max(0.3, 0.9 - (i * 0.1)), // Decreasing confidence
        isForecast: true
      });
    }
    
    return forecast;
  }, [series, showForecast]);

  const csv = useMemo(() => {
    const header = ["date","docs","revenue","api_p95_ms","ocr_p95_ms"];
    const rows = series.map(d => [d.date, d.docs ?? "", d.revenue ?? "", d.api_p95_ms ?? "", d.ocr_p95_ms ?? ""]);
    return [header, ...rows].map(r => r.join(",")).join("\n");
  }, [series]);

  async function exportCSV() {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    a.download = `analytics_${range}.csv`; 
    a.click();
    URL.revokeObjectURL(url);
    show("Exported CSV","success");
  }

  async function exportPDF() {
    try {
      const res = await fetch(`${apiBase}/api/admin/analytics/export/pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ range }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; 
      a.download = `analytics_${range}.pdf`; 
      a.click();
      URL.revokeObjectURL(url);
      show("Exported PDF","success");
    } catch (e:any) {
      show(e?.message || "PDF export failed","error");
    }
  }

  async function scheduleExport() {
    try {
      const response = await fetch('/api/admin/analytics/export/schedule', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.text();
        show(`Export ${result} successfully`, "success");
      } else {
        throw new Error('Failed to schedule export');
      }
    } catch (e: any) {
      show(e?.message || "Export scheduling failed", "error");
    }
  }

  if (!isEnabled) return null;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Business metrics and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={range} 
            onChange={e => setRange(e.target.value as any)}
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showForecast}
              onChange={(e) => setShowForecast(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Forecast</span>
          </label>
          <button 
            className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors" 
            onClick={exportCSV}
          >
            Export CSV
          </button>
          <button 
            className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors" 
            onClick={exportPDF}
          >
            Export PDF
          </button>
          <button 
            className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors" 
            onClick={scheduleExport}
          >
            Schedule
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <LoadingState count={4} message="Loading analytics..." />
        </div>
      )}

      {!loading && !cards.length && (
        <EmptyState 
          icon="📊"
          title="No Analytics Data"
          description="Analytics data will appear here once available."
        />
      )}

      {!!cards.length && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {cards.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{c.label}</div>
                <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                {c.hint && <div className="text-xs text-gray-500 mt-1">{c.hint}</div>}
              </div>
            ))}
          </div>

          {!!series.length && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-3">
                Document Processing Trend
                {showForecast && forecastData.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600">(with 7-day forecast)</span>
                )}
              </div>
              <div className="flex items-end gap-1 h-32 bg-white rounded p-2">
                {/* Historical data */}
                {series.slice(-30).map((d, i) => {
                  const allData = [...series, ...forecastData];
                  const maxDocs = Math.max(1, ...allData.map(s => (s.docs ?? 0)));
                  const height = Math.max(2, Math.round(((d.docs ?? 0) / maxDocs) * 100));
                  return (
                    <div 
                      key={`hist-${i}`} 
                      className="bg-blue-500 hover:bg-blue-600 transition-colors" 
                      style={{ width: 6, height: `${height}%`, minHeight: '2px' }} 
                      title={`${d.date} docs: ${d.docs ?? "-"}`}
                    />
                  );
                })}
                {/* Forecast data */}
                {showForecast && forecastData.map((d, i) => {
                  const allData = [...series, ...forecastData];
                  const maxDocs = Math.max(1, ...allData.map(s => (s.docs ?? 0)));
                  const height = Math.max(2, Math.round(((d.docs ?? 0) / maxDocs) * 100));
                  const opacity = d.confidence || 0.5;
                  return (
                    <div 
                      key={`forecast-${i}`} 
                      className="bg-orange-400 hover:bg-orange-500 transition-colors forecast" 
                      style={{ 
                        width: 6, 
                        height: `${height}%`, 
                        minHeight: '2px',
                        opacity: opacity
                      }} 
                      title={`${d.date} forecast: ${d.docs} (${Math.round((d.confidence || 0) * 100)}% confidence)`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Showing last 30 data points from {range} range
                {showForecast && (
                  <span className="ml-2 text-orange-600">
                    • Orange bars = forecast (opacity = confidence)
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <Toast />
    </section>
  );
}