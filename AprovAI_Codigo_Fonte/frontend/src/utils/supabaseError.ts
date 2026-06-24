/** Mensagem legível a partir de erros do PostgREST / Supabase JS */
export function getSupabaseErrorMessage(error: unknown): string {
  if (error == null) return 'Erro desconhecido';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const e = error as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [e.message, e.details, e.hint].filter(Boolean);
    const msg = parts.join(' — ');
    if (msg) return msg;
  }
  return String(error);
}
