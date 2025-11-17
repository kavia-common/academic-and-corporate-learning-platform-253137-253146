//
// Supabase client initialization
//
// Initializes a singleton Supabase client using validated environment variables.
// This module should be imported wherever Supabase operations are needed.
//

import { createClient } from '@supabase/supabase-js';
import env, { assertEnvReady } from '../config/env';

// Ensure required environment variables are present before creating the client
assertEnvReady();

/**
 * Singleton Supabase client instance
 */
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    // Persist session in localStorage by default
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * PUBLIC_INTERFACE
 * Returns the initialized Supabase client instance.
 * Consumers should import from this module rather than creating their own client.
 */
export function getSupabaseClient() {
  /** Get the pre-configured Supabase client. */
  return supabase;
}

export default supabase;
