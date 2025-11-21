import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { apiClient, type Document, type DocumentFilters } from '@/lib/api-client'

export function useDocuments(filters?: DocumentFilters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => apiClient.getDocuments(filters),
    refetchInterval: 10000, // Poll every 10s as fallback
    staleTime: 5000 // Consider data stale after 5s
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => apiClient.getDocument(id),
    enabled: !!id
  })
}

export function useDocumentsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Document> }) =>
      apiClient.updateDocument(id, updates),
    onSuccess: () => {
      // Invalidate all document queries to refetch
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  })
}

// Real-time subscription hook
export function useDocumentsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = apiClient.subscribeToDocuments((payload) => {
      console.log('Document change:', payload)

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['documents'] })

      // Optionally update cache optimistically
      if (payload.eventType === 'INSERT' && payload.new) {
        queryClient.setQueryData(['documents'], (old: Document[] | undefined) => {
          return old ? [payload.new!, ...old] : [payload.new!]
        })
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        queryClient.setQueryData(['documents'], (old: Document[] | undefined) => {
          return old?.map(doc => doc.id === payload.new!.id ? payload.new! : doc) || []
        })
      } else if (payload.eventType === 'DELETE' && payload.old) {
        queryClient.setQueryData(['documents'], (old: Document[] | undefined) => {
          return old?.filter(doc => doc.id !== payload.old!.id) || []
        })
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
}

