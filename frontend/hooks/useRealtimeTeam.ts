'use client';

import { useEffect } from 'react';
import { realtimeManager } from '@/lib/realtime/subscriptions';
import { useToast } from '@/hooks/useToast';

export function useRealtimeTeam(teamId: string, onTeamUpdate: (event: any) => void) {
  const { toast } = useToast();

  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = realtimeManager.subscribeToTeam(
      teamId,
      (event) => {
        onTeamUpdate(event);

        // Näytä notifikaatio
        const eventType = (event as any).eventType || (event as any).event;
        const newData = (event as any).new;
        const oldData = (event as any).old;

        if (eventType === 'INSERT' || eventType === 'insert') {
          toast({
            title: '👥 Uusi tiimin jäsen',
            description: `${newData?.email || 'Unknown'} liittyi tiimiin`,
            type: 'info',
            duration: 3000,
          });
        } else if (eventType === 'DELETE' || eventType === 'delete') {
          toast({
            title: '👥 Jäsen poistettu',
            description: `${oldData?.email || 'Unknown'} poistettiin tiimistä`,
            type: 'info',
            duration: 3000,
          });
        }
      },
      (error) => {
        console.error('Realtime team error:', error);
      }
    );

    return () => unsubscribe();
  }, [teamId, onTeamUpdate, toast]);
}
