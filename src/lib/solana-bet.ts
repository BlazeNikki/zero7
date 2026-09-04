import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://arfnwjuxqidefuxgbzyw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const BET_PROCESS_URL = `${SUPABASE_URL}/functions/v1/bet-process`;
const SOL_RPC_PROXY = `${SUPABASE_URL}/functions/v1/solana-rpc`;

export type SolNetwork = 'devnet' | 'testnet' | 'mainnet';

export const NETWORK_LABELS: Record<SolNetwork, string> = {
  devnet: 'Devnet',
  testnet: 'Testnet',
  mainnet: 'Mainnet',
};

export const NETWORK_COLORS: Record<SolNetwork, string> = {
  devnet: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  testnet: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  mainnet: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

// Visibility: in production, only mainnet is shown to regular users.
// Devnet/testnet are shown when the env flag is set or on localhost.
export const NETWORK_SELECTOR_ENABLED =
  import.meta.env.VITE_ENABLE_NETWORK_SELECTOR === 'true' ||
  import.meta.env.DEV === true ||
  window.location.hostname === 'localhost';

// Treasury wallets per network — fetched from edge function get-config
let treasuryWallets: Partial<Record<SolNetwork, string>> = {};

export async function fetchNetworkConfig(network: SolNetwork): Promise<{
  treasuryWallet: string;
  rpcUrl: string;
  minBet: number;
  maxBet: number;
}> {
  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action: 'get-config', network }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch network config');
  treasuryWallets[network] = data.treasuryWallet;
  return {
    treasuryWallet: data.treasuryWallet,
    rpcUrl: data.rpcUrl,
    minBet: data.minBet,
    maxBet: data.maxBet,
  };
}

function getTreasuryWallet(network: SolNetwork): string {
  const w = treasuryWallets[network];
  if (!w) throw new Error(`Treasury wallet not loaded for ${network}. Call fetchNetworkConfig first.`);
  return w;
}

export function getConnection(network: SolNetwork): Connection {
  // Use the Solana RPC proxy for all networks — the proxy handles routing
  return new Connection(SOL_RPC_PROXY, {
    httpHeaders: { apikey: SUPABASE_ANON_KEY, 'solana-client': network },
    fetch: window.fetch.bind(window),
  });
}

type WalletSigner = {
  publicKey: { toString(): string };
  signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
};

function getWalletSigner(): WalletSigner | null {
  const w = window as unknown as Record<string, unknown>;
  const solflare = w.solflare as (WalletSigner & { isSolflare?: boolean }) | undefined;
  if (solflare?.isSolflare || (solflare && typeof solflare.signAndSendTransaction === 'function')) {
    return solflare;
  }
  const phantom = w.phantom as { solana?: WalletSigner } | undefined;
  if (phantom?.solana && typeof phantom.solana.signAndSendTransaction === 'function') {
    return phantom.solana;
  }
  const solana = w.solana as (WalletSigner & { isSolflare?: boolean }) | undefined;
  if (solana && typeof solana.signAndSendTransaction === 'function') {
    return solana;
  }
  return null;
}

/**
 * Build and send a SOL transfer from the player's wallet to the house treasury.
 * Returns the transaction signature.
 */
export async function sendBetTransaction(
  fromAddress: string,
  amountSol: number,
  network: SolNetwork,
): Promise<string> {
  const signer = getWalletSigner();
  if (!signer) throw new Error('Wallet not connected or does not support transaction signing');

  const connection = getConnection(network);
  const fromPubkey = new PublicKey(fromAddress);
  const toPubkey = new PublicKey(getTreasuryWallet(network));
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: fromPubkey,
    blockhash,
    lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    }),
  );

  const { signature } = await signer.signAndSendTransaction(transaction);

  // Confirm with timeout — devnet can be slow
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}

/**
 * Place a bet: send SOL to treasury, then call the edge function to verify.
 */
export async function placeBet(
  walletAddress: string,
  gameSlug: string,
  amountSol: number,
  network: SolNetwork,
): Promise<{ betId: string; status: string; message?: string; explorerUrl?: string }> {
  const txSignature = await sendBetTransaction(walletAddress, amountSol, network);

  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'place-bet',
      walletAddress,
      gameSlug,
      betAmountSol: amountSol,
      betTxSignature: txSignature,
      network,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to place bet');
  }

  return {
    betId: data.betId,
    status: data.status,
    message: data.message,
    explorerUrl: data.explorerUrl,
  };
}

/**
 * Settle a bet after the game result is determined.
 */
export async function settleBet(
  betId: string,
  result: 'win' | 'loss',
  payoutAmountSol: number,
  multiplier: number | undefined,
  network: SolNetwork,
): Promise<{ status: string; payoutTxSignature?: string; message?: string }> {
  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'settle-bet',
      betId,
      result,
      payoutAmountSol,
      multiplier,
      network,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to settle bet');
  }

  return {
    status: data.status,
    payoutTxSignature: data.payoutTxSignature,
    message: data.message,
  };
}

/**
 * Get bet history for a wallet on a specific network.
 */
export async function getBetHistory(
  walletAddress: string,
  network: SolNetwork,
  limit = 20,
  offset = 0,
): Promise<unknown[]> {
  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'get-history',
      walletAddress,
      limit,
      offset,
      network,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get history');
  return data.history ?? [];
}

/**
 * Get live wallet balance from blockchain via edge function.
 */
export async function getWalletBalance(
  walletAddress: string,
  network: SolNetwork,
): Promise<{ balanceLamports: number | null; balanceSol: number | null; cached?: boolean }> {
  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'get-balance',
      walletAddress,
      network,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get balance');
  return {
    balanceLamports: data.balanceLamports,
    balanceSol: data.balanceSol,
    cached: data.cached,
  };
}

/**
 * Generate a Solana Explorer URL for a transaction on the given network.
 */
export function getExplorerUrl(signature: string, network: SolNetwork): string {
  const cluster = network === 'mainnet' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}
