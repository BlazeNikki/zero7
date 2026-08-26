import type { Cell, RoundResult } from './types';

export const GRID_SIZE = 25;
export const RTP = 0.97;
export const MAX_CAP = 24000;

const HEX_CHARS = '0123456789abcdef';

function randomHex(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += HEX_CHARS[Math.floor(Math.random() * 16)];
  }
  return result;
}

export async function genSeeds() {
  const serverSeed = randomHex(64);
  const clientSeed = randomHex(16);
  const serverSeedHash = await sha256Hex(serverSeed);
  return { serverSeed, clientSeed, serverSeedHash };
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function multiplierForRevealed(revealed: number, minesCount: number): number {
  if (revealed === 0) return 1;
  const safeTotal = GRID_SIZE - minesCount;
  if (revealed > safeTotal) return multiplierForRevealed(safeTotal, minesCount);
  let fair = 1;
  for (let i = 0; i < revealed; i++) {
    fair *= (GRID_SIZE - i) / (safeTotal - i);
  }
  return Math.min(fair * RTP, MAX_CAP);
}

export function firstSafeChance(minesCount: number): number {
  return ((GRID_SIZE - minesCount) / GRID_SIZE) * 100;
}

export function generateMinePositions(
  serverSeed: string,
  clientSeed: string,
  roundNumber: number,
  minesCount: number,
): number[] {
  const combined = serverSeed + clientSeed + ':' + roundNumber;
  const bytes = hashString(combined);
  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);
  let byteIdx = 0;
  for (let i = indices.length - 1; i > 0; i--) {
    const byte = bytes[byteIdx % bytes.length];
    byteIdx++;
    const j = byte % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, minesCount).sort((a, b) => a - b);
}

function hashString(input: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    bytes.push(input.charCodeAt(i) & 0xff);
  }
  const result: number[] = [];
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    h1 = Math.imul(h1 ^ b, 2654435761);
    h2 = Math.imul(h2 ^ b, 1597334677);
  }
  for (let i = 0; i < 32; i++) {
    h1 = Math.imul(h1 ^ (h1 >>> 13), 2654435761);
    h2 = Math.imul(h2 ^ (h2 >>> 13), 1597334677);
    result.push((h1 >>> 0) & 0xff);
    result.push((h2 >>> 0) & 0xff);
  }
  return result;
}

export function createGrid(): Cell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    index: i,
    state: 'hidden' as const,
    isMine: false,
  }));
}

export function formatMultiplier(m: number): string {
  return m.toFixed(2) + 'x';
}

export function formatAmount(a: number): string {
  return a.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₽';
}

export function createRoundResult(
  roundId: string,
  minesCount: number,
  revealedCount: number,
  multiplier: number,
  result: 'win' | 'loss',
  payout: number,
  betAmount: number,
  seeds: { serverSeed: string; serverSeedHash: string; clientSeed: string },
): RoundResult {
  return {
    id: roundId,
    minesCount,
    revealedCount,
    multiplier,
    result,
    payout,
    betAmount,
    serverSeed: seeds.serverSeed,
    serverSeedHash: seeds.serverSeedHash,
    clientSeed: seeds.clientSeed,
    timestamp: Date.now(),
  };
}

export const MINES_PRESETS = [1, 3, 5, 7, 10, 15, 20, 24];
