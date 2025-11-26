import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

if (!supabaseUrl || !supabaseKey) {
  const message =
    'Supabase env vars not found. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
  console.error(message);
  throw new Error(message);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
  },
});
