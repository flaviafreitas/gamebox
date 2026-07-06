/**
 * Variáveis de ambiente públicas do app (embutidas no bundle pelo Expo).
 * Defina-as em um arquivo `.env` na raiz (veja `.env.example`).
 */

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
