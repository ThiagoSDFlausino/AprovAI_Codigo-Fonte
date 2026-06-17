import { createClient } from '@supabase/supabase-js';
const FALLBACK_URL = 'https://jewgenlqgoielaqphsgg.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impld2dlbmxxZ29pZWxhcXBoc2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTAyMTYsImV4cCI6MjA5MzE4NjIxNn0.lIUOBhoGxPEDZzJZRbI87RfU37Bg2f0rSN5tRkEi-Yw';

const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || FALLBACK_URL).trim();
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY).trim();

export const isSupabaseEnvExplicit =
  Boolean(process.env.REACT_APP_SUPABASE_URL?.trim()) &&
  Boolean(process.env.REACT_APP_SUPABASE_ANON_KEY?.trim());

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export function createHeadlessSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

if (process.env.NODE_ENV === 'development' && !isSupabaseEnvExplicit) {
  console.info(
    '[AprovAI] Using built-in Supabase defaults from .env.example. Add a `.env` file to override.',
  );
}
