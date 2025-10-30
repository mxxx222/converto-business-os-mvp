/**
 * @deprecated Use @/lib/supabase/client instead for browser-side usage.
 * This file is kept for backward compatibility.
 */
import { createClient as createBrowserClient } from './supabase/client';

export function getSupabaseClient() {
  try {
    return createBrowserClient();
  } catch (error) {
    console.warn('Supabase client not available:', error);
    return null;
  }
}

// Re-export new client function for convenience
export { createClient } from './supabase/client';

