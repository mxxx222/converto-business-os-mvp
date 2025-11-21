// Supabase-based API client for DocFlow Admin Dashboard
// Direct database queries with real-time subscriptions

import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Document {
  id: string
  filename: string
  customer_id?: string
  customer_name?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  upload_date?: string
  created_at: string
  updated_at: string
  priority?: 'low' | 'medium' | 'high'
  size?: string
  type?: 'invoice' | 'receipt' | 'contract' | 'other'
  error_message?: string
  ocr_confidence?: number
  file_url?: string
  ocr_data?: any
}

export interface Activity {
  id: string
  type: string
  message: string
  metadata?: any
  created_at: string
}

export interface DocumentFilters {
  status?: string
  customer_id?: string
  limit?: number
  offset?: number
}

export const apiClient = {
  // Documents
  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      throw error
    }

    return data || []
  },

  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching document:', error)
      throw error
    }

    return data
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating document:', error)
      throw error
    }

    return data
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  },

  // Activities
  async getActivities(limit: number = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching activities:', error)
      throw error
    }

    return data || []
  },

  async createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      throw error
    }

    return data
  },

  // Real-time subscriptions
  subscribeToDocuments(
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      new?: Document
      old?: Document
    }) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('documents-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Document,
            old: payload.old as Document
          })
        }
      )
      .subscribe()

    return channel
  },

  subscribeToActivities(
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      new?: Activity
      old?: Activity
    }) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('activities-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT',
            new: payload.new as Activity,
            old: payload.old as Activity
          })
        }
      )
      .subscribe()

    return channel
  }
}

