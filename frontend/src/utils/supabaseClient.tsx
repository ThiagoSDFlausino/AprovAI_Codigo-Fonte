// src/utils/supabaseClient.tsx
import { createClient } from '@supabase/supabase-js';

/**
 * CRA only injects env vars that exist at build time. If `.env` is missing,
 * `createClient('', '')` throws and the whole app stays blank.
 * These fallbacks match `.env.example` so clone → npm install → npm start works.
 * Override with your own `.env` for production or another Supabase project.
 */
const FALLBACK_URL = 'https://jewgenlqgoielaqphsgg.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impld2dlbmxxZ29pZWxhcXBoc2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTAyMTYsImV4cCI6MjA5MzE4NjIxNn0.lIUOBhoGxPEDZzJZRbI87RfU37Bg2f0rSN5tRkEi-Yw';

const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || FALLBACK_URL).trim();
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY).trim();

/** True when both vars are set explicitly in `.env` (not only fallbacks). */
export const isSupabaseEnvExplicit =
  Boolean(process.env.REACT_APP_SUPABASE_URL?.trim()) &&
  Boolean(process.env.REACT_APP_SUPABASE_ANON_KEY?.trim());

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cliente só para `signUp` de um terceiro: não grava sessão no storage partilhado.
 * Evita que, com "Confirm email" desligado, o Supabase troque a sessão do admin pela do novo utilizador
 * e que INSERTs em `profiles` / `study_methods` falhem no RLS.
 */
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
  // eslint-disable-next-line no-console
  console.info(
    '[AprovAI] Using built-in Supabase defaults from .env.example. Add a `.env` file to override.',
  );
}
