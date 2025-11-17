// PUBLIC_INTERFACE
/**
 * Supabase client initialization with environment guards.
 * Requires REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.
 * Exports:
 *  - named export: supabase
 *  - default export: supabase (for backward compatibility)
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
