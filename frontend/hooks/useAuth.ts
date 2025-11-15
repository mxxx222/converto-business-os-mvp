/**
 * DocFlow Auth Hook
 * 
 * React hook for authentication state management with automatic
 * session refresh and multi-tab synchronization.
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setupAutoRefresh, signOut as signOutSession } from '@/lib/auth/session'
import type { User, Session } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

/**
 * Authentication hook with automatic session management
 * 
 * Features:
 * - Automatic session refresh 2 min before expiry
 * - Multi-tab synchronization via BroadcastChannel
 * - Loading states for UI
 * - Automatic redirect on sign out
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { user, loading, signOut } = useAuth()
 *   
 *   if (loading) return <Spinner />
 *   if (!user) return <Navigate to="/login" />
 *   
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Setup automatic refresh
    setupAutoRefresh()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignOut = useCallback(async () => {
    await signOutSession()
  }, [])

  return {
    user,
    session,
    loading,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  }
}

/**
 * Hook to require authentication
 * 
 * Automatically redirects to login if user is not authenticated.
 * Shows loading state while checking authentication.
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, loading } = useRequireAuth()
 *   
 *   if (loading) return <Spinner />
 *   
 *   // User is guaranteed to be authenticated here
 *   return <div>Protected content for {user.email}</div>
 * }
 * ```
 */
export function useRequireAuth(): UseAuthReturn {
  const router = useRouter()
  const auth = useAuth()

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth.loading, auth.isAuthenticated, router])

  return auth
}

