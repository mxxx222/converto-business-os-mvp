import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type ReceiptStatus = 'pending' | 'processed' | 'error';
export type InsightType = 'opportunity' | 'warning' | 'recommendation' | 'achievement';

export interface ReceiptUpdate {
  id: string;
  filename?: string;
  status: ReceiptStatus;
  amount?: number;
  vat_amount?: number;
  error_message?: string;
  created_at?: string;
}

export interface InsightUpdate {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

export interface TeamUpdate {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  joined_at: string;
}

export class RealtimeManager {
  private supabase = createClient();
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Subscribe to receipt updates (real-time)
   */
  subscribeToReceipts(
    userId: string,
    onUpdate: (receipt: ReceiptUpdate) => void,
    onError: (error: Error) => void
  ): () => void {
    const channelName = `receipts:${userId}`;

    // Tarkista onko kanava jo olemassa
    if (this.channels.has(channelName)) {
      const listeners = this.listeners.get(channelName) || new Set();
      listeners.add(onUpdate);
      this.listeners.set(channelName, listeners);
      return () => {
        const listeners = this.listeners.get(channelName);
        if (listeners) {
          listeners.delete(onUpdate);
        }
      };
    }

    const channel = this.supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: userId },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'receipts',
          filter: `team_id=eq.${userId}`,
        },
        (payload: any) => {
          const receipt: ReceiptUpdate = {
            id: payload.new?.id || payload.old?.id || '',
            filename: payload.new?.filename || payload.old?.filename,
            status: (payload.new?.status || payload.old?.status) as ReceiptStatus,
            amount: payload.new?.amount || payload.old?.amount,
            vat_amount: payload.new?.vat_amount || payload.old?.vat_amount,
            error_message: payload.new?.error_message || payload.old?.error_message,
            created_at: payload.new?.created_at || payload.old?.created_at,
          };

          // Kutsua kaikki listeners
          const listeners = this.listeners.get(channelName) || new Set();
          listeners.forEach((listener) => {
            try {
              listener(receipt);
            } catch (error) {
              console.error('Error in receipt listener:', error);
            }
          });
        }
      )
      .on('system', { event: 'error' }, (err: any) => {
        console.error('Realtime error:', err);
        onError(new Error(err.message || 'Realtime connection error'));
      })
      .subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
      });

    this.channels.set(channelName, channel);

    // Lisää listener
    const listeners = this.listeners.get(channelName) || new Set();
    listeners.add(onUpdate);
    this.listeners.set(channelName, listeners);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(channelName);
      if (listeners) {
        listeners.delete(onUpdate);
        if (listeners.size === 0) {
          this.supabase.removeChannel(channel);
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  /**
   * Subscribe to insights updates (real-time)
   */
  subscribeToInsights(
    userId: string,
    onUpdate: (insight: InsightUpdate) => void,
    onError: (error: Error) => void
  ): () => void {
    const channelName = `insights:${userId}`;

    if (this.channels.has(channelName)) {
      const listeners = this.listeners.get(channelName) || new Set();
      listeners.add(onUpdate);
      this.listeners.set(channelName, listeners);
      return () => {
        const listeners = this.listeners.get(channelName);
        if (listeners) {
          listeners.delete(onUpdate);
        }
      };
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'insights',
          filter: `team_id=eq.${userId}`,
        },
        (payload: any) => {
          const insight: InsightUpdate = {
            id: payload.new.id,
            type: payload.new.type as InsightType,
            title: payload.new.title,
            description: payload.new.description,
            confidence: payload.new.confidence,
            impact: payload.new.impact as 'high' | 'medium' | 'low',
          };

          const listeners = this.listeners.get(channelName) || new Set();
          listeners.forEach((listener) => {
            try {
              listener(insight);
            } catch (error) {
              console.error('Error in insight listener:', error);
            }
          });
        }
      )
      .on('system', { event: 'error' }, (err: any) => {
        console.error('Realtime error:', err);
        onError(new Error(err.message || 'Realtime connection error'));
      })
      .subscribe();

    this.channels.set(channelName, channel);

    const listeners = this.listeners.get(channelName) || new Set();
    listeners.add(onUpdate);
    this.listeners.set(channelName, listeners);

    return () => {
      const listeners = this.listeners.get(channelName);
      if (listeners) {
        listeners.delete(onUpdate);
        if (listeners.size === 0) {
          this.supabase.removeChannel(channel);
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  /**
   * Subscribe to team updates (real-time)
   */
  subscribeToTeam(
    teamId: string,
    onUpdate: (event: any) => void,
    onError: (error: Error) => void
  ): () => void {
    const channelName = `team:${teamId}`;

    if (this.channels.has(channelName)) {
      const listeners = this.listeners.get(channelName) || new Set();
      listeners.add(onUpdate);
      this.listeners.set(channelName, listeners);
      return () => {
        const listeners = this.listeners.get(channelName);
        if (listeners) {
          listeners.delete(onUpdate);
        }
      };
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `team_id=eq.${teamId}`,
        },
        (payload: any) => {
          const listeners = this.listeners.get(channelName) || new Set();
          listeners.forEach((listener) => {
            try {
              listener(payload);
            } catch (error) {
              console.error('Error in team listener:', error);
            }
          });
        }
      )
      .on('system', { event: 'error' }, (err: any) => {
        console.error('Realtime error:', err);
        onError(new Error(err.message || 'Realtime connection error'));
      })
      .subscribe();

    this.channels.set(channelName, channel);

    const listeners = this.listeners.get(channelName) || new Set();
    listeners.add(onUpdate);
    this.listeners.set(channelName, listeners);

    return () => {
      const listeners = this.listeners.get(channelName);
      if (listeners) {
        listeners.delete(onUpdate);
        if (listeners.size === 0) {
          this.supabase.removeChannel(channel);
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  /**
   * Unsubscribe all channels
   */
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.listeners.clear();
  }
}

// Export singleton
export const realtimeManager = new RealtimeManager();
