/**
 * Tipos do domínio do GameBox.
 * Espelham as tabelas do Supabase (ver supabase/migrations).
 */

export type ShelfStatus = 'backlog' | 'playing' | 'played' | 'dropped';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Game {
  igdb_id: number;
  name: string;
  slug: string | null;
  cover_url: string | null;
  first_release_date: string | null;
  summary: string | null;
  platforms: string[] | null;
  genres: string[] | null;
  updated_at: string;
}

export interface GameStatus {
  user_id: string;
  game_id: number;
  status: ShelfStatus;
  updated_at: string;
}

export interface Log {
  id: string;
  user_id: string;
  game_id: number;
  rating: number | null; // 0.5 a 5.0, em passos de 0.5
  review: string | null;
  played_on: string | null; // date (YYYY-MM-DD)
  is_replay: boolean;
  liked: boolean;
  contains_spoilers: boolean;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

/** Resultado enxuto vindo da busca da IGDB (via edge function). */
export interface GameSearchResult {
  igdb_id: number;
  name: string;
  slug: string | null;
  cover_url: string | null;
  first_release_date: string | null;
  platforms: string[] | null;
  genres: string[] | null;
  summary: string | null;
}
