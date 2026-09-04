/*
# Add network column to game_history and balance_cache

## Purpose
Support multi-network operation (devnet, testnet, mainnet) so bets and
cached balances are tagged with the Solana network they belong to.
This prevents devnet/testnet bets from mixing with mainnet history.

## Changes to game_history (existing table)
- Add `network` text column: 'devnet' | 'testnet' | 'mainnet'
  Defaults to 'devnet'. NOT NULL.
- Add CHECK constraint on network values
- Add index on (wallet_address, network, created_at desc) for per-network history queries
- Add unique index on (bet_tx_signature, network) to enforce replay protection per network

## Changes to balance_cache (existing table)
- Add `network` text column: 'devnet' | 'testnet' | 'mainnet'
  Defaults to 'devnet'. NOT NULL.
- Change primary key from (wallet_address) to (wallet_address, network) composite
  so the same wallet can have separate cached balances per network

## Security
- No policy changes. RLS remains enabled, access via service_role only.
*/

-- game_history: add network column
ALTER TABLE public.game_history
  ADD COLUMN IF NOT EXISTS network text NOT NULL DEFAULT 'devnet'
    CHECK (network IN ('devnet', 'testnet', 'mainnet'));

CREATE INDEX IF NOT EXISTS game_history_wallet_network_created_idx
  ON public.game_history (wallet_address, network, created_at DESC);

-- Unique constraint: one bet per tx signature per network (replay protection at DB level)
CREATE UNIQUE INDEX IF NOT EXISTS game_history_tx_signature_network_unique
  ON public.game_history (bet_tx_signature, network)
  WHERE bet_tx_signature IS NOT NULL;

-- balance_cache: add network column and change PK to composite
ALTER TABLE public.balance_cache
  ADD COLUMN IF NOT EXISTS network text NOT NULL DEFAULT 'devnet'
    CHECK (network IN ('devnet', 'testnet', 'mainnet'));

-- Drop old PK and create composite PK
ALTER TABLE public.balance_cache
  DROP CONSTRAINT IF EXISTS balance_cache_pkey;

ALTER TABLE public.balance_cache
  ADD CONSTRAINT balance_cache_pkey PRIMARY KEY (wallet_address, network);
