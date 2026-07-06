import { supabase } from '@/lib/supabase';
import type { GameSearchResult, Log, ShelfStatus } from '@/types/models';

/** Garante que o jogo está no cache local `games` (FK das demais tabelas). */
export async function upsertGame(g: GameSearchResult): Promise<void> {
  const { error } = await supabase.from('games').upsert({
    igdb_id: g.igdb_id,
    name: g.name,
    slug: g.slug,
    cover_url: g.cover_url,
    first_release_date: g.first_release_date,
    summary: g.summary,
    platforms: g.platforms,
    genres: g.genres,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getShelfStatus(gameId: number, userId: string): Promise<ShelfStatus | null> {
  const { data, error } = await supabase
    .from('game_status')
    .select('status')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .maybeSingle();
  if (error) throw error;
  return (data?.status as ShelfStatus) ?? null;
}

export async function setShelfStatus(
  game: GameSearchResult,
  userId: string,
  status: ShelfStatus | null,
): Promise<void> {
  await upsertGame(game);
  if (status === null) {
    const { error } = await supabase
      .from('game_status')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', game.igdb_id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('game_status').upsert({
    user_id: userId,
    game_id: game.igdb_id,
    status,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export interface NewLogInput {
  rating: number | null;
  review: string | null;
  liked: boolean;
  playedToday: boolean;
}

export async function createLog(
  game: GameSearchResult,
  userId: string,
  input: NewLogInput,
): Promise<void> {
  await upsertGame(game);
  const { error } = await supabase.from('logs').insert({
    user_id: userId,
    game_id: game.igdb_id,
    rating: input.rating,
    review: input.review?.trim() || null,
    liked: input.liked,
    played_on: input.playedToday ? new Date().toISOString().slice(0, 10) : null,
  });
  if (error) throw error;
}

export async function getMyLogsForGame(gameId: number, userId: string): Promise<Log[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Log[]) ?? [];
}
