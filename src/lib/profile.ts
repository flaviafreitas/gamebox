import { supabase } from '@/lib/supabase';
import type { Game, Log, Profile, ShelfStatus } from '@/types/models';

export interface LogWithGame extends Log {
  games: Game | null;
}

export interface ShelfEntry {
  status: ShelfStatus;
  games: Game | null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

/** Registros (diário) do usuário, mais recentes primeiro, com dados do jogo. */
export async function getUserLogs(userId: string, limit = 50): Promise<LogWithGame[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('*, games(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as LogWithGame[]) ?? [];
}

/** Itens da prateleira do usuário, com dados do jogo. */
export async function getUserShelf(userId: string): Promise<ShelfEntry[]> {
  const { data, error } = await supabase
    .from('game_status')
    .select('status, games(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as ShelfEntry[]) ?? [];
}
