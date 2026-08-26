import { fetchItems } from '@/lib/directus';

export type PayoutStatus = 'pending' | 'confirmed' | 'failed';

export type WinnerPlayer = {
  id: string;
  nickname: string | null;
  avatar: string | null;
};

export type Winner = {
  id: string;
  name: string;
  game: string;
  amount: string;
  player: WinnerPlayer | null;
  tx_signature: string | null;
  payout_status: PayoutStatus;
};

const CONFIRMED_FILTER = JSON.stringify({
  _and: [
    { payout_status: { _eq: 'confirmed' } },
  ],
});

const WINNER_FIELDS = [
  'id',
  'name',
  'game',
  'amount',
  'payout_status',
  'tx_signature',
  'player.id',
  'player.nickname',
  'player.avatar',
].join(',');

function mapWinner(r: Record<string, unknown>): Winner {
  const player = r.player as Record<string, unknown> | null;
  return {
    id: r.id as string,
    name: (r.name as string) ?? '',
    game: (r.game as string) ?? '',
    amount: `${Number(r.amount).toLocaleString('ru-RU')} ₽`,
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
}

export async function fetchWinners(limit = 10): Promise<Winner[]> {
  const data = await fetchItems<Record<string, unknown>>('winners', {
    filter: CONFIRMED_FILTER,
    sort: '-created_at',
    limit: String(limit),
    fields: WINNER_FIELDS,
  });
  return data.map(mapWinner);
}
