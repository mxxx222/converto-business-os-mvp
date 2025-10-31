/**
 * Supabase client for browser-side usage.
 * Uses cookies for session management via @supabase/ssr.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that gracefully handles missing config
    // This allows the dashboard to load without Supabase configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signIn: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: { message: 'Supabase not configured' } }),
      },
      from: () => ({
        select: () => ({
          order: () => ({
            limit: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
          }),
        }),
      }),
      channel: () => ({
        on: () => ({
          on: () => ({
            on: () => ({
              subscribe: () => {},
            }),
          }),
        }),
      }),
      removeAllChannels: () => {},
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
