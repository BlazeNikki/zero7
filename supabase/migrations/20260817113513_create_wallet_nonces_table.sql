/*
# Create wallet_nonces table for wallet authentication

1. New Tables
- `wallet_nonces`: Stores cryptographic nonces used in the wallet sign-to-authenticate flow.
  - `id` (uuid, primary key)
  - `wallet_address` (text, not null) — the wallet address requesting a challenge
  - `nonce` (text, not null) — random nonce to be signed by the wallet
  - `used` (boolean, default false) — whether this nonce has been consumed by a verify call
  - `created_at` (timestamptz, default now()) — for expiry/cleanup

2. Security
- RLS enabled. No policies for anon/authenticated — only the service role (edge functions) can access.
- A nonces table must never be publicly readable/writable, since that would allow replay attacks.
- Edge functions use the service role key which bypasses RLS.

3. Index
- Index on `wallet_address` for fast lookup during verify.
- Index on `created_at` for cleanup of expired nonces.
*/

CREATE TABLE IF NOT EXISTS wallet_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  nonce text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wallet_nonces ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_wallet_nonces_address ON wallet_nonces (wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_nonces_created ON wallet_nonces (created_at);
