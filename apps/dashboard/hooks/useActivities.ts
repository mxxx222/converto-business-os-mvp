import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { apiClient, type Activity } from '@/lib/api-client'

export function useActivities(limit: number = 20) {
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: () => apiClient.getActivities(limit),
    refetchInterval: 5000, // Poll every 5s as fallback
    staleTime: 3000 // Consider data stale after 3s
  })
}

// Real-time subscription hook
export function useActivitiesRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = apiClient.subscribeToActivities((payload) => {
      console.log('New activity:', payload)

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['activities'] })

      // Optimistically update cache for new activities
      if (payload.eventType === 'INSERT' && payload.new) {
        queryClient.setQueryData(['activities'], (old: Activity[] | undefined) => {
          return old ? [payload.new!, ...old] : [payload.new!]
        })
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
}

