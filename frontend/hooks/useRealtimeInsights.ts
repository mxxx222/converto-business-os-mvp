'use client';

import { useEffect, useCallback } from 'react';
import { realtimeManager, InsightUpdate } from '@/lib/realtime/subscriptions';
import { useAuth } from '@/lib/auth/useAuth';
import { useToast } from '@/hooks/useToast';

export function useRealtimeInsights(onInsightUpdate: (insight: InsightUpdate) => void) {
  const { user, team } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id || !team?.teamId) return;

    const unsubscribe = realtimeManager.subscribeToInsights(
      user.id,
      (insight) => {
        onInsightUpdate(insight);

        // Näytä toast-notifikaatio
        const icons: Record<string, string> = {
          opportunity: '💡',
          warning: '⚠️',
          recommendation: '💡',
          achievement: '🎉',
        };

        toast({
          title: `${icons[insight.type] || '💡'} ${insight.title}`,
          description: insight.description,
          type: insight.type === 'warning' ? 'error' : 'info',
          duration: 5000,
        });
      },
      (error) => {
        console.error('Realtime insights error:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.id, team?.teamId, onInsightUpdate, toast]);
}
