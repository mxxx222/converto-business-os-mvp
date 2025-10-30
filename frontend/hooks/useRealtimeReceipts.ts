/**
 * React hook for realtime receipts subscription.
 * Subscribes to Supabase Realtime changes for the receipts table.
 */
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Receipt } from '@/types/receipt';

export function useRealtimeReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadInitialReceipts = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('receipts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (fetchError) throw fetchError;
        setReceipts(data || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load receipts'));
        setLoading(false);
      }
    };

    const setupRealtime = () => {
      channel = supabase
        .channel('receipts-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'receipts',
          },
          (payload) => {
            console.log('New receipt inserted (realtime):', payload.new);
            setReceipts((prev) => [payload.new as Receipt, ...prev]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'receipts',
          },
          (payload) => {
            console.log('Receipt updated (realtime):', payload.new);
            setReceipts((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Receipt) : r))
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'receipts',
          },
          (payload) => {
            console.log('Receipt deleted (realtime):', payload.old);
            setReceipts((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to receipts realtime channel');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to receipts realtime channel');
            setError(new Error('Failed to subscribe to realtime updates'));
          }
        });
    };

    loadInitialReceipts();
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return { receipts, loading, error };
}

