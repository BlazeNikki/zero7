/*
# Crypto betting schema: bet status, balance cache, rate limits

## Purpose
Extend the existing game_history table to support the full bet lifecycle
(pending → placed → settled → payout), and add two new tables for
caching wallet balances and enforcing per-wallet rate limits.

## Changes to game_history (existing table)
- Add `bet_status` text column: tracks the bet lifecycle
  ('pending' = created but bet tx not yet confirmed,
   'active' = bet confirmed, game in progress,
   'settled' = game result determined, payout pending,
   'completed' = payout sent and confirmed,
   'failed' = bet or payout failed)
  Defaults to 'pending'.
- Add `bet_status_updated_at` timestamptz: when status last changed
- Add `error_message` text: stores failure reason if any
- Add CHECK constraint on bet_status values
- Add index on bet_status for polling pending/active bets
- Add index on (wallet_address, created_at desc) for user history queries

## New table: balance_cache
Caches the last known SOL balance for a wallet address, with a TTL.
The frontend reads this for instant display; the edge function refreshes
it from the Solana blockchain periodically.
- wallet_address (text, primary key)
- balance_lamports (bigint, not null) — balance in lamports (1 SOL = 1e9 lamports)
- last_updated (timestamptz)
- RLS enabled, no policies — access only via service_role

## New table: rate_limits
Tracks per-wallet request counts for rate limiting. Each row is a
(wallet_address, window_start) pair with an action count.
- id (uuid, primary key)
- wallet_address (text, not null)
- action (text, not null) — e.g. 'bet', 'payout', 'auth'
- window_start (timestamptz, not null) — start of the rate limit window
- count (integer, not null, default 1)
- created_at (timestamptz, default now())
- RLS enabled, no policies — access only via service_role
- Index on (wallet_address, action, window_start) for fast lookups

## Security
- RLS enabled on all new/modified tables
- No policies added for anon/authenticated — all access via service_role
  in edge functions only
*/

-- ============================================================
-- Extend game_history
-- ============================================================

ALTER TABLE public.game_history
  ADD COLUMN IF NOT EXISTS bet_status text NOT NULL DEFAULT 'pending'
    CHECK (bet_status IN ('pending', 'active', 'settled', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS bet_status_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS error_message text;

CREATE INDEX IF NOT EXISTS game_history_bet_status_idx
  ON public.game_history (bet_status);

CREATE INDEX IF NOT EXISTS game_history_wallet_created_idx
  ON public.game_history (wallet_address, created_at DESC);

-- ============================================================
-- balance_cache table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.balance_cache (
  wallet_address text PRIMARY KEY,
  balance_lamports bigint NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.balance_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- rate_limits table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS rate_limits_wallet_action_window_idx
  ON public.rate_limits (wallet_address, action, window_start);