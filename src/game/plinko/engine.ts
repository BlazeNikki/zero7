import type { Risk, Rows } from './types';

export const ROWS_OPTIONS: Rows[] = [8, 10, 12, 14, 16];
export const RTP = 0.99;
export const MAX_BALLS = 20;
export const MIN_BET = 10;
export const MAX_BET = 100_000;

const HEX = '0123456789abcdef';

function randomHex(len: number): string {
  const arr = new Uint8Array(len / 2);
  crypto.getRandomValues(arr);
  let s = '';
  for (const b of arr) s += HEX[(b >> 4) & 0xf] + HEX[b & 0xf];
  return s;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function genSeeds() {
  const serverSeed = randomHex(64);
  const clientSeed = randomHex(16);
  const serverSeedHash = await sha256Hex(serverSeed);
  return { serverSeed, clientSeed, serverSeedHash };
}

async function hmacSha256(keyHex: string, message: string): Promise<Uint8Array> {
  const key = hexToBytes(keyHex);
  const data = new TextEncoder().encode(message);
  const buf = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  ), data);
  return new Uint8Array(buf);
}

export async function generatePath(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  rows: number,
): Promise<{ path: number[]; slot: number }> {
  const message = `${clientSeed}:${nonce}`;
  const bytes = await hmacSha256(serverSeed, message);
  const path: number[] = [];
  for (let i = 0; i < rows; i++) {
    path.push(bytes[i % bytes.length] & 1);
  }
  const slot = path.reduce((a, b) => a + b, 0);
  return { path, slot };
}

const MULTIPLIERS: Record<Rows, Record<Risk, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  10: {
    low: [8.9, 3.0, 1.4, 1.1, 0.6, 0.6, 1.1, 1.4, 3.0, 8.9],
    medium: [22, 5, 2, 1.1, 0.5, 0.5, 1.1, 2, 5, 22],
    high: [76, 10, 3, 0.9, 0.3, 0.3, 0.9, 3, 10, 76],
  },
  12: {
    low: [10, 3, 1.6, 1.4, 1.1, 0.5, 0.5, 1.1, 1.4, 1.6, 3, 10],
    medium: [24, 6, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 6, 24],
    high: [120, 14, 4, 1.2, 0.4, 0.2, 0.2, 0.4, 1.2, 4, 14, 120],
  },
  14: {
    low: [12, 3.5, 2, 1.4, 1.1, 0.7, 0.5, 0.5, 0.7, 1.1, 1.4, 2, 3.5, 12],
    medium: [28, 7, 3, 1.5, 0.7, 0.4, 0.3, 0.3, 0.4, 0.7, 1.5, 3, 7, 28],
    high: [220, 20, 5, 1.4, 0.5, 0.2, 0.15, 0.15, 0.2, 0.5, 1.4, 5, 20, 220],
  },
  16: {
    low: [16, 4, 2.2, 1.4, 1.1, 0.8, 0.5, 0.4, 0.4, 0.5, 0.8, 1.1, 1.4, 2.2, 4, 16],
    medium: [35, 9, 3.5, 1.6, 0.7, 0.4, 0.3, 0.2, 0.2, 0.3, 0.4, 0.7, 1.6, 3.5, 9, 35],
    high: [1000, 130, 26, 9, 3, 1, 0.3, 0.2, 0.2, 0.3, 1, 3, 9, 26, 130, 1000],
  },
};

export function getMultipliers(rows: Rows, risk: Risk): number[] {
  return MULTIPLIERS[rows][risk];
}

export function getMultiplier(rows: Rows, risk: Risk, slot: number): number {
  return MULTIPLIERS[rows][risk][slot];
}

export function slotColor(multiplier: number): string {
  if (multiplier >= 100) return '#6B1F2A';
  if (multiplier >= 10) return '#8B2D3A';
  if (multiplier >= 2) return '#3D3D3D';
  if (multiplier >= 1) return '#2A2A2A';
  return '#1A1A1A';
}

export function formatMultiplier(m: number): string {
  if (m >= 1000) return 'x' + (m / 1000).toFixed(m % 1000 === 0 ? 0 : 1) + 'K';
  return 'x' + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(2));
}

export function formatAmount(a: number): string {
  return a.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₽';
}

export function formatShortMult(m: number): string {
  if (m >= 1000) return (m / 1000).toFixed(0) + 'K';
  if (m >= 10) return m.toFixed(0);
  return m.toFixed(m % 1 === 0 ? 0 : 1);
}
