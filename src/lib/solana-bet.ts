import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://arfnwjuxqidefuxgbzyw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const BET_PROCESS_URL = `${SUPABASE_URL}/functions/v1/bet-process`;
const SOL_RPC_PROXY = `${SUPABASE_URL}/functions/v1/solana-rpc`;

// Devnet by default; switch to mainnet when ready
export const USE_DEVNET = true;
export const HOUSE_WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'; // devnet house wallet placeholder

export function getConnection(): Connection {
  return new Connection(SOL_RPC_PROXY, {
    httpHeaders: { apikey: SUPABASE_ANON_KEY },
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
 * Build and send a SOL transfer from the player's wallet to the house wallet.
 * Returns the transaction signature.
 */
export async function sendBetTransaction(
  fromAddress: string,
  amountSol: number,
): Promise<string> {
  const signer = getWalletSigner();
  if (!signer) throw new Error('Wallet not connected or does not support signing');

  const connection = getConnection();
  const fromPubkey = new PublicKey(fromAddress);
  const toPubkey = new PublicKey(HOUSE_WALLET);
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
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}

/**
 * Place a bet: send SOL to house wallet, then call the edge function
 * to verify the transaction and record the bet in Supabase.
 */
export async function placeBet(
  walletAddress: string,
  gameSlug: string,
  amountSol: number,
): Promise<{ betId: string; status: string; message?: string }> {
  // 1. Send the SOL transfer transaction
  const txSignature = await sendBetTransaction(walletAddress, amountSol);

  // 2. Call the edge function to verify and record
  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'place-bet',
      walletAddress,
      gameSlug,
      betAmountSol: amountSol,
      betTxSignature: txSignature,
      useDevnet: USE_DEVNET,
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
  };
}

/**
 * Settle a bet after the game result is determined.
 */
export async function settleBet(
  betId: string,
  result: 'win' | 'loss',
  payoutAmountSol: number,
  multiplier?: number,
): Promise<void> {
  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'settle-bet',
      betId,
      result,
      payoutAmountSol,
      multiplier,
      useDevnet: USE_DEVNET,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to settle bet');
  }
}

/**
 * Get bet history for a wallet from Supabase.
 */
export async function getBetHistory(
  walletAddress: string,
  limit = 20,
  offset = 0,
): Promise<unknown[]> {
  const res = await fetch(BET_PROCESS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'get-history',
      walletAddress,
      limit,
      offset,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get history');
  return data.history ?? [];
}
