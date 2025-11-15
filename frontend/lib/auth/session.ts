/**
 * DocFlow Auth MVP (v0) - Session Management
 * 
 * Handles silent token refresh with BroadcastChannel tab synchronization
 * to prevent token refresh storms when multiple tabs are open.
 * 
 * Security features:
 * - Automatic refresh 2 minutes before expiry
 * - Tab-level locking (only one tab refreshes at a time)
 * - Exponential backoff on failures
 * - User notification on persistent failures
 */

import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

// BroadcastChannel for cross-tab communication
let channel: BroadcastChannel | null = null
let isRefreshing = false
let refreshTimer: NodeJS.Timeout | null = null

// Exponential backoff state
let retryCount = 0
const MAX_RETRIES = 5
const BASE_DELAY = 1000 // 1 second

/**
 * Initialize BroadcastChannel for tab synchronization
 */
function initBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!('BroadcastChannel' in window)) {
    console.warn('BroadcastChannel not supported - tab sync disabled')
    return null
  }
  
  if (channel) return channel
  
  channel = new BroadcastChannel('docflow_auth')
  
  channel.onmessage = (event) => {
    const { type, payload } = event.data
    
    switch (type) {
      case 'REFRESH_START':
        isRefreshing = true
        console.debug('[Auth] Another tab started refresh')
        break
        
      case 'REFRESH_SUCCESS':
        isRefreshing = false
        retryCount = 0 // Reset retry count on success
        console.debug('[Auth] Another tab completed refresh')
        // Reload current page to pick up new session from cookies
        window.location.reload()
        break
        
      case 'REFRESH_ERROR':
        isRefreshing = false
        console.error('[Auth] Another tab failed refresh:', payload?.error)
        break
        
      case 'SIGN_OUT':
        console.debug('[Auth] Sign out broadcast received')
        window.location.href = '/login'
        break
    }
  }
  
  return channel
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(): number {
  return Math.min(BASE_DELAY * Math.pow(2, retryCount), 30000) // Max 30 seconds
}

/**
 * Refresh session with tab-level locking
 * 
 * Only one tab will perform the actual refresh. Other tabs will
 * wait for the refresh to complete and then reload to pick up
 * the new session from cookies.
 */
export async function refreshSession(): Promise<Session | null> {
  const supabase = createClient()
  
  // Check if another tab is already refreshing
  if (isRefreshing) {
    console.debug('[Auth] Refresh already in progress in another tab')
    return null
  }
  
  // Acquire lock
  isRefreshing = true
  const channel = initBroadcastChannel()
  channel?.postMessage({ type: 'REFRESH_START' })
  
  try {
    console.debug('[Auth] Starting session refresh')
    
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      throw error
    }
    
    if (!data.session) {
      throw new Error('No session returned from refresh')
    }
    
    // Success - reset retry count and notify other tabs
    retryCount = 0
    channel?.postMessage({ 
      type: 'REFRESH_SUCCESS',
      payload: { expiresAt: data.session.expires_at }
    })
    
    console.debug('[Auth] Session refreshed successfully')
    return data.session
    
  } catch (error) {
    retryCount++
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Auth] Session refresh failed (attempt ${retryCount}/${MAX_RETRIES}):`, errorMessage)
    
    channel?.postMessage({ 
      type: 'REFRESH_ERROR',
      payload: { error: errorMessage, retryCount }
    })
    
    // Exponential backoff retry
    if (retryCount < MAX_RETRIES) {
      const delay = getBackoffDelay()
      console.debug(`[Auth] Retrying in ${delay}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return refreshSession() // Recursive retry
    } else {
      // Max retries exceeded - notify user
      console.error('[Auth] Max refresh retries exceeded')
      
      // TODO: Show user notification
      // showToast('Yhteys katkesi. Tallenna työsi ja kirjaudu uudelleen.', 'error')
      
      return null
    }
    
  } finally {
    isRefreshing = false
  }
}

/**
 * Setup automatic token refresh
 * 
 * Refreshes session 2 minutes before expiry to ensure seamless UX.
 * Uses Supabase's onAuthStateChange to detect session changes.
 */
export function setupAutoRefresh(): void {
  const supabase = createClient()
  
  // Initialize BroadcastChannel
  initBroadcastChannel()
  
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.debug('[Auth] Auth state changed:', event)
      
      // Clear existing timer
      if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
      }
      
      if (event === 'SIGNED_OUT') {
        // Broadcast sign out to other tabs
        channel?.postMessage({ type: 'SIGN_OUT' })
        return
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.debug('[Auth] Token refreshed by Supabase')
        retryCount = 0 // Reset retry count
      }
      
      // Schedule next refresh
      if (session?.expires_at) {
        const expiresAt = session.expires_at * 1000 // Convert to milliseconds
        const now = Date.now()
        const expiresIn = expiresAt - now
        
        // Refresh 2 minutes (120 seconds) before expiry
        const refreshIn = expiresIn - 120000
        
        if (refreshIn > 0) {
          console.debug(`[Auth] Scheduling refresh in ${Math.round(refreshIn / 1000)}s`)
          
          refreshTimer = setTimeout(async () => {
            await refreshSession()
          }, refreshIn)
        } else {
          // Token already expired or about to expire - refresh immediately
          console.warn('[Auth] Token expired or about to expire - refreshing now')
          await refreshSession()
        }
      }
    }
  )
  
  // Cleanup on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      subscription.unsubscribe()
      if (refreshTimer) clearTimeout(refreshTimer)
      channel?.close()
    })
  }
}

/**
 * Sign out and notify all tabs
 */
export async function signOut(): Promise<void> {
  const supabase = createClient()
  
  // Clear refresh timer
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
  
  // Broadcast sign out to other tabs
  channel?.postMessage({ type: 'SIGN_OUT' })
  
  // Sign out from Supabase
  await supabase.auth.signOut()
  
  // Redirect to login
  window.location.href = '/login'
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

