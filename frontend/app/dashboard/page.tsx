'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Receipt } from '@/types/receipt';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error('Error fetching user:', error);
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
      // Cleanup: unsubscribe from realtime
      supabase.removeAllChannels();
    };
  }, []);

  const loadReceipts = async () => {
    try {
      // Fetch receipts from backend API or Supabase directly
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
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to receipts table changes
    const channel: RealtimeChannel = supabase
      .channel('receipts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'receipts',
        },
        (payload) => {
          console.log('New receipt inserted:', payload.new);
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
          console.log('Receipt updated:', payload.new);
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
          console.log('Receipt deleted:', payload.old);
          setReceipts((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return channel;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <a
            href="/premium"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Logged in as:</p>
            <p className="text-lg font-semibold">{user.email || user.id}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Receipts (Live Updates)</h2>
          {receipts.length === 0 ? (
            <p className="text-gray-500">No receipts yet. Upload one to get started!</p>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{receipt.vendor || 'Unknown Vendor'}</h3>
                      <p className="text-sm text-gray-600">
                        {receipt.total_amount ? `${receipt.total_amount}€` : 'Amount not set'}
                      </p>
                      {receipt.created_at && (
                        <p className="text-xs text-gray-400">
                          {new Date(receipt.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {receipt.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {receipt.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

