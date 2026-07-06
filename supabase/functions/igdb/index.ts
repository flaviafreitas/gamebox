// Edge Function: proxy para a IGDB.
// Guarda as credenciais da Twitch (server-side) e repassa consultas à IGDB.
// Chamada pelo app via supabase.functions.invoke('igdb', { body: { action, ... } }).

interface SearchBody {
  action: 'search';
  query: string;
  limit?: number;
}
interface GameBody {
  action: 'game';
  id: number;
}
type RequestBody = SearchBody | GameBody;

interface IgdbGame {
  id: number;
  name: string;
  slug?: string;
  summary?: string;
  first_release_date?: number; // unix (segundos)
  cover?: { image_id?: string };
  platforms?: { name: string }[];
  genres?: { name: string }[];
}

const TWITCH_CLIENT_ID = Deno.env.get('TWITCH_CLIENT_ID') ?? '';
const TWITCH_CLIENT_SECRET = Deno.env.get('TWITCH_CLIENT_SECRET') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache do app token em memória (persiste enquanto a instância estiver quente).
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const url = new URL('https://id.twitch.tv/oauth2/token');
  url.searchParams.set('client_id', TWITCH_CLIENT_ID);
  url.searchParams.set('client_secret', TWITCH_CLIENT_SECRET);
  url.searchParams.set('grant_type', 'client_credentials');

  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Falha ao autenticar na Twitch: ${res.status}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

async function igdbQuery(body: string): Promise<IgdbGame[]> {
  const token = await getAccessToken();
  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB ${res.status}: ${text}`);
  }
  return (await res.json()) as IgdbGame[];
}

function coverUrl(imageId?: string): string | null {
  return imageId ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg` : null;
}

function releaseDate(ts?: number): string | null {
  if (!ts) return null;
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function mapGame(g: IgdbGame) {
  return {
    igdb_id: g.id,
    name: g.name,
    slug: g.slug ?? null,
    cover_url: coverUrl(g.cover?.image_id),
    first_release_date: releaseDate(g.first_release_date),
    platforms: g.platforms?.map((p) => p.name) ?? null,
    genres: g.genres?.map((genre) => genre.name) ?? null,
    summary: g.summary ?? null,
  };
}

const FIELDS =
  'fields name,slug,summary,first_release_date,cover.image_id,platforms.name,genres.name';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      throw new Error('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET não configurados.');
    }

    const body = (await req.json()) as RequestBody;
    let games: IgdbGame[] = [];

    if (body.action === 'search') {
      const term = (body.query ?? '').replace(/"/g, '').trim();
      const limit = Math.min(Math.max(body.limit ?? 20, 1), 50);
      if (term.length > 0) {
        games = await igdbQuery(
          `search "${term}"; ${FIELDS}; where version_parent = null; limit ${limit};`,
        );
      }
    } else if (body.action === 'game') {
      games = await igdbQuery(`${FIELDS}; where id = ${Number(body.id)};`);
    } else {
      throw new Error('Ação inválida.');
    }

    const result = games.map(mapGame);
    return new Response(JSON.stringify({ games: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
