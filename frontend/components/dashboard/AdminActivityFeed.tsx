'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  severity: string;
  source: string;
  tenant_id: string;
  timestamp: string;
}

type FeedEvent =
  | { type: 'activity'; data: Activity; timestamp: number }
  | { type: 'ready' | 'heartbeat' | 'pong' | 'error'; [key: string]: any };

const severityColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900',
};

const severityLabels: Record<string, string> = {
  info: 'Info',
  warning: 'Varoitus',
  error: 'Virhe',
  critical: 'Kriittinen',
};

function getBackendWsUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_BACKEND_WS_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) return null;
  const normalized = base.replace(/^http(s?):\/\//, (_m, s) => `ws${s || ''}://`);
  return `${normalized.replace(/\/$/, '')}/api/admin/feed`;
}

export default function AdminActivityFeed() {
  const [events, setEvents] = useState<Activity[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    let ws: WebSocket | null = null;
    let cancelled = false;

    async function connect() {
      const url = getBackendWsUrl();
      if (!url) {
        setStatus('error');
        console.error('Missing NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_BACKEND_WS_URL for admin WebSocket');
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        setStatus('error');
        return;
      }

      ws = new WebSocket(url);

      ws.onopen = () => {
        if (cancelled) return;
        setStatus('connected');
        ws?.send(
          JSON.stringify({
            type: 'auth',
            token,
          }),
        );
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data: FeedEvent = JSON.parse(event.data);
          if (data.type === 'activity') {
            const activity = data.data as Activity;
            setEvents((prev) => {
              const existingIdx = prev.findIndex((a) => a.id === activity.id);
              const next = existingIdx >= 0 ? [...prev] : [activity, ...prev];
              if (existingIdx >= 0) {
                next[existingIdx] = activity;
              }
              return next.slice(0, 100);
            });
          }
        } catch (err) {
          console.error('Failed to parse admin activity event', err);
        }
      };

      ws.onerror = () => {
        if (cancelled) return;
        setStatus('error');
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus('error');
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }),
    [events],
  );

  if (status === 'error') {
    return (
      <div className="p-4 text-sm text-red-700">
        Ylläpitäjän reaaliaikaisen aktiviteettivirran avaaminen epäonnistui.
      </div>
    );
  }

  return (
    <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
      {sortedEvents.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">Ei aktiviteetteja vielä.</div>
      ) : (
        sortedEvents.map((event) => {
          const sevKey = (event.severity || 'info').toLowerCase();
          const sevClass = severityColors[sevKey] ?? severityColors.info;
          const sevLabel = severityLabels[sevKey] ?? severityLabels.info;

          return (
            <div key={event.id} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sevClass}`}>
                    {sevLabel}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-1 text-xs text-gray-600">{event.description}</p>
                )}
                <p className="mt-1 text-[11px] text-gray-400">
                  {new Date(event.timestamp).toLocaleString('fi-FI', {
                    timeZone: 'Europe/Helsinki',
                  })}{' '}
                  · {event.type} · {event.tenant_id}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}


