import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('사용자님'));

// Only create the client if we have a valid URL to prevent the whole app from crashing
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any); 

if (!isSupabaseConfigured) {
  console.warn('Supabase configuration is missing or incomplete. Some features will be disabled.');
}
