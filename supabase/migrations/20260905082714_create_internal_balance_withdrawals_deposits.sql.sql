-- Internal balances: off-chain player balance for winnings/withdrawals
CREATE TABLE internal_balances (
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('devnet', 'testnet', 'mainnet')),
  balance_sol NUMERIC(18,9) NOT NULL DEFAULT 0,
  total_deposited NUMERIC(18,9) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(18,9) NOT NULL DEFAULT 0,
  total_winnings NUMERIC(18,9) NOT NULL DEFAULT 0,
  total_losses NUMERIC(18,9) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (wallet_address, network)
);

ALTER TABLE internal_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_internal_balance" ON internal_balances FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_internal_balance" ON internal_balances FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_internal_balance" ON internal_balances FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_internal_balance" ON internal_balances FOR DELETE
  TO anon, authenticated USING (true);

-- Deposits: player sends SOL to treasury to top up internal balance
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('devnet', 'testnet', 'mainnet')),
  amount_sol NUMERIC(18,9) NOT NULL CHECK (amount_sol > 0),
  tx_signature TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_deposits" ON deposits FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_deposits" ON deposits FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_deposits" ON deposits FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_deposits" ON deposits FOR DELETE
  TO anon, authenticated USING (true);

CREATE UNIQUE INDEX deposits_tx_signature_unique ON deposits (tx_signature, network);

-- Withdrawal requests: player requests SOL payout from internal balance
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('devnet', 'testnet', 'mainnet')),
  amount_sol NUMERIC(18,9) NOT NULL CHECK (amount_sol > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  tx_signature TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_withdrawals" ON withdrawal_requests FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_withdrawals" ON withdrawal_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_withdrawals" ON withdrawal_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_withdrawals" ON withdrawal_requests FOR DELETE
  TO anon, authenticated USING (true);

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE internal_balances;
ALTER PUBLICATION supabase_realtime ADD TABLE game_history;
ALTER PUBLICATION supabase_realtime ADD TABLE withdrawal_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE deposits;