// Client-side Supabase client (browser only)
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

// Client-side Supabase client (browser)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Note: Server-side clients are in supabase-server.ts to avoid importing next/headers in client code

