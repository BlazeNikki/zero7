export const MIN_SOL_BET = 0.001;
export const MAX_SOL_BET = 1;
export const SOL_STEP = 0.001;
export const SOL_LAMPORTS = 1_000_000_000;

export const SOL_PRESETS = [0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 1];

export function formatSol(amount: number): string {
  if (amount === 0) return '0 SOL';
  const fixed = amount >= 1 ? amount.toFixed(3) : amount.toFixed(4);
  return `${parseFloat(fixed)} SOL`;
}

export function formatSolShort(amount: number): string {
  if (amount === 0) return '0';
  return amount >= 1 ? amount.toFixed(2) : amount.toFixed(4);
}

export function clampSolBet(amount: number): number {
  return Math.min(MAX_SOL_BET, Math.max(MIN_SOL_BET, amount));
}

export function solToLamports(sol: number): number {
  return Math.round(sol * SOL_LAMPORTS);
}

export function lamportsToSol(lamports: number): number {
  return lamports / SOL_LAMPORTS;
}
