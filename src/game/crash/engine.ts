// Provably Fair-style crash point generation (client-side simulation)
const HEX = '0123456789abcdef';

function randomHex(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
  return s;
}

// Simplified HMAC simulation — not real SHA-256, but deterministic per seed pair
function pseudoHash(serverSeed: string, clientSeed: string, round: number): string {
  const input = `${serverSeed}:${clientSeed}:${round}`;
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  // Build a 13-hex-char string deterministically
  let hex = '';
  let v = Math.abs(h);
  for (let i = 0; i < 13; i++) {
    v = (v * 16807) % 2147483647;
    hex += HEX[v % 16];
  }
  return hex;
}

export function genSeeds() {
  const serverSeed = randomHex(64);
  const serverSeedHash = randomHex(64);
  const clientSeed = randomHex(16);
  return { serverSeed, serverSeedHash, clientSeed };
}

export function calcCrashPoint(serverSeed: string, clientSeed: string, round: number): number {
  const hash = pseudoHash(serverSeed, clientSeed, round);
  // Use the first 2 hex chars as a deterministic "instant crash" roll
  // ~2% chance (value 0x00 or 0x01 out of 0xFF)
  const instantCrashRoll = parseInt(hash.slice(0, 2), 16);
  if (instantCrashRoll <= 5) return 1; // ~2% of 256

  const H = parseInt(hash.slice(2, 15), 16);
  const RTP = 0.97;
  const e = 2 ** 52;
  const raw = Math.floor((100 * e) / (H + 1)) / 100;
  const point = Math.max(1, Math.floor((raw * RTP) * 100) / 100);
  return point;
}

export function multiplierAt(t: number, k = 0.00015): number {
  // Exponential growth: e^(k*t) where t is in ms
  // k=0.00015 → x2 ≈ 4.6s, x5 ≈ 10.7s, x10 ≈ 15.4s
  return Math.max(1, Math.exp(k * t));
}

export function formatMultiplier(m: number): string {
  return m.toFixed(2) + 'x';
}

export function formatAmount(n: number): string {
  if (n === 0) return '0 SOL';
  return n >= 1 ? n.toFixed(3) + ' SOL' : n.toFixed(4) + ' SOL';
}

const NAMES = [
  'Player123', 'LuckyStrike', 'MegaJack', 'BigWinner', 'SpinMaster',
  'GoldRush', 'NeonShark', 'RoyalFlush', 'Alex_92', 'Mara_K',
  'Dmitriy', 'Nika_777', 'Viktor', 'Oleg_T', 'Lena_K',
  'CryptoKing', 'BetMaster', 'ZeroHero', 'HighRoller', 'RiskTaker',
  'FortuneSeeker', 'BlazeIt', 'MoonShot', 'RocketMan', 'SkyDiver',
];

export function genSimPlayers(count: number): import('./types').SimPlayer[] {
  const players: import('./types').SimPlayer[] = [];
  for (let i = 0; i < count; i++) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)] + (i > NAMES.length ? `_${i}` : '');
    players.push({
      id: `sp${i}`,
      name,
      vip: Math.floor(Math.random() * 9) + 1,
      bet: Math.floor(Math.random() * 100 + 1) / 1000,
      cashedOut: false,
      cashoutMultiplier: null,
    });
  }
  return players;
}

// Each sim player has a random cashout target they'll try to hit
export function simPlayerCashoutTarget(): number {
  // Skewed toward lower multipliers
  const r = Math.random();
  if (r < 0.5) return 1.2 + Math.random() * 0.8; // 1.2-2.0
  if (r < 0.8) return 2 + Math.random() * 3; // 2-5
  return 5 + Math.random() * 15; // 5-20
}
