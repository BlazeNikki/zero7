/*
# Drop Unused Demo Tables + Recreate game_history

## Context
Security audit confirmed that 17 tables from the original demo template
are never referenced in code. Real data comes from Directus and local
TypeScript data files. Only wallet_nonces is used (by auth-wallet Edge
Function). All 17 tables are dropped here, then game_history is recreated
with a proper schema for real game bet history.

## Row counts before drop (for audit log)
- balances: 1
- bonuses: 4
- chat_messages: 8
- faq_items: 4
- finance_history: 7
- game_history: 8
- games: 7
- notifications: 4
- profiles: 1
- referrals: 1
- responsible_limits: 1
- sessions: 3
- support_tickets: 2
- tournaments: 3
- verification_docs: 4
- vip_program: 1
- winners: 5

## Dropped tables
All 17 tables below. CASCADE is used to remove dependent objects cleanly.
wallet_nonces is NOT dropped.
*/

DROP TABLE IF EXISTS public.balances CASCADE;
DROP TABLE IF EXISTS public.bonuses CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.faq_items CASCADE;
DROP TABLE IF EXISTS public.finance_history CASCADE;
DROP TABLE IF EXISTS public.game_history CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.responsible_limits CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.verification_docs CASCADE;
DROP TABLE IF EXISTS public.vip_program CASCADE;
DROP TABLE IF EXISTS public.winners CASCADE;

-- ============================================================
-- Recreate game_history with proper schema
-- ============================================================

CREATE TABLE public.game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  profile_id text,
  game_slug text NOT NULL,
  bet_amount numeric NOT NULL CHECK (bet_amount > 0),
  currency text NOT NULL DEFAULT 'SOL',
  result text NOT NULL CHECK (result IN ('win', 'loss', 'pending')),
  payout_amount numeric NOT NULL DEFAULT 0 CHECK (payout_amount >= 0),
  multiplier numeric,
  bet_tx_signature text,
  payout_tx_signature text,
  payout_status text NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'confirmed', 'failed')),
  server_seed_hash text,
  server_seed_revealed text,
  client_seed text,
  nonce integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz
);

CREATE INDEX game_history_wallet_idx ON public.game_history (wallet_address);
CREATE INDEX game_history_game_idx ON public.game_history (game_slug);
CREATE INDEX game_history_created_idx ON public.game_history (created_at DESC);

ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
-- No policies: access only via service_role key from Edge Functions.