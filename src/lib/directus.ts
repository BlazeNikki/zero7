import { getAuthToken } from './auth';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://arfnwjuxqidefuxgbzyw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZm53anV4cWlkZWZ1eGdienl3Iiwicm9sIjoiYW5vbiIsImlhdCI6MTc4NjUyODA1OCwiZXhwIjoyMTAyMTA0MDU4fQ.ceVL34t3fk7dU-FQVMYHG8xobknNy2sNU9Kp-oRCfDU';
const PROXY_URL = `${SUPABASE_URL}/functions/v1/directus-proxy/items`;

type DirectusItem = Record<string, unknown>;

export type DirectusUser = {
  id: string;
  wallet_address: string;
  chain: string;
  created_at: string;
  balance?: number;
  vip_level?: number;
};

async function proxyFetch<T = DirectusItem>(collection: string, params: Record<string, string> = {}): Promise<T[]> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const query = new URLSearchParams(params);
  const res = await fetch(`${PROXY_URL}/${collection}?${query.toString()}`, { headers });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'API error');
  return (json.data ?? []) as T[];
}

async function proxyPost<T = DirectusItem>(collection: string, body: DirectusItem): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${PROXY_URL}/${collection}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'API error');
  return json.data as T;
}

export async function fetchItems<T = DirectusItem>(
  collection: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  return proxyFetch<T>(collection, params);
}

export async function fetchSingle<T = DirectusItem>(
  collection: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  const items = await proxyFetch<T>(collection, { ...params, limit: '1' });
  return items.length > 0 ? items[0] : null;
}

export async function insertItem<T = DirectusItem>(
  collection: string,
  body: DirectusItem,
): Promise<T> {
  return proxyPost<T>(collection, body);
}

export async function getOrCreateDirectusUser(
  walletAddress: string,
  chain: string,
): Promise<DirectusUser> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const filter = encodeURIComponent(JSON.stringify({ wallet_address: { _eq: walletAddress } }));
  const res = await fetch(`${PROXY_URL}/users?filter=${filter}&limit=1`, { headers });
  if (res.ok) {
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      return json.data[0] as DirectusUser;
    }
  }

  const created = await proxyPost<DirectusItem>('users', {
    wallet_address: walletAddress,
    chain,
    balance: 0,
    vip_level: 1,
  });
  return created as unknown as DirectusUser;
}
