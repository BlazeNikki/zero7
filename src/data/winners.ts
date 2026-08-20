import { fetchItems } from '@/lib/directus';

export type Winner = {
  id: string;
  name: string;
  game: string;
  amount: string;
};

export const winnerImages = [
  'https://images.pexels.com/photos/29261090/pexels-photo-29261090.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/34977996/pexels-photo-34977996.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/7594228/pexels-photo-7594228.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/29261090/pexels-photo-29261090.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&fp-x=0.7',
  'https://images.pexels.com/photos/34977996/pexels-photo-34977996.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&fp-x=0.3',
];

export async function fetchWinners(): Promise<Winner[]> {
  const data = await fetchItems<Record<string, unknown>>('winners');
  return data.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    game: r.game as string,
    amount: `${Number(r.amount).toLocaleString('ru-RU')} ₽`,
  }));
}
