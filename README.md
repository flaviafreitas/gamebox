# GameBox 🎮

Um "Letterboxd para video games": busque jogos, marque como *jogando / quero jogar / zerado / abandonado*, dê nota, escreva reviews e siga outras pessoas para ver a atividade delas.

## Stack

- **App:** React Native + [Expo](https://expo.dev) (SDK 57) + expo-router + TypeScript
- **Backend:** [Supabase](https://supabase.com) (Postgres, Auth, Storage, Edge Functions)
- **Dados dos jogos:** [IGDB](https://www.igdb.com/api) (via Twitch OAuth), acessada por uma Edge Function
- **Estado/dados:** TanStack Query · **Imagens:** expo-image

## Pré-requisitos

- Node 20+ e um celular com o app **Expo Go** (ou emulador Android/iOS)
- Uma conta no [Supabase](https://supabase.com)
- Uma conta de desenvolvedor na [Twitch](https://dev.twitch.tv/console) (para a IGDB)

## Configuração

### 1. Dependências

```bash
npm install
```

### 2. Supabase

1. Crie um projeto novo no [dashboard do Supabase](https://supabase.com/dashboard).
2. Aplique o schema do banco. Com a [Supabase CLI](https://supabase.com/docs/guides/cli):
   ```bash
   supabase link --project-ref SEU_PROJECT_REF
   supabase db push
   ```
   (ou copie o conteúdo de `supabase/migrations/*.sql` no **SQL Editor** do dashboard e execute).
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.

### 3. Twitch / IGDB

1. Em [dev.twitch.tv/console](https://dev.twitch.tv/console), registre uma aplicação e gere um **Client ID** e um **Client Secret**.
2. Esses valores ficam **apenas no servidor** (Edge Function), nunca no app.

### 4. Edge Function `igdb`

```bash
supabase functions deploy igdb
supabase secrets set TWITCH_CLIENT_ID=xxxx TWITCH_CLIENT_SECRET=yyyy
```

### 5. Variáveis de ambiente do app

Copie `.env.example` para `.env` e preencha:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 6. Rodar

```bash
npx expo start
```

Escaneie o QR code com o Expo Go (ou pressione `a`/`i` para emulador).

## Estrutura

```
src/
  app/                 # rotas (expo-router)
    (auth)/            # login, signup
    (tabs)/            # início (feed), buscar, perfil
    game/[id].tsx      # detalhe do jogo + prateleira
    log/[gameId].tsx   # modal de registro/avaliação
    user/[username].tsx# perfil de outra pessoa
  components/          # UI reutilizável (GameCard, LogItem, RatingStars, ...)
  hooks/               # useAuth, useDebounce, useTheme
  lib/                 # supabase, igdb, games, profile, social
  constants/theme.ts   # paleta e tokens
supabase/
  functions/igdb/      # proxy da IGDB
  migrations/          # schema + RLS
```

## Modelo de dados

- `profiles` — perfil público (1:1 com `auth.users`, criado por trigger no signup)
- `games` — cache local dos jogos da IGDB
- `game_status` — prateleira do usuário (1 por user+jogo)
- `logs` — diário/reviews (N por user+jogo), nota de 0,5 a 5
- `follows` — relação social

Todas as tabelas têm Row Level Security.
