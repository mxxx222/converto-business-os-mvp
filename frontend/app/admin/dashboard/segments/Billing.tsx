/** @fileoverview Billing - Stripe events and revenue metrics */

"use client";

import { useEffect, useState } from "react";
import { useAuthedFetch } from "@/lib/admin/hooks/useAuthedFetch";
import { EmptyState, LoadingState } from "@/components/admin/ui/CommonStates";

type StripeEvt = { id: string; type: string; created: number; amount?: number|null; currency?: string|null };
type Card = { label: string; value: string };

export default function Billing(props: { adminToken?: string }) {
  // @ts-ignore
  const token = props.adminToken ?? (typeof window !== "undefined" ? (window.__ADMIN_TOKEN__ as string) : "");
  const apiBase = process.env.NEXT_PUBLIC_API_URL!;
  const fetcher = useAuthedFetch(token);
  const [cards, setCards] = useState<Card[]>([]);
  const [events, setEvents] = useState<StripeEvt[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // Feature flag check
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_BILLING !== "false";

  useEffect(() => {
    if (!isEnabled) return;

    let mounted = true;
    setLoading(true);
    Promise.all([
      fetcher(`${apiBase}/api/admin/billing/cards`),
      fetcher(`${apiBase}/api/admin/billing/events${cursor ? `?starting_after=${cursor}` : ""}`),
    ]).then(([c,e]) => { 
      if(!mounted) return; 
      setCards(c.data||[]); 
      setEvents(e.data||[]); 
    })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, cursor, isEnabled]);

  const stripeDash = process.env.STRIPE_DASHBOARD_URL || "https://dashboard.stripe.com";

  if (!isEnabled) return null;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Billing</h2>
          <p className="text-sm text-gray-600 mt-1">
            Subscription and revenue management
          </p>
        </div>
        <a 
          className="text-sm bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 transition-colors" 
          href={stripeDash} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Open in Stripe
        </a>
      </div>

      {loading && (
        <div className="space-y-4">
          <LoadingState count={3} message="Loading billing data..." />
        </div>
      )}

      {!loading && !cards.length && (
        <EmptyState 
          icon="💰"
          title="No Billing Data"
          description="Billing metrics will appear here once Stripe is connected."
        />
      )}

      {!!cards.length && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {cards.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{c.label}</div>
                <div className="text-2xl font-bold text-gray-900">{c.value}</div>
              </div>
            ))}
          </div>

          {!!events.length && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-3">Latest Stripe Events</div>
              <div className="bg-white rounded border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.slice(0,10).map((ev) => (
                      <tr key={ev.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs">{ev.type}</td>
                        <td className="px-3 py-2">
                          {ev.amount != null ? `${(ev.amount/100).toFixed(2)} ${ev.currency?.toUpperCase()||""}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-500">
                          {new Date(ev.created*1000).toLocaleString('fi-FI')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {events.length > 10 && (
                <div className="mt-3 text-right">
                  <button 
                    className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors" 
                    onClick={() => setCursor(events.at(-1)?.id || null)}
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}