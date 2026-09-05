import { createClient } from "npm:@supabase/supabase-js@2";

// bet-process edge function: multi-network Solana bet lifecycle
// Handles: place-bet, settle-bet (with treasury payout), get-history, get-balance, get-config

// ============================================================
// CORS — mandatory on every response
// ============================================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ============================================================
// Config
// ============================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const MIN_BET_SOL = 0.001;
const MAX_BET_SOL = 1;
const LAMPORTS_PER_SOL = 1_000_000_000;

// Rate limit: max 30 bets per 60 seconds per wallet per network
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

// Tx confirmation: retry config for devnet flakiness
const CONFIRM_RETRY_MAX = 3;
const CONFIRM_RETRY_DELAY_MS = 2000;
const CONFIRM_TIMEOUT_MS = 30_000;

// ============================================================
// Network configuration
// ============================================================
type Network = "devnet" | "testnet" | "mainnet";

type NetworkConfig = {
  rpc: string;
  treasuryWallet: string;
  treasuryKeypairEnv: string;
};

const NETWORKS: Record<Network, NetworkConfig> = {
  devnet: {
    rpc: "https://api.devnet.solana.com",
    treasuryWallet: Deno.env.get("HOUSE_TREASURY_WALLET_DEVNET") ?? Deno.env.get("HOUSE_TREASURY_WALLET") ?? "",
    treasuryKeypairEnv: "HOUSE_TREASURY_KEYPAIR_DEVNET",
  },
  testnet: {
    rpc: "https://api.testnet.solana.com",
    treasuryWallet: Deno.env.get("HOUSE_TREASURY_WALLET_TESTNET") ?? "",
    treasuryKeypairEnv: "HOUSE_TREASURY_KEYPAIR_TESTNET",
  },
  mainnet: {
    rpc: "https://api.mainnet-beta.solana.com",
    treasuryWallet: Deno.env.get("HOUSE_TREASURY_WALLET_MAINNET") ?? "",
    treasuryKeypairEnv: "HOUSE_TREASURY_KEYPAIR_MAINNET",
  },
};

function getNetworkConfig(network: string): NetworkConfig {
  const n = network as Network;
  if (!NETWORKS[n]) throw new Error(`Unknown network: ${network}`);
  return NETWORKS[n];
}

// ============================================================
// Logging — structured with tx signatures for Solana Explorer
// ============================================================
function log(level: "INFO" | "WARN" | "ERROR", msg: string, context: Record<string, unknown> = {}): void {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    message: msg,
    ...context,
  };
  const prefix = level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;
  prefix(JSON.stringify(entry));
}

