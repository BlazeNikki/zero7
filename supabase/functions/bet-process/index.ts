import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const MIN_BET_SOL = 0.001;
const MAX_BET_SOL = 1;
const LAMPORTS_PER_SOL = 1_000_000_000;

const DEVNET_RPC = "https://api.devnet.solana.com";
const MAINNET_RPC = "https://api.mainnet-beta.solana.com";

// Rate limit: max 30 bets per 60 seconds per wallet
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

// House treasury wallet — payouts are sent from here on devnet.
// On mainnet this would be a funded hot wallet with proper key management.
const HOUSE_TREASURY = Deno.env.get("HOUSE_TREASURY_WALLET") ?? "";

async function rpcRequest(method: string, params: unknown[], useDevnet = true): Promise<unknown> {
  const endpoint = useDevnet ? DEVNET_RPC : MAINNET_RPC;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`RPC error: ${data.error.message}`);
  return data.result;
}

async function getTransactionDetails(signature: string, useDevnet = true): Promise<{
  slot: number;
  fee: number;
  preBalances: number[];
  postBalances: number[];
  meta: { err: unknown | null } | null;
} | null> {
  const result = await rpcRequest("getTransaction", [signature, { encoding: "jsonParsed" }], useDevnet);
  return result as unknown as {
    slot: number;
    fee: number;
    preBalances: number[];
    postBalances: number[];
    meta: { err: unknown | null } | null;
  } | null;
}

async function checkRateLimit(walletAddress: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { data } = await supabase
    .from("rate_limits")
    .select("count")
    .eq("wallet_address", walletAddress)
    .eq("action", "bet")
    .gte("window_start", windowStart);

  const total = (data ?? []).reduce((sum, r) => sum + (r.count as number), 0);
  return total < RATE_LIMIT_MAX;
}

async function recordRateLimit(walletAddress: string): Promise<void> {
  await supabase.from("rate_limits").insert({
    wallet_address: walletAddress,
    action: "bet",
    window_start: new Date().toISOString(),
    count: 1,
  });
}

