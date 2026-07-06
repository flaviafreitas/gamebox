import { supabase } from '@/lib/supabase';
import type { GameSearchResult } from '@/types/models';

interface IgdbResponse {
  games?: GameSearchResult[];
  error?: string;
}

async function invokeIgdb(body: Record<string, unknown>): Promise<GameSearchResult[]> {
  const { data, error } = await supabase.functions.invoke<IgdbResponse>('igdb', { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.games ?? [];
}

/** Busca jogos na IGDB pelo termo. */
export async function searchGames(query: string, limit = 20): Promise<GameSearchResult[]> {
  if (!query.trim()) return [];
  return invokeIgdb({ action: 'search', query, limit });
}

/** Busca um jogo específico pelo id da IGDB. */
export async function getGame(id: number): Promise<GameSearchResult | null> {
  const games = await invokeIgdb({ action: 'game', id });
  return games[0] ?? null;
}
