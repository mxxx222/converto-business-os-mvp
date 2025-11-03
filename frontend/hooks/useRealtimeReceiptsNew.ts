'use client';

import { useEffect, useCallback } from 'react';
import { realtimeManager, ReceiptUpdate } from '@/lib/realtime/subscriptions';
import { useAuth } from '@/lib/auth/useAuth';
import { useToast } from '@/hooks/useToast';

export function useRealtimeReceipts(onReceiptUpdate: (receipt: ReceiptUpdate) => void) {
  const { user, team } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id || !team?.teamId) return;

    const unsubscribe = realtimeManager.subscribeToReceipts(
      user.id,
      (receipt) => {
        onReceiptUpdate(receipt);

        // Näytä toast-notifikaatio
        if (receipt.status === 'processed') {
          toast({
            title: '✓ Kuitti käsitelty',
            description: `${receipt.amount || 0}€ lisätty`,
            type: 'success',
            duration: 3000,
          });
        } else if (receipt.status === 'error') {
          toast({
            title: '✗ Virhe kuittia käsiteltäessä',
            description: receipt.error_message || 'Tuntematon virhe',
            type: 'error',
            duration: 5000,
          });
        }
      },
      (error) => {
        console.error('Realtime error:', error);
        toast({
          title: '⚠️ Yhteysongelma',
          description: 'Realtime-päivitykset eivät toimi',
          type: 'error',
          duration: 5000,
        });
      }
    );

    return () => unsubscribe();
  }, [user?.id, team?.teamId, onReceiptUpdate, toast]);
}