function explorerUrl(signature: string, network: Network): string {
  const cluster = network === "mainnet" ? "" : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

// ============================================================
// Solana RPC helpers
// ============================================================
async function rpcRequest(method: string, params: unknown[], rpcUrl: string): Promise<unknown> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) {
    throw new Error(`RPC HTTP error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(`RPC error: ${data.error.message}`);
  return data.result;
}

type TxDetails = {
  slot: number;
  fee: number;
  preBalances: number[];
  postBalances: number[];
  meta: { err: unknown | null } | null;
};

async function getTransactionDetails(signature: string, rpcUrl: string): Promise<TxDetails | null> {
  const result = await rpcRequest("getTransaction", [signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }], rpcUrl);
  return result as unknown as TxDetails | null;
}

async function getBalanceLamports(address: string, rpcUrl: string): Promise<number> {
  const result = await rpcRequest("getBalance", [address], rpcUrl);
  return (result as { value: number }).value;
}

// ============================================================
// Treasury payout: send SOL from house wallet to player
// ============================================================
async function sendPayoutFromTreasury(
  toAddress: string,
  amountLamports: number,
  network: Network,
): Promise<string> {
  const config = getNetworkConfig(network);

  // Load treasury keypair from env (base58-encoded secret key array)
  const keypairEnv = Deno.env.get(config.treasuryKeypairEnv);
  if (!keypairEnv) {
    log("ERROR", "Treasury keypair not configured", { network, envVar: config.treasuryKeypairEnv });
    throw new Error("Payout service not configured for this network");
  }

  // Dynamically import Solana web3.js for signing
  const { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, Keypair } =
    await import("npm:@solana/web3.js@1.98.4");

  const connection = new Connection(config.rpc, "confirmed");
  const treasuryPubkey = new PublicKey(config.treasuryWallet);

  // Check treasury balance before sending
  const treasuryBalance = await connection.getBalance(treasuryPubkey);
  const needed = amountLamports + 5000; // amount + estimated fee
  if (treasuryBalance < needed) {
    log("ERROR", "Insufficient treasury balance for payout", {
      network,
      treasuryBalance,
      needed,
      toAddress,
      amountLamports,
    });
    throw new Error("Insufficient treasury balance for payout. Please contact support.");
  }

  // Parse keypair from base58 secret key
  let treasuryKeypair: InstanceType<typeof Keypair>;
  try {
    const secretKey = JSON.parse(keypairEnv) as number[];
    treasuryKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
  } catch {
    log("ERROR", "Failed to parse treasury keypair", { network });
    throw new Error("Treasury keypair configuration error");
  }

  const toPubkey = new PublicKey(toAddress);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: treasuryPubkey,
    blockhash,
    lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey: treasuryPubkey,
      toPubkey,
      lamports: amountLamports,
    }),
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [treasuryKeypair], {
    commitment: "confirmed",
  });

  log("INFO", "Payout sent from treasury", {
    network,
    signature,
    toAddress,
    amountLamports,
    explorerUrl: explorerUrl(signature, network),
  });

  return signature;
}

// ============================================================
// Tx confirmation with retry for devnet flakiness
// ============================================================
async function confirmTransactionWithRetry(
  signature: string,
  rpcUrl: string,
  network: Network,
): Promise<TxDetails | null> {
  for (let attempt = 1; attempt <= CONFIRM_RETRY_MAX; attempt++) {
    try {
      const details = await getTransactionDetails(signature, rpcUrl);
      if (details) {
        log("INFO", "Transaction confirmed", {
          network,
          signature,
          attempt,
          slot: details.slot,
          explorerUrl: explorerUrl(signature, network),
        });
        return details;
      }
      log("WARN", "Transaction not found yet, retrying", {
        network,
        signature,
        attempt,
        nextDelayMs: CONFIRM_RETRY_DELAY_MS,
      });
    } catch (err) {
      log("WARN", "RPC error during confirmation retry", {
        network,
        signature,
        attempt,
        error: (err as Error).message,
      });
    }
    if (attempt < CONFIRM_RETRY_MAX) {
      await new Promise((r) => setTimeout(r, CONFIRM_RETRY_DELAY_MS));
    }
  }
  return null;
}

// ============================================================
// Rate limiting
// ============================================================
async function checkRateLimit(walletAddress: string, network: Network): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { data, error } = await supabase
    .from("rate_limits")
    .select("count")
    .eq("wallet_address", walletAddress)
    .eq("action", "bet")
    .eq("network", network)
    .gte("window_start", windowStart);

  if (error) {
    log("ERROR", "Rate limit check failed", { walletAddress, network, error: error.message });
    return true; // fail open — don't block on DB error
  }

  const total = (data ?? []).reduce((sum, r) => sum + (r.count as number), 0);
  return total < RATE_LIMIT_MAX;
}

async function recordRateLimit(walletAddress: string, network: Network): Promise<void> {
  await supabase.from("rate_limits").insert({
    wallet_address: walletAddress,
    action: "bet",
    network,
    window_start: new Date().toISOString(),
    count: 1,
  });
}

// ============================================================
// Balance cache
// ============================================================
async function updateBalanceCache(walletAddress: string, lamports: number, network: Network): Promise<void> {
  await supabase
    .from("balance_cache")
    .upsert({
      wallet_address: walletAddress,
      network,
      balance_lamports: lamports,
      last_updated: new Date().toISOString(),
    });
}

// ============================================================
// Main handler
// ============================================================
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { action, network: networkParam = "devnet" } = body;

    const network = networkParam as Network;
    if (!NETWORKS[network]) {
      return new Response(JSON.stringify({ error: `Invalid network. Use: devnet, testnet, or mainnet` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config = getNetworkConfig(network);

    // ============================================================
    // Action: place-bet
    // ============================================================
    if (action === "place-bet") {
      const { walletAddress, gameSlug, betAmountSol, betTxSignature } = body;

      if (!walletAddress || !gameSlug || !betAmountSol || !betTxSignature) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      log("INFO", "Place bet request", { walletAddress, gameSlug, betAmountSol, network, betTxSignature });

      // 1. Validate bet amount
      const betLamports = Math.round(betAmountSol * LAMPORTS_PER_SOL);
      if (betAmountSol < MIN_BET_SOL || betAmountSol > MAX_BET_SOL) {
        log("WARN", "Bet amount out of range", { walletAddress, betAmountSol, network });
        return new Response(JSON.stringify({ error: `Bet must be between ${MIN_BET_SOL} and ${MAX_BET_SOL} SOL` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. Rate limit check
      const allowed = await checkRateLimit(walletAddress, network);
      if (!allowed) {
        log("WARN", "Rate limit exceeded", { walletAddress, network });
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Too many bets. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 3. Replay protection — DB-level unique index on (bet_tx_signature, network)
      const { data: existing } = await supabase
        .from("game_history")
        .select("id, bet_status")
        .eq("bet_tx_signature", betTxSignature)
        .eq("network", network)
        .limit(1);

      if (existing && existing.length > 0) {
        log("WARN", "Replay attempt — duplicate tx signature", { walletAddress, betTxSignature, network, existingId: existing[0].id });
        return new Response(JSON.stringify({ error: "This transaction has already been processed." }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 4. Verify the transaction on-chain (with retry for devnet)
      const txDetails = await confirmTransactionWithRetry(betTxSignature, config.rpc, network);

      if (!txDetails) {
        // Transaction not confirmed yet — create pending record for later processing
        log("INFO", "Transaction not yet confirmed, creating pending record", { walletAddress, betTxSignature, network });
        const { data: betRecord } = await supabase
          .from("game_history")
          .insert({
            wallet_address: walletAddress,
            game_slug: gameSlug,
            bet_amount: betAmountSol,
            currency: "SOL",
            network,
            result: "pending",
            payout_amount: 0,
            bet_tx_signature: betTxSignature,
            payout_status: "pending",
            bet_status: "pending",
            error_message: null,
          })
          .select("id")
          .single();

        await recordRateLimit(walletAddress, network);
        return new Response(JSON.stringify({
          betId: betRecord?.id,
          status: "pending",
          message: "Transaction is confirming on the blockchain. Your bet will be validated shortly.",
          explorerUrl: explorerUrl(betTxSignature, network),
        }), {
          status: 202,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 5. Check transaction succeeded
      if (txDetails.meta?.err) {
        log("ERROR", "Transaction failed on-chain", { walletAddress, betTxSignature, network, err: txDetails.meta.err });
        await supabase.from("game_history").insert({
          wallet_address: walletAddress,
          game_slug: gameSlug,
          bet_amount: betAmountSol,
          currency: "SOL",
          network,
          result: "loss",
          payout_amount: 0,
          bet_tx_signature: betTxSignature,
          payout_status: "failed",
          bet_status: "failed",
          error_message: "Transaction failed on-chain",
        });
        return new Response(JSON.stringify({ error: "The blockchain transaction failed. No SOL was deducted." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 6. Server-side reconciliation: verify the actual transferred amount
      const senderPubkeyIndex = 0;
      const preBalance = txDetails.preBalances[senderPubkeyIndex];
      const postBalance = txDetails.postBalances[senderPubkeyIndex];
      const actualDiff = preBalance - postBalance - txDetails.fee;

      if (actualDiff < betLamports * 0.99) {
        log("ERROR", "Amount mismatch", { walletAddress, betTxSignature, network, expected: betLamports, actual: actualDiff });
        await supabase.from("game_history").insert({
          wallet_address: walletAddress,
          game_slug: gameSlug,
          bet_amount: betAmountSol,
          currency: "SOL",
          network,
          result: "loss",
          payout_amount: 0,
          bet_tx_signature: betTxSignature,
          payout_status: "failed",
          bet_status: "failed",
          error_message: `Amount mismatch: expected ${betLamports} lamports, got ${actualDiff}`,
        });
        return new Response(JSON.stringify({ error: "The transferred amount does not match the bet amount." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 7. Bet validated — create active bet record
      const { data: betRecord, error: insertError } = await supabase
        .from("game_history")
        .insert({
          wallet_address: walletAddress,
          game_slug: gameSlug,
          bet_amount: betAmountSol,
          currency: "SOL",
          network,
          result: "pending",
          payout_amount: 0,
          bet_tx_signature: betTxSignature,
          payout_status: "pending",
          bet_status: "active",
          error_message: null,
        })
        .select("id")
        .single();

      if (insertError) {
        // Could be a unique constraint violation from a concurrent request (same tx signature)
        log("ERROR", "Failed to create bet record", { walletAddress, betTxSignature, network, error: insertError.message });
        return new Response(JSON.stringify({ error: "Failed to place bet. Please try again." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await recordRateLimit(walletAddress, network);
      await updateBalanceCache(walletAddress, postBalance, network);

      log("INFO", "Bet placed and verified", {
        betId: betRecord?.id,
        walletAddress,
        gameSlug,
        betAmountSol,
        network,
        betTxSignature,
        explorerUrl: explorerUrl(betTxSignature, network),
      });

      return new Response(JSON.stringify({
        betId: betRecord?.id,
        status: "active",
        message: "Bet placed and verified on-chain.",
        explorerUrl: explorerUrl(betTxSignature, network),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // Action: settle-bet (credits internal balance, no on-chain payout)
    // ============================================================
    if (action === "settle-bet") {
      const { betId, result, payoutAmountSol, multiplier } = body;

      if (!betId || !result) {
        return new Response(JSON.stringify({ error: "Missing betId or result" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      log("INFO", "Settle bet request", { betId, result, payoutAmountSol, multiplier, network });

      const { data: bet } = await supabase
        .from("game_history")
        .select("*")
        .eq("id", betId)
        .single();

      if (!bet) {
        return new Response(JSON.stringify({ error: "Bet not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (bet.bet_status !== "active") {
        log("WARN", "Settle attempt on non-active bet", { betId, currentStatus: bet.bet_status });
        return new Response(JSON.stringify({ error: `Bet already settled (status: ${bet.bet_status})` }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (result === "win" && payoutAmountSol > 0) {
        // Mark as settled (idempotency: prevent double-credit)
        const { data: updated, error: updateErr } = await supabase
          .from("game_history")
          .update({
            result: "win",
            payout_amount: payoutAmountSol,
            multiplier: multiplier ?? null,
            bet_status: "completed",
            bet_status_updated_at: new Date().toISOString(),
            settled_at: new Date().toISOString(),
            payout_status: "confirmed",
          })
          .eq("id", betId)
          .eq("bet_status", "active")
          .select("id");

        if (updateErr || !updated || updated.length === 0) {
          log("WARN", "Settle race — bet not active", { betId, error: updateErr?.message });
          return new Response(JSON.stringify({ error: "Bet already settled" }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Credit internal balance atomically
        const { data: balRow } = await supabase
          .from("internal_balances")
          .select("balance_sol, total_winnings")
          .eq("wallet_address", bet.wallet_address)
          .eq("network", network)
          .single();

        const newBalance = (balRow?.balance_sol ?? 0) + payoutAmountSol;
        const newWinnings = (balRow?.total_winnings ?? 0) + payoutAmountSol;

        await supabase
          .from("internal_balances")
          .upsert({
            wallet_address: bet.wallet_address,
            network,
            balance_sol: newBalance,
            total_winnings: newWinnings,
            updated_at: new Date().toISOString(),
          });

        log("INFO", "Bet settled — internal balance credited", {
          betId,
          walletAddress: bet.wallet_address,
          payoutAmountSol,
          newBalance,
          network,
        });

        return new Response(JSON.stringify({
          betId,
          status: "completed",
          payout: payoutAmountSol,
          internalBalance: newBalance,
          message: "You won! Winnings credited to your internal balance.",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        // Loss
        await supabase
          .from("game_history")
          .update({
            result: "loss",
            payout_amount: 0,
            multiplier: multiplier ?? null,
            bet_status: "completed",
            bet_status_updated_at: new Date().toISOString(),
            settled_at: new Date().toISOString(),
            payout_status: "confirmed",
          })
          .eq("id", betId);

        // Track losses in internal_balances
        const { data: balRow } = await supabase
          .from("internal_balances")
          .select("total_losses")
          .eq("wallet_address", bet.wallet_address)
          .eq("network", network)
          .single();

        const newLosses = (balRow?.total_losses ?? 0) + bet.bet_amount;
        await supabase
          .from("internal_balances")
          .upsert({
            wallet_address: bet.wallet_address,
            network,
            total_losses: newLosses,
            updated_at: new Date().toISOString(),
          });

        log("INFO", "Bet settled as loss", { betId, walletAddress: bet.wallet_address, network });

        return new Response(JSON.stringify({
          betId,
          status: "completed",
          message: "Bet settled as loss",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============================================================
    // Action: deposit (verify on-chain tx, credit internal balance)
    // ============================================================
    if (action === "deposit") {
      const { walletAddress, amountSol, txSignature } = body;

      if (!walletAddress || !amountSol || !txSignature) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      log("INFO", "Deposit request", { walletAddress, amountSol, txSignature, network });

      const depositLamports = Math.round(amountSol * LAMPORTS_PER_SOL);

      // Replay protection
      const { data: existing } = await supabase
        .from("deposits")
        .select("id, status")
        .eq("tx_signature", txSignature)
        .eq("network", network)
        .limit(1);

      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({ error: "This deposit has already been processed." }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify on-chain
      const txDetails = await confirmTransactionWithRetry(txSignature, config.rpc, network);
      if (!txDetails) {
        // Create pending record
        await supabase.from("deposits").insert({
          wallet_address: walletAddress,
          network,
          amount_sol: amountSol,
          tx_signature: txSignature,
          status: "pending",
        });
        return new Response(JSON.stringify({
          status: "pending",
          message: "Transaction is confirming. Your deposit will be credited shortly.",
        }), {
          status: 202,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (txDetails.meta?.err) {
        await supabase.from("deposits").insert({
          wallet_address: walletAddress,
          network,
          amount_sol: amountSol,
          tx_signature: txSignature,
          status: "failed",
        });
        return new Response(JSON.stringify({ error: "Transaction failed on-chain" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify amount
      const senderPubkeyIndex = 0;
      const preBalance = txDetails.preBalances[senderPubkeyIndex];
      const postBalance = txDetails.postBalances[senderPubkeyIndex];
      const actualDiff = preBalance - postBalance - txDetails.fee;

      if (actualDiff < depositLamports * 0.99) {
        await supabase.from("deposits").insert({
          wallet_address: walletAddress,
          network,
          amount_sol: amountSol,
          tx_signature: txSignature,
          status: "failed",
        });
        return new Response(JSON.stringify({ error: "Deposit amount mismatch" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Credit internal balance
      const { data: balRow } = await supabase
        .from("internal_balances")
        .select("balance_sol, total_deposited")
        .eq("wallet_address", walletAddress)
        .eq("network", network)
        .single();

      const newBalance = (balRow?.balance_sol ?? 0) + amountSol;
      const newDeposited = (balRow?.total_deposited ?? 0) + amountSol;

      await supabase
        .from("internal_balances")
        .upsert({
          wallet_address: walletAddress,
          network,
          balance_sol: newBalance,
          total_deposited: newDeposited,
          updated_at: new Date().toISOString(),
        });

      await supabase.from("deposits").insert({
        wallet_address: walletAddress,
        network,
        amount_sol: amountSol,
        tx_signature: txSignature,
        status: "confirmed",
        processed_at: new Date().toISOString(),
      });

      log("INFO", "Deposit confirmed", { walletAddress, amountSol, txSignature, network, newBalance });

      return new Response(JSON.stringify({
        status: "confirmed",
        internalBalance: newBalance,
        message: "Deposit confirmed. Internal balance updated.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // Action: request-withdrawal (create pending request, debit balance)
    // ============================================================
    if (action === "request-withdrawal") {
      const { walletAddress, amountSol } = body;

      if (!walletAddress || !amountSol) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (amountSol < MIN_BET_SOL) {
        return new Response(JSON.stringify({ error: `Minimum withdrawal is ${MIN_BET_SOL} SOL` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check internal balance
      const { data: balRow } = await supabase
        .from("internal_balances")
        .select("balance_sol")
        .eq("wallet_address", walletAddress)
        .eq("network", network)
        .single();

      const currentBalance = balRow?.balance_sol ?? 0;
      if (currentBalance < amountSol) {
        return new Response(JSON.stringify({ error: `Insufficient internal balance. Available: ${currentBalance} SOL` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Debit internal balance immediately (hold funds)
      const newBalance = currentBalance - amountSol;
      await supabase
        .from("internal_balances")
        .upsert({
          wallet_address: walletAddress,
          network,
          balance_sol: newBalance,
          updated_at: new Date().toISOString(),
        });

      // Create withdrawal request
      const { data: withdrawal, error: wErr } = await supabase
        .from("withdrawal_requests")
        .insert({
          wallet_address: walletAddress,
          network,
          amount_sol: amountSol,
          status: "pending",
        })
        .select("id")
        .single();

      if (wErr) {
        // Refund the debit if insert failed
        await supabase
          .from("internal_balances")
          .upsert({
            wallet_address: walletAddress,
            network,
            balance_sol: currentBalance,
            updated_at: new Date().toISOString(),
          });
        return new Response(JSON.stringify({ error: "Failed to create withdrawal request" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      log("INFO", "Withdrawal requested", { withdrawalId: withdrawal?.id, walletAddress, amountSol, network });

      // Attempt to process immediately
      try {
        const withdrawLamports = Math.round(amountSol * LAMPORTS_PER_SOL);
        const payoutSignature = await sendPayoutFromTreasury(walletAddress, withdrawLamports, network);

        await supabase
          .from("withdrawal_requests")
          .update({
            status: "processed",
            tx_signature: payoutSignature,
            processed_at: new Date().toISOString(),
          })
          .eq("id", withdrawal!.id);

        const newWithdrawn = (balRow?.total_withdrawn ?? 0) + amountSol;
        await supabase
          .from("internal_balances")
          .upsert({
            wallet_address: walletAddress,
            network,
            total_withdrawn: newWithdrawn,
            updated_at: new Date().toISOString(),
          });

        log("INFO", "Withdrawal processed", { withdrawalId: withdrawal?.id, walletAddress, amountSol, payoutSignature, network });

        return new Response(JSON.stringify({
          withdrawalId: withdrawal?.id,
          status: "processed",
          txSignature: payoutSignature,
          internalBalance: newBalance,
          explorerUrl: explorerUrl(payoutSignature, network),
          message: "Withdrawal processed. SOL sent to your wallet.",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (payoutErr) {
        // Payout failed — refund internal balance, mark as failed
        await supabase
          .from("withdrawal_requests")
          .update({
            status: "failed",
            error_message: (payoutErr as Error).message,
            processed_at: new Date().toISOString(),
          })
          .eq("id", withdrawal!.id);

        // Refund
        await supabase
          .from("internal_balances")
          .upsert({
            wallet_address: walletAddress,
            network,
            balance_sol: currentBalance,
            updated_at: new Date().toISOString(),
          });

        log("ERROR", "Withdrawal payout failed", { withdrawalId: withdrawal?.id, error: (payoutErr as Error).message });

        return new Response(JSON.stringify({
          withdrawalId: withdrawal?.id,
          status: "failed",
          internalBalance: currentBalance,
          message: `Withdrawal failed: ${(payoutErr as Error).message}. Internal balance refunded.`,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============================================================
    // Action: get-internal-balance
    // ============================================================
    if (action === "get-internal-balance") {
      const { walletAddress } = body;

      if (!walletAddress) {
        return new Response(JSON.stringify({ error: "Missing walletAddress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: balRow } = await supabase
        .from("internal_balances")
        .select("*")
        .eq("wallet_address", walletAddress)
        .eq("network", network)
        .single();

      return new Response(JSON.stringify({
        walletAddress,
        network,
        balanceSol: balRow?.balance_sol ?? 0,
        totalDeposited: balRow?.total_deposited ?? 0,
        totalWithdrawn: balRow?.total_withdrawn ?? 0,
        totalWinnings: balRow?.total_winnings ?? 0,
        totalLosses: balRow?.total_losses ?? 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // Action: get-withdrawals
    // ============================================================
    if (action === "get-withdrawals") {
      const { walletAddress, limit = 20, offset = 0 } = body;

      if (!walletAddress) {
        return new Response(JSON.stringify({ error: "Missing walletAddress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: withdrawals, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("wallet_address", walletAddress)
        .eq("network", network)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return new Response(JSON.stringify({ error: "Failed to retrieve withdrawals" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ withdrawals }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // Action: get-deposits
    // ============================================================
    if (action === "get-deposits") {
      const { walletAddress, limit = 20, offset = 0 } = body;

      if (!walletAddress) {
        return new Response(JSON.stringify({ error: "Missing walletAddress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: deposits, error } = await supabase
        .from("deposits")
        .select("*")
        .eq("wallet_address", walletAddress)
        .eq("network", network)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return new Response(JSON.stringify({ error: "Failed to retrieve deposits" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ deposits }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // Action: get-history
    // ============================================================
    if (action === "get-history") {
      const { walletAddress, limit = 20, offset = 0 } = body;

      if (!walletAddress) {
        return new Response(JSON.stringify({ error: "Missing walletAddress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: history, error } = await supabase
        .from("game_history")
        .select("*")
        .eq("wallet_address", walletAddress)
        .eq("network", network)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        log("ERROR", "History query failed", { walletAddress, network, error: error.message });
        return new Response(JSON.stringify({ error: "Failed to retrieve history" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ history }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // Action: get-balance
    // ============================================================
    if (action === "get-balance") {
      const { walletAddress } = body;

      if (!walletAddress) {
        return new Response(JSON.stringify({ error: "Missing walletAddress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch live balance from blockchain
      try {
        const lamports = await getBalanceLamports(walletAddress, config.rpc);
        await updateBalanceCache(walletAddress, lamports, network);
        return new Response(JSON.stringify({
          walletAddress,
          network,
          balanceLamports: lamports,
          balanceSol: lamports / LAMPORTS_PER_SOL,
          lastUpdated: new Date().toISOString(),
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        log("ERROR", "Live balance fetch failed", { walletAddress, network, error: (err as Error).message });
        // Fall back to cached balance
        const { data } = await supabase
          .from("balance_cache")
          .select("*")
          .eq("wallet_address", walletAddress)
          .eq("network", network)
          .single();
        return new Response(JSON.stringify({
          walletAddress,
          network,
          balanceLamports: data?.balance_lamports ?? null,
          lastUpdated: data?.last_updated ?? null,
          cached: true,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============================================================
    // Action: get-config
    // ============================================================
    if (action === "get-config") {
      const treasuryConfigured = !!Deno.env.get(config.treasuryKeypairEnv);
      return new Response(JSON.stringify({
        network,
        treasuryWallet: config.treasuryWallet,
        treasuryConfigured,
        rpcUrl: config.rpc,
        minBet: MIN_BET_SOL,
        maxBet: MAX_BET_SOL,
        rateLimit: { max: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    log("ERROR", "Unhandled error in bet-process", { error: (err as Error).message, stack: (err as Error).stack });
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
