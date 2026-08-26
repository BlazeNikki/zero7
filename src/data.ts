import { fetchItems } from '@/lib/directus';

export type Game = {
  id: string;
  name: string;
  provider: string;
  art: string;
  accent: string;
};

export type ChatMessage = {
  id: string;
  user: string;
  vip: number;
  time: string;
  text: string;
  hue: number;
};

export async function fetchGames(): Promise<Game[]> {
  const data = await fetchItems<Record<string, unknown>>('games');
  return data.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    provider: r.provider as string,
    art: r.art as string,
    accent: r.accent as string,
  }));
}

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const data = await fetchItems<Record<string, unknown>>('chat_messages', { 'sort': 'created_at' });
  return data.map((r) => ({
    id: r.id as string,
    user: r.username as string,
    vip: r.vip as number,
    time: r.time as string,
    text: r.text as string,
    hue: r.hue as number,
  }));
}
