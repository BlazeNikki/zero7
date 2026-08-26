import { fetchItems, fetchSingle } from '@/lib/directus';

export type GameStatus = 'active' | 'maintenance' | 'disabled';
export type GameVolatility = 'low' | 'medium' | 'high' | 'very_high';
export type GameCategory = string;

export type GameRule = {
  title: string;
  body: string;
};

export type PaytableEntry = {
  symbol: string;
  payout: string;
};

export type Game = {
  id: string;
  name: string;
  slug: string;
  provider: string;
  art: string;
  accent: string;
  category: GameCategory;
  description: string;
  full_description: string;
  rtp: number;
  volatility: GameVolatility;
  min_bet: number;
  max_bet: number;
  max_win: number;
  house_edge: number;
  rules: GameRule[];
  status: GameStatus;
  is_popular: boolean;
  sort: number;
  paytable?: PaytableEntry[];
  features?: string[];
  banner_image?: string;
};

export type PayoutStatus = 'pending' | 'confirmed' | 'failed';

export type GameWinnerPlayer = {
  id: string;
  nickname: string | null;
  avatar: string | null;
};

export type GameWinner = {
  id: string;
  name: string;
  game: string;
  amount: string;
  created_at?: string;
  player: GameWinnerPlayer | null;
  tx_signature: string | null;
  payout_status: PayoutStatus;
};

function mapGame(r: Record<string, unknown>): Game {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    provider: r.provider as string,
    art: (r.art as string) ?? '',
    accent: (r.accent as string) ?? '#FFFFFF',
    category: (r.category as string) ?? '',
    description: (r.description as string) ?? '',
    full_description: (r.full_description as string) ?? '',
    rtp: Number(r.rtp ?? 0),
    volatility: (r.volatility as GameVolatility) ?? 'medium',
    min_bet: Number(r.min_bet ?? 0),
    max_bet: Number(r.max_bet ?? 0),
    max_win: Number(r.max_win ?? 0),
    house_edge: Number(r.house_edge ?? 0),
    rules: (r.rules ?? []) as GameRule[],
    status: (r.status as GameStatus) ?? 'active',
    is_popular: Boolean(r.is_popular ?? false),
    sort: Number(r.sort ?? 0),
    paytable: (r.paytable ?? undefined) as PaytableEntry[] | undefined,
    features: (r.features ?? undefined) as string[] | undefined,
    banner_image: (r.banner_image ?? undefined) as string | undefined,
  };
}

export async function fetchGameBySlug(slug: string): Promise<Game | null> {
  const filter = JSON.stringify({ slug: { _eq: slug } });
  const item = await fetchSingle<Record<string, unknown>>('games', { filter, limit: '1' });
  if (!item) return null;
  return mapGame(item);
}

export async function fetchGamesByCategory(
  category: string,
  excludeId: string,
  limit = 6,
): Promise<Game[]> {
  const filter = JSON.stringify({
    _and: [
      { category: { _eq: category } },
      { id: { _neq: excludeId } },
      { status: { _eq: 'active' } },
    ],
  });
  const data = await fetchItems<Record<string, unknown>>('games', {
    filter,
    sort: 'sort',
    limit: String(limit),
  });
  return data.map(mapGame);
}

export async function fetchPopularGames(limit = 10): Promise<Game[]> {
  const filter = JSON.stringify({
    _and: [
      { is_popular: { _eq: true } },
      { status: { _eq: 'active' } },
    ],
  });
  const data = await fetchItems<Record<string, unknown>>('games', {
    filter,
    sort: 'sort',
    limit: String(limit),
  });
  return data.map(mapGame);
}

export async function fetchWinnersByGame(
  gameId: string,
  limit = 10,
): Promise<GameWinner[]> {
  if (!gameId) return [];
  const filter = JSON.stringify({
    _and: [
      { game: { _eq: gameId } },
      { payout_status: { _eq: 'confirmed' } },
    ],
  });
  const fields = [
    'id', 'name', 'game', 'amount', 'created_at',
    'payout_status', 'tx_signature',
    'player.id', 'player.nickname', 'player.avatar',
  ].join(',');
  const data = await fetchItems<Record<string, unknown>>('winners', {
    filter,
    sort: '-created_at',
    limit: String(limit),
    fields,
  });
  return data.map((r) => {
    const player = r.player as Record<string, unknown> | null;
    return {
      id: r.id as string,
      name: r.name as string,
      game: (r.game as string) ?? '',
      amount: `${Number(r.amount).toLocaleString('ru-RU')} ₽`,
      created_at: (r.created_at as string) ?? undefined,
      player: player
        ? {
            id: player.id as string,
            nickname: (player.nickname as string) ?? null,
            avatar: (player.avatar as string) ?? null,
          }
        : null,
      tx_signature: (r.tx_signature as string) ?? null,
      payout_status: (r.payout_status as PayoutStatus) ?? 'pending',
    };
  });
}
