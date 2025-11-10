/** @fileoverview API Monitoring - Route performance and health metrics */

"use client";

import { useEffect, useState } from "react";
import { EmptyState, LoadingState } from "@/components/admin/ui/CommonStates";

type RouteStats = { 
  route: string; 
  status5xx: number; 
  rate5xx: number; 
  p95_ms: number; 
  req_rate: number; 
};

export default function ApiMonitoring() {
  const [rows, setRows] = useState<RouteStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Feature flag check
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_API_MON !== "false";

  useEffect(() => {
    if (!isEnabled) return;

    setLoading(true);
    fetch("/api/admin/monitoring/summary", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setRows(j.data || []))
      .catch(err => console.error("Failed to load API monitoring:", err))
      .finally(() => setLoading(false));
  }, [isEnabled]);

  if (!isEnabled) return null;

  const getStatusColor = (rate: number) => {
    if (rate > 0.05) return "text-red-600"; // > 5%
    if (rate > 0.01) return "text-yellow-600"; // > 1%
    return "text-green-600";
  };

  const getLatencyColor = (p95: number) => {
    if (p95 > 1000) return "text-red-600"; // > 1s
    if (p95 > 500) return "text-yellow-600"; // > 500ms
    return "text-green-600";
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">API Monitoring</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time API performance and health metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Live Data</span>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <LoadingState count={3} message="Loading API metrics..." />
        </div>
      )}

      {!loading && !rows.length && (
        <EmptyState 
          icon="🔧"
          title="No API Data"
          description="API monitoring data will appear here once routes are active."
        />
      )}

      {!!rows.length && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-3">Route Performance Summary</div>
          <div className="bg-white rounded border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-3 py-2 font-medium">Route</th>
                  <th className="px-3 py-2 font-medium">p95 Latency</th>
                  <th className="px-3 py-2 font-medium">Error Rate</th>
                  <th className="px-3 py-2 font-medium">Throughput</th>
                  <th className="px-3 py-2 font-medium">5xx Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((x, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{x.route}</td>
                    <td className={`px-3 py-2 font-semibold ${getLatencyColor(x.p95_ms)}`}>
                      {x.p95_ms.toFixed(0)} ms
                    </td>
                    <td className={`px-3 py-2 font-semibold ${getStatusColor(x.rate5xx)}`}>
                      {(x.rate5xx * 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-2">{x.req_rate.toFixed(2)} req/s</td>
                    <td className="px-3 py-2 text-gray-600">{x.status5xx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Last updated: {new Date().toLocaleTimeString('fi-FI')}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Good (&lt;1%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Warning (1-5%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Critical (&gt;5%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}