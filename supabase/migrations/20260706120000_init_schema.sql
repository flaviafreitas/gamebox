-- GameLog — schema inicial
-- Tabelas: profiles, games (cache IGDB), game_status (prateleira), logs (diário/reviews), follows.

-- ---------------------------------------------------------------------------
-- profiles: perfil público, 1:1 com auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

-- ---------------------------------------------------------------------------
-- games: cache local dos jogos vindos da IGDB
-- ---------------------------------------------------------------------------
create table public.games (
  igdb_id bigint primary key,
  name text not null,
  slug text,
  cover_url text,
  first_release_date date,
  summary text,
  platforms text[],
  genres text[],
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- game_status: prateleira do usuário (1 linha por user+game)
-- ---------------------------------------------------------------------------
create type public.shelf_status as enum ('backlog', 'playing', 'played', 'dropped');

create table public.game_status (
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id bigint not null references public.games (igdb_id) on delete cascade,
  status public.shelf_status not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

-- ---------------------------------------------------------------------------
-- logs: diário / reviews (N por user+game)
-- ---------------------------------------------------------------------------
create table public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id bigint not null references public.games (igdb_id) on delete cascade,
  rating numeric(2, 1) check (
    rating >= 0.5 and rating <= 5.0 and (rating * 2) = floor(rating * 2)
  ),
  review text,
  played_on date,
  is_replay boolean not null default false,
  liked boolean not null default false,
  contains_spoilers boolean not null default false,
  created_at timestamptz not null default now()
);

create index logs_user_created_idx on public.logs (user_id, created_at desc);
create index logs_game_idx on public.logs (game_id);

-- ---------------------------------------------------------------------------
-- follows: relação social (follower segue following)
-- ---------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id);

-- ---------------------------------------------------------------------------
-- Cria o profile automaticamente quando um usuário se cadastra
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_status enable row level security;
alter table public.logs enable row level security;
alter table public.follows enable row level security;

-- profiles: leitura pública, escrita só do dono
create policy "profiles_select_all" on public.profiles
  for select using (true);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- games: leitura pública, upsert por qualquer usuário autenticado
create policy "games_select_all" on public.games
  for select using (true);
create policy "games_insert_auth" on public.games
  for insert to authenticated with check (true);
create policy "games_update_auth" on public.games
  for update to authenticated using (true) with check (true);

-- game_status: leitura pública, gestão só do dono
create policy "game_status_select_all" on public.game_status
  for select using (true);
create policy "game_status_manage_own" on public.game_status
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- logs: leitura pública, escrita só do dono
create policy "logs_select_all" on public.logs
  for select using (true);
create policy "logs_insert_own" on public.logs
  for insert with check (auth.uid() = user_id);
create policy "logs_update_own" on public.logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "logs_delete_own" on public.logs
  for delete using (auth.uid() = user_id);

-- follows: leitura pública, gestão só do próprio follower
create policy "follows_select_all" on public.follows
  for select using (true);
create policy "follows_manage_own" on public.follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
