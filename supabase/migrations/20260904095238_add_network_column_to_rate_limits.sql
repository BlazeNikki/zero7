/*
# Add network column to rate_limits

## Purpose
The edge function filters rate_limits by network to enforce per-network
rate limiting. This migration adds the column and corresponding index.

## Changes to rate_limits (existing table)
- Add `network` text column: 'devnet' | 'testnet' | 'mainnet'
  Defaults to 'devnet'. NOT NULL.
- Add CHECK constraint on network values
- Replace the existing rate_limits_wallet_action_window_idx index with
  one that includes the network column

## Security
- No policy changes. RLS remains enabled, access via service_role only.
*/

ALTER TABLE public.rate_limits
  ADD COLUMN IF NOT EXISTS network text NOT NULL DEFAULT 'devnet'
    CHECK (network IN ('devnet', 'testnet', 'mainnet'));

DROP INDEX IF EXISTS public.rate_limits_wallet_action_window_idx;
CREATE INDEX IF NOT EXISTS rate_limits_wallet_action_network_window_idx
  ON public.rate_limits (wallet_address, action, network, window_start);