async function updateBalanceCache(walletAddress: string, lamports: number): Promise<void> {
  await supabase
    .from("balance_cache")
    .upsert({
      wallet_address: walletAddress,
      balance_lamports: lamports,
      last_updated: new Date().toISOString(),
    });
}

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
    const { action } = body;

    if (action === "place-bet") {
      // === PLACE BET ===
      // Client sends: walletAddress, gameSlug, betAmountSol, betTxSignature
      // The client has already signed and sent a SOL transfer tx to the house wallet.
      // We verify the tx on-chain before accepting the bet.

      const { walletAddress, gameSlug, betAmountSol, betTxSignature, useDevnet = true } = body;

      if (!walletAddress || !gameSlug || !betAmountSol || !betTxSignature) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 1. Validate bet amount
      const betLamports = Math.round(betAmountSol * LAMPORTS_PER_SOL);
      if (betAmountSol < MIN_BET_SOL || betAmountSol > MAX_SOL_BET) {
        return new Response(JSON.stringify({ error: `Bet must be between ${MIN_BET_SOL} and ${MAX_BET_SOL} SOL` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. Rate limit check
      const allowed = await checkRateLimit(walletAddress);
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Too many bets." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 3. Replay protection — check if this tx signature was already used
      const { data: existing } = await supabase
        .from("game_history")
        .select("id")
        .eq("bet_tx_signature", betTxSignature)
        .limit(1);

      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({ error: "Transaction already processed (replay protection)" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 4. Verify the transaction on-chain
      const txDetails = await getTransactionDetails(betTxSignature, useDevnet);
      if (!txDetails) {
        // Transaction not found yet — may still be confirming
        // Create a pending record; a separate worker will confirm later
        const { data: betRecord } = await supabase
          .from("game_history")
          .insert({
            wallet_address: walletAddress,
            game_slug: gameSlug,
            bet_amount: betAmountSol,
            currency: "SOL",
            result: "pending",
            payout_amount: 0,
            bet_tx_signature: betTxSignature,
            payout_status: "pending",
            bet_status: "pending",
            error_message: null,
          })
          .select("id")
          .single();

        await recordRateLimit(walletAddress);
        return new Response(JSON.stringify({
          betId: betRecord?.id,
          status: "pending",
          message: "Transaction confirmation pending. Bet will be validated once confirmed.",
        }), {
          status: 202,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 5. Check transaction succeeded
      if (txDetails.meta?.err) {
        const { data: failedRecord } = await supabase
          .from("game_history")
          .insert({
            wallet_address: walletAddress,
            game_slug: gameSlug,
            bet_amount: betAmountSol,
            currency: "SOL",
            result: "loss",
            payout_amount: 0,
            bet_tx_signature: betTxSignature,
            payout_status: "failed",
            bet_status: "failed",
            error_message: "Transaction failed on-chain",
          })
          .select("id")
          .single();

        return new Response(JSON.stringify({
          betId: failedRecord?.id,
          status: "failed",
          error: "Transaction failed on-chain",
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 6. Server-side reconciliation: verify the actual transferred amount
      // Compare pre/post balances for the sender
      const senderPubkeyIndex = 0; // First signer is typically the sender
      const preBalance = txDetails.preBalances[senderPubkeyIndex];
      const postBalance = txDetails.postBalances[senderPubkeyIndex];
      const actualDiff = preBalance - postBalance - txDetails.fee;

      if (actualDiff < betLamports * 0.99) {
        // Allow 1% tolerance for rounding/fees
        const { data: mismatchRecord } = await supabase
          .from("game_history")
          .insert({
            wallet_address: walletAddress,
            game_slug: gameSlug,
            bet_amount: betAmountSol,
            currency: "SOL",
            result: "loss",
            payout_amount: 0,
            bet_tx_signature: betTxSignature,
            payout_status: "failed",
            bet_status: "failed",
            error_message: `Amount mismatch: expected ${betLamports} lamports, got ${actualDiff}`,
          })
          .select("id")
          .single();

        return new Response(JSON.stringify({
          betId: mismatchRecord?.id,
          status: "failed",
          error: "Bet amount does not match transaction",
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 7. Bet validated — create active bet record
      const { data: betRecord } = await supabase
        .from("game_history")
        .insert({
          wallet_address: walletAddress,
          game_slug: gameSlug,
          bet_amount: betAmountSol,
          currency: "SOL",
          result: "pending",
          payout_amount: 0,
          bet_tx_signature: betTxSignature,
          payout_status: "pending",
          bet_status: "active",
          error_message: null,
        })
        .select("id")
        .single();

      await recordRateLimit(walletAddress);

      // Update balance cache
      const balanceLamports = postBalance;
      await updateBalanceCache(walletAddress, balanceLamports);

      return new Response(JSON.stringify({
        betId: betRecord?.id,
        status: "active",
        message: "Bet placed and verified",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "settle-bet") {
      // === SETTLE BET ===
      // Called after game result is determined. Payouts sent from house wallet.
      const { betId, result, payoutAmountSol, multiplier, useDevnet = true } = body;

      if (!betId || !result) {
        return new Response(JSON.stringify({ error: "Missing betId or result" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
        return new Response(JSON.stringify({ error: `Bet already settled (status: ${bet.bet_status})` }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (result === "win" && payoutAmountSol > 0) {
        // Mark as settled, payout pending
        await supabase
          .from("game_history")
          .update({
            result: "win",
            payout_amount: payoutAmountSol,
            multiplier: multiplier ?? null,
            bet_status: "settled",
            bet_status_updated_at: new Date().toISOString(),
            settled_at: new Date().toISOString(),
          })
          .eq("id", betId);

        // Payout would be sent from house wallet via a separate worker
        // For now, mark as completed (devnet: manual transfer or automated)
        return new Response(JSON.stringify({
          betId,
          status: "settled",
          payout: payoutAmountSol,
          message: "Bet settled. Payout pending.",
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

    if (action === "get-history") {
      // === GET BET HISTORY ===
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
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ history }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-balance") {
      // === GET CACHED BALANCE ===
      const { walletAddress } = body;

      if (!walletAddress) {
        return new Response(JSON.stringify({ error: "Missing walletAddress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data } = await supabase
        .from("balance_cache")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      return new Response(JSON.stringify({
        walletAddress,
        balanceLamports: data?.balance_lamports ?? null,
        lastUpdated: data?.last_updated ?? null,
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
