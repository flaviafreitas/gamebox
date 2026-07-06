import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/env';

// Fallback só para o app não quebrar no boot antes do .env ser preenchido.
// As chamadas falharão de forma controlada até a configuração real.
const url = isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co';
const anonKey = isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-anon-key';

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Mantém o refresh do token ativo apenas com o app em primeiro plano.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
